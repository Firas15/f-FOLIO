<?php
/*
 * Задать или сбросить пароль админки из консоли:
 *   php admin/set-password.php
 */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require __DIR__ . '/lib.php';

function fail_cli(string $m): never
{
    fwrite(STDERR, $m . PHP_EOL);
    exit(1);
}

echo 'Новый пароль (не короче ' . MIN_PASSWORD_LENGTH . ' символов): ';
$p1 = trim((string)fgets(STDIN));
echo 'Повторите пароль: ';
$p2 = trim((string)fgets(STDIN));
if ($p1 !== $p2) fail_cli('Пароли не совпадают');
if (strlen($p1) < MIN_PASSWORD_LENGTH) fail_cli('Слишком короткий пароль');
if (!is_dir(STORAGE)) mkdir(STORAGE, 0775, true);
file_put_contents(AUTH_FILE, "<?php\nreturn " . var_export(['hash' => password_hash($p1, PASSWORD_DEFAULT), 'changed' => date('c')], true) . ";\n");
@unlink(ATTEMPTS_FILE);
echo "Готово: пароль сохранён в admin/storage/auth.php" . PHP_EOL;
