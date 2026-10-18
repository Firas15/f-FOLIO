<?php
/*
 * Общие функции админки: хранение данных, проверка входа, загрузка картинок.
 * Без базы данных: контент лежит в data/portfolio.js (чистый JSON после
 * «window.PORTFOLIO =»), служебные файлы — в admin/storage/.
 */
declare(strict_types=1);

date_default_timezone_set('Europe/Moscow');

const SITE_ROOT = __DIR__ . '/..';
const DATA_FILE = SITE_ROOT . '/data/portfolio.js';
const STORAGE = __DIR__ . '/storage';
const AUTH_FILE = STORAGE . '/auth.php';
const ATTEMPTS_FILE = STORAGE . '/attempts.php';
const BACKUP_DIR = STORAGE . '/backups';
const UPLOADS_DIR = SITE_ROOT . '/assets/img/uploads';
const UPLOADS_URL = 'assets/img/uploads';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1920;   // шире — уменьшаем (высоту не трогаем: длинные скриншоты остаются целыми)
const BACKUPS_KEEP = 40;
const LOGIN_MAX_TRIES = 5;
const LOGIN_LOCK_SECONDS = 600;
const SESSION_IDLE_SECONDS = 8 * 3600;
const MIN_PASSWORD_LENGTH = 8;

const CONTACT_TYPES = ['telegram', 'email', 'github', 'vk', 'link'];
const ACH_TYPES = ['diploma', 'certificate', 'conference', 'showcase'];

/* ---------- Ответы ---------- */

function json_out(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $code = 400, array $extra = []): never
{
    json_out(['error' => $message] + $extra, $code);
}

/* ---------- Файлы ---------- */

function atomic_write(string $path, string $content): void
{
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Не удалось создать папку ' . basename($dir), 500);
    }
    $tmp = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, $content, LOCK_EX) === false) {
        fail('Нет прав на запись: ' . basename($path) . '. Проверьте права на папку на хостинге.', 500);
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        fail('Не удалось сохранить ' . basename($path), 500);
    }
}

/** Служебные файлы — PHP, который возвращает массив: даже открытые по прямой ссылке, они ничего не покажут. */
function php_store_read(string $path): array
{
    if (!is_file($path)) return [];
    $v = include $path;
    return is_array($v) ? $v : [];
}

function php_store_write(string $path, array $data): void
{
    atomic_write($path, "<?php\nreturn " . var_export($data, true) . ";\n");
    if (function_exists('opcache_invalidate')) @opcache_invalidate($path, true);
}

/* ---------- Данные портфолио ---------- */

function read_raw_data(): string
{
    $raw = is_file(DATA_FILE) ? file_get_contents(DATA_FILE) : false;
    if ($raw === false) fail('Файл data/portfolio.js не найден', 500);
    return $raw;
}

function parse_data(string $raw): array
{
    $start = strpos($raw, '{');
    $end = strrpos($raw, '}');
    if ($start === false || $end === false) fail('В data/portfolio.js нет данных', 500);
    $data = json_decode(substr($raw, $start, $end - $start + 1), true);
    if (!is_array($data)) {
        fail('data/portfolio.js правили руками, и там больше не JSON: ' . json_last_error_msg() . '. Восстановите файл или версию из «Настроек».', 500);
    }
    return $data;
}

function read_data(): array
{
    return parse_data(read_raw_data());
}

function data_version(): string
{
    return is_file(DATA_FILE) ? sha1_file(DATA_FILE) : '';
}

function encode_data(array $data): string
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    return "/* Данные портфолио. Удобнее всего править через админку (/admin/). Если правите руками, после «window.PORTFOLIO =» должен остаться чистый JSON. */\n"
        . "window.PORTFOLIO = " . $json . "\n;\n";
}

/** Сохраняет данные, перед этим кладёт текущую версию в резервные копии. */
function write_data(array $data): string
{
    if (is_file(DATA_FILE)) {
        if (!is_dir(BACKUP_DIR)) @mkdir(BACKUP_DIR, 0775, true);
        $name = date('Ymd-His') . '-' . bin2hex(random_bytes(2)) . '.json';
        $current = json_encode(parse_data(read_raw_data()), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        @file_put_contents(BACKUP_DIR . '/' . $name, $current, LOCK_EX);
        prune_backups();
    }
    atomic_write(DATA_FILE, encode_data($data));
    clearstatcache();
    return data_version();
}

function list_backups(): array
{
    $files = glob(BACKUP_DIR . '/*.json') ?: [];
    rsort($files);
    return $files;
}

function prune_backups(): void
{
    foreach (array_slice(list_backups(), BACKUPS_KEEP) as $old) @unlink($old);
}

/* ---------- Проверка и очистка данных ---------- */

function cut(string $s, int $max): string
{
    if (function_exists('mb_substr')) return mb_substr($s, 0, $max, 'UTF-8');
    return preg_match('/^.{0,' . $max . '}/us', $s, $m) ? $m[0] : substr($s, 0, $max);
}

function clean_str(mixed $v, int $max = 300): string
{
    if (!is_string($v) && !is_int($v) && !is_float($v)) return '';
    $v = (string)$v;
    if (!preg_match('//u', $v)) return '';                  // не UTF-8
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return cut(trim($v), $max);
}

function clean_url(mixed $v): string
{
    $v = clean_str($v, 500);
    if ($v === '') return '';
    if (preg_match('~^(https?://|mailto:|tel:|tg://)~i', $v)) return $v;
    if (preg_match('~^#[\w-]*$~u', $v)) return $v;
    // «example.ru» без протокола — допишем https://
    if (preg_match('~^[\w.-]+\.[a-z]{2,}(/\S*)?$~iu', $v)) return 'https://' . $v;
    return '';
}

function clean_img(mixed $v): string
{
    $v = clean_str($v, 300);
    if (str_contains($v, '..')) return '';
    return preg_match('~^assets/img/[\w\-./]+\.(webp|jpe?g|png|gif|svg)$~i', $v) ? $v : '';
}

function clean_id(mixed $v): string
{
    $v = strtolower(clean_str($v, 60));
    $v = trim((string)preg_replace('~[^a-z0-9_-]+~', '-', $v), '-');
    return $v !== '' ? $v : 'item-' . bin2hex(random_bytes(3));
}

function clean_list(mixed $v, callable $fn, int $max): array
{
    if (!is_array($v)) return [];
    $out = [];
    foreach ($v as $item) {
        $c = $fn($item);
        if ($c === '' || $c === null) continue;
        $out[] = $c;
        if (count($out) >= $max) break;
    }
    return $out;
}

function unique_ids(array $items): array
{
    $seen = [];
    foreach ($items as &$it) {
        $id = $it['id'];
        $n = 2;
        while (isset($seen[$id])) $id = $it['id'] . '-' . $n++;
        $it['id'] = $id;
        $seen[$id] = true;
    }
    return $items;
}

function sanitize_data(mixed $in): array
{
    if (!is_array($in)) fail('Неверный формат данных');
    $p = is_array($in['profile'] ?? null) ? $in['profile'] : [];
    $study = is_array($p['study'] ?? null) ? $p['study'] : [];
    $work = is_array($p['work'] ?? null) ? $p['work'] : [];
    $tz = clean_str($p['timezone'] ?? '', 60);
    if (!in_array($tz, timezone_identifiers_list(), true)) $tz = 'Europe/Moscow';
    $tag = fn($t) => clean_str($t, 40);

    $profile = [
        'firstName' => clean_str($p['firstName'] ?? '', 60),
        'lastName' => clean_str($p['lastName'] ?? '', 60),
        'role' => clean_str($p['role'] ?? '', 80),
        'city' => clean_str($p['city'] ?? '', 80),
        'timezone' => $tz,
        'photo' => clean_img($p['photo'] ?? ''),
        'status' => clean_str($p['status'] ?? '', 120),
        'quote' => clean_str($p['quote'] ?? '', 300),
        'study' => [
            'place' => clean_str($study['place'] ?? '', 120),
            'program' => clean_str($study['program'] ?? '', 160),
            'short' => clean_str($study['short'] ?? '', 20),
            'level' => clean_str($study['level'] ?? '', 60),
        ],
        'work' => [
            'company' => clean_str($work['company'] ?? '', 120),
            'url' => clean_url($work['url'] ?? ''),
            'city' => clean_str($work['city'] ?? '', 80),
            'about' => clean_str($work['about'] ?? '', 160),
        ],
        'skills' => clean_list($p['skills'] ?? [], $tag, 30),
    ];

    $contacts = clean_list($in['contacts'] ?? [], function ($c) {
        if (!is_array($c)) return null;
        $type = in_array($c['type'] ?? '', CONTACT_TYPES, true) ? $c['type'] : 'link';
        $value = clean_str($c['value'] ?? '', 120);
        $url = clean_url($c['url'] ?? '');
        if ($value === '' && $url === '') return null;
        return ['type' => $type, 'label' => clean_str($c['label'] ?? '', 40), 'value' => $value, 'url' => $url];
    }, 20);

    $projects = clean_list($in['projects'] ?? [], function ($x) use ($tag) {
        if (!is_array($x)) return null;
        $title = clean_str($x['title'] ?? '', 120);
        return [
            'id' => clean_id($x['id'] ?? $title),
            'title' => $title !== '' ? $title : 'Без названия',
            'url' => clean_url($x['url'] ?? ''),
            'domain' => clean_str($x['domain'] ?? '', 120),
            'category' => clean_str($x['category'] ?? '', 80),
            'tags' => clean_list($x['tags'] ?? [], $tag, 12),
            'short' => clean_str($x['short'] ?? '', 220),
            'description' => clean_str($x['description'] ?? '', 3000),
            'images' => clean_list($x['images'] ?? [], 'clean_img', 40),
            'featured' => !empty($x['featured']),
            'hidden' => !empty($x['hidden']),
        ];
    }, 200);

    $achievements = clean_list($in['achievements'] ?? [], function ($x) {
        if (!is_array($x)) return null;
        $title = clean_str($x['title'] ?? '', 200);
        return [
            'id' => clean_id($x['id'] ?? $title),
            'type' => in_array($x['type'] ?? '', ACH_TYPES, true) ? $x['type'] : 'diploma',
            'title' => $title !== '' ? $title : 'Без названия',
            'org' => clean_str($x['org'] ?? '', 200),
            'date' => clean_str($x['date'] ?? '', 40),
            'images' => clean_list($x['images'] ?? [], 'clean_img', 40),
            'hidden' => !empty($x['hidden']),
        ];
    }, 300);

    $slots = (int)($in['upcomingSlots'] ?? 0);

    return [
        'profile' => $profile,
        'contacts' => $contacts,
        'projects' => unique_ids($projects),
        'upcomingSlots' => max(0, min(6, $slots)),
        'achievements' => unique_ids($achievements),
    ];
}

/* ---------- Сессия и вход ---------- */

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function start_session(): void
{
    $path = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/api.php'), '/\\') . '/';
    session_name('fx_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => $path,
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    ini_set('session.use_strict_mode', '1');
    session_start();
    if (!empty($_SESSION['auth']) && time() - (int)($_SESSION['last'] ?? 0) > SESSION_IDLE_SECONDS) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    if (!empty($_SESSION['auth'])) $_SESSION['last'] = time();
}

function is_authed(): bool
{
    return !empty($_SESSION['auth']);
}

function password_hash_stored(): ?string
{
    $h = php_store_read(AUTH_FILE)['hash'] ?? null;
    return is_string($h) && $h !== '' ? $h : null;
}

function store_password(string $password): void
{
    if (strlen($password) < MIN_PASSWORD_LENGTH) fail('Пароль должен быть не короче ' . MIN_PASSWORD_LENGTH . ' символов');
    php_store_write(AUTH_FILE, ['hash' => password_hash($password, PASSWORD_DEFAULT), 'changed' => date('c')]);
}

function is_local_request(): bool
{
    return in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
}

function client_ip(): string
{
    return (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

/** Сколько секунд ещё действует блокировка для этого IP (0 — не заблокирован). */
function login_locked_for(): int
{
    $a = php_store_read(ATTEMPTS_FILE)[client_ip()] ?? null;
    return $a ? max(0, (int)$a['until'] - time()) : 0;
}

function login_failed(): void
{
    $all = php_store_read(ATTEMPTS_FILE);
    $now = time();
    foreach ($all as $ip => $a) {                 // чистим старые записи
        if ((int)$a['until'] < $now && $now - (int)$a['at'] > 3600) unset($all[$ip]);
    }
    $a = $all[client_ip()] ?? ['n' => 0, 'until' => 0, 'at' => $now];
    $a['n'] = (int)$a['n'] + 1;
    $a['at'] = $now;
    if ($a['n'] >= LOGIN_MAX_TRIES) {
        $a['until'] = $now + LOGIN_LOCK_SECONDS;
        $a['n'] = 0;
    }
    $all[client_ip()] = $a;
    php_store_write(ATTEMPTS_FILE, $all);
}

function login_succeeded(): void
{
    $all = php_store_read(ATTEMPTS_FILE);
    unset($all[client_ip()]);
    php_store_write(ATTEMPTS_FILE, $all);
    session_regenerate_id(true);
    $_SESSION['auth'] = true;
    $_SESSION['last'] = time();
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function require_auth(): void
{
    if (!is_authed()) fail('Нужно войти заново', 401);
}

function require_csrf(): void
{
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        fail('Сессия устарела, обновите страницу', 403);
    }
}

/** Запросы, меняющие данные, принимаем только с этого же сайта. */
function require_same_origin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return;
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if (parse_url($origin, PHP_URL_HOST) . (parse_url($origin, PHP_URL_PORT) ? ':' . parse_url($origin, PHP_URL_PORT) : '') !== $host) {
        fail('Запрос с чужого сайта отклонён', 403);
    }
}

/* ---------- Картинки ---------- */

/**
 * Принимает загруженный файл, проверяет, что это картинка, и сохраняет его
 * в assets/img/uploads/<папка>/. Если на хостинге есть GD, приводит к WebP
 * и уменьшает слишком широкие изображения.
 */
function save_upload(array $file, string $folder): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $map = [
            UPLOAD_ERR_INI_SIZE => 'Файл больше лимита сервера (upload_max_filesize)',
            UPLOAD_ERR_FORM_SIZE => 'Файл слишком большой',
            UPLOAD_ERR_PARTIAL => 'Файл загрузился не полностью',
            UPLOAD_ERR_NO_FILE => 'Файл не выбран',
        ];
        fail($map[$file['error'] ?? 4] ?? 'Ошибка загрузки файла');
    }
    if (!is_uploaded_file($file['tmp_name'])) fail('Ошибка загрузки файла');
    if ($file['size'] > MAX_UPLOAD_BYTES) fail('Файл больше ' . (MAX_UPLOAD_BYTES >> 20) . ' МБ');

    $info = @getimagesize($file['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
    if (!$info || !isset($types[$info[2]])) fail('Это не картинка (подходят JPG, PNG, WebP, GIF)');
    [$w, $h, $type] = $info;

    $dir = UPLOADS_DIR . '/' . $folder;
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) fail('Не удалось создать папку для загрузок', 500);
    $base = date('Ymd') . '-' . bin2hex(random_bytes(5));

    $canConvert = $type !== IMAGETYPE_GIF && function_exists('imagewebp') && function_exists('imagecreatefromstring');
    if ($canConvert) {
        @ini_set('memory_limit', '512M');
        $img = @imagecreatefromstring((string)file_get_contents($file['tmp_name']));
        if ($img) {
            $img = fix_orientation($img, $file['tmp_name'], $type);
            if (imagesx($img) > MAX_IMAGE_WIDTH) {
                $scaled = imagescale($img, MAX_IMAGE_WIDTH, -1, IMG_BICUBIC);
                if ($scaled) { imagedestroy($img); $img = $scaled; }
            }
            if (!imageistruecolor($img)) imagepalettetotruecolor($img);
            imagealphablending($img, false);
            imagesavealpha($img, true);
            $name = $base . '.webp';
            $ok = imagewebp($img, $dir . '/' . $name, 84);
            $w = imagesx($img);
            $h = imagesy($img);
            imagedestroy($img);
            if ($ok) return ['path' => UPLOADS_URL . "/$folder/$name", 'width' => $w, 'height' => $h];
        }
    }
    $name = $base . '.' . $types[$type];
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) fail('Не удалось сохранить файл', 500);
    return ['path' => UPLOADS_URL . "/$folder/$name", 'width' => $w, 'height' => $h];
}

/** Фото с телефона часто «лежат на боку» — поворачиваем по EXIF. */
function fix_orientation(\GdImage $img, string $path, int $type): \GdImage
{
    if ($type !== IMAGETYPE_JPEG || !function_exists('exif_read_data')) return $img;
    $o = (int)(@exif_read_data($path)['Orientation'] ?? 1);
    $angle = [3 => 180, 6 => -90, 8 => 90][$o] ?? 0;
    if (!$angle) return $img;
    $r = imagerotate($img, $angle, 0);
    if ($r) { imagedestroy($img); return $r; }
    return $img;
}

/** Файлы из uploads, на которые больше ничего не ссылается. */
function unused_uploads(array $data): array
{
    if (!is_dir(UPLOADS_DIR)) return [];
    $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $out = [];
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(UPLOADS_DIR, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $f) {
        if (!$f->isFile() || !preg_match('~\.(webp|jpe?g|png|gif)$~i', $f->getFilename())) continue;
        $rel = UPLOADS_URL . '/' . str_replace('\\', '/', substr($f->getPathname(), strlen(UPLOADS_DIR) + 1));
        if (!str_contains($json, '"' . $rel . '"')) $out[] = ['path' => $rel, 'size' => $f->getSize()];
    }
    return $out;
}
