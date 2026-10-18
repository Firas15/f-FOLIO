<?php
/*
 * JSON API админки. Все запросы: api.php?action=...
 * Изменяющие запросы — только POST, только после входа и с CSRF-токеном.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

start_session();

$action = (string)($_GET['action'] ?? '');
$isPost = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
$body = [];
if ($isPost) {
    require_same_origin();
    if (str_starts_with((string)($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
        $body = json_decode((string)file_get_contents('php://input'), true);
        if (!is_array($body)) fail('Неверный JSON');
    }
}

// Без входа доступны только эти действия
$public = ['session', 'login', 'setup'];
if (!in_array($action, $public, true)) {
    require_auth();
    if ($isPost) require_csrf();
}
$needPost = ['login', 'setup', 'logout', 'save', 'upload', 'password', 'restore', 'cleanup'];
if (in_array($action, $needPost, true) && !$isPost) fail('Нужен POST', 405);

switch ($action) {
    case 'session':
        $has = password_hash_stored() !== null;
        json_out([
            'authed' => is_authed(),
            'hasPassword' => $has,
            'setupAllowed' => !$has && is_local_request(),
            'csrf' => is_authed() ? $_SESSION['csrf'] : null,
        ]);

    case 'setup':
        // Первый пароль можно задать только с этого компьютера (localhost),
        // чтобы на хостинге никто не успел сделать это раньше вас.
        if (password_hash_stored() !== null) fail('Пароль уже задан', 409);
        if (!is_local_request()) fail('Первый пароль задаётся локально: запустите сайт на компьютере или выполните php admin/set-password.php', 403);
        store_password((string)($body['password'] ?? ''));
        login_succeeded();
        json_out(['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'login':
        $hash = password_hash_stored();
        if ($hash === null) fail('Пароль ещё не задан', 409);
        if ($left = login_locked_for()) fail('Слишком много попыток. Подождите ' . (int)ceil($left / 60) . ' мин.', 429);
        if (!password_verify((string)($body['password'] ?? ''), $hash)) {
            login_failed();
            usleep(400000);
            fail('Неверный пароль', 401);
        }
        if (password_needs_rehash($hash, PASSWORD_DEFAULT)) store_password((string)$body['password']);
        login_succeeded();
        json_out(['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'logout':
        $_SESSION = [];
        session_destroy();
        json_out(['ok' => true]);

    case 'data':
        json_out(['data' => read_data(), 'version' => data_version()]);

    case 'save':
        $version = (string)($body['version'] ?? '');
        if (empty($body['force']) && $version !== data_version()) {
            fail('Данные изменились в другой вкладке или на другом устройстве', 409, ['conflict' => true]);
        }
        $clean = sanitize_data($body['data'] ?? null);
        $newVersion = write_data($clean);
        json_out(['ok' => true, 'data' => $clean, 'version' => $newVersion]);

    case 'upload':
        $folder = (string)($_POST['folder'] ?? 'projects');
        if (!in_array($folder, ['projects', 'achievements', 'profile'], true)) fail('Неизвестная папка');
        if (empty($_FILES['file'])) fail('Файл не получен. Возможно, он больше лимита сервера (post_max_size).');
        json_out(['ok' => true, 'file' => save_upload($_FILES['file'], $folder)]);

    case 'password':
        $hash = password_hash_stored();
        if ($hash === null || !password_verify((string)($body['current'] ?? ''), $hash)) fail('Текущий пароль неверный', 400);
        store_password((string)($body['next'] ?? ''));
        session_regenerate_id(true);
        json_out(['ok' => true]);

    case 'backups':
        $list = array_map(fn($f) => [
            'name' => basename($f),
            'time' => date('c', filemtime($f) ?: time()),
            'size' => filesize($f),
        ], list_backups());
        json_out(['backups' => $list]);

    case 'restore':
        $name = (string)($body['name'] ?? '');
        if (!preg_match('~^\d{8}-\d{6}-[0-9a-f]{4}\.json$~', $name) || !is_file(BACKUP_DIR . '/' . $name)) fail('Копия не найдена', 404);
        $data = json_decode((string)file_get_contents(BACKUP_DIR . '/' . $name), true);
        $clean = sanitize_data($data);
        $version = write_data($clean);
        json_out(['ok' => true, 'data' => $clean, 'version' => $version]);

    case 'unused':
        $files = unused_uploads(read_data());
        json_out(['files' => $files, 'size' => array_sum(array_column($files, 'size'))]);

    case 'cleanup':
        $removed = 0;
        foreach (unused_uploads(read_data()) as $f) {
            $abs = realpath(SITE_ROOT . '/' . $f['path']);
            $base = realpath(UPLOADS_DIR);
            if ($abs && $base && str_starts_with($abs, $base . DIRECTORY_SEPARATOR) && @unlink($abs)) $removed++;
        }
        json_out(['ok' => true, 'removed' => $removed]);

    default:
        fail('Неизвестное действие', 404);
}
