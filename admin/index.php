<?php
declare(strict_types=1);
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
header('Referrer-Policy: same-origin');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
$v = (string)@filemtime(__DIR__ . '/assets/admin.js') . (string)@filemtime(__DIR__ . '/assets/admin.css');
?><!doctype html>
<html lang="ru" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Админка · F/FOLIO</title>
  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Martian+Mono:wght@500;600;700&family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/admin.css?v=<?= htmlspecialchars($v) ?>">
  <script src="assets/admin.js?v=<?= htmlspecialchars($v) ?>" defer></script>
</head>
<body>
  <div class="boot" id="boot"><span class="boot__logo">F/FOLIO</span></div>

  <!-- Вход -->
  <main class="login" id="loginView" hidden>
    <form class="login__card" id="loginForm" autocomplete="on">
      <a class="logo" href="../" title="На сайт"><span class="logo__mark"><svg viewBox="3.5 7.5 33 27"><path class="lm-body" d="M4 11.5A3.5 3.5 0 0 1 7.5 8h8.2l3.6 3.6h13.2A3.5 3.5 0 0 1 36 15.1v15.4a3.5 3.5 0 0 1-3.5 3.5h-25A3.5 3.5 0 0 1 4 30.5z"/><path class="lm-tab" d="M7.5 8h8.2l3.6 3.6H4A3.5 3.5 0 0 1 7.5 8z"/><path class="lm-f" d="M11 17h9.5v3.6h-5.4v2.6h4.6v3.6h-4.6V31H11z"/><path class="lm-f" d="M22.5 31h3.8l4.4-14h-3.8z"/></svg></span><span>F<b>/</b>FOLIO <small>админка</small></span></a>
      <h1 id="loginTitle">Вход</h1>
      <p class="muted" id="loginHint">Введите пароль администратора.</p>
      <input type="text" name="username" value="admin" autocomplete="username" hidden>
      <label class="field"><span>Пароль</span><input type="password" id="loginPass" autocomplete="current-password" required></label>
      <label class="field" id="loginRepeatField" hidden><span>Повторите пароль</span><input type="password" id="loginRepeat" autocomplete="new-password"></label>
      <p class="form-error" id="loginError" role="alert"></p>
      <button class="btn btn--accent btn--block" type="submit" id="loginBtn">Войти</button>
    </form>
  </main>

  <!-- Приложение -->
  <div class="shell" id="appView" hidden>
    <aside class="side">
      <a class="logo" href="../" target="_blank" rel="noopener" title="Открыть сайт"><span class="logo__mark"><svg viewBox="3.5 7.5 33 27"><path class="lm-body" d="M4 11.5A3.5 3.5 0 0 1 7.5 8h8.2l3.6 3.6h13.2A3.5 3.5 0 0 1 36 15.1v15.4a3.5 3.5 0 0 1-3.5 3.5h-25A3.5 3.5 0 0 1 4 30.5z"/><path class="lm-tab" d="M7.5 8h8.2l3.6 3.6H4A3.5 3.5 0 0 1 7.5 8z"/><path class="lm-f" d="M11 17h9.5v3.6h-5.4v2.6h4.6v3.6h-4.6V31H11z"/><path class="lm-f" d="M22.5 31h3.8l4.4-14h-3.8z"/></svg></span><span>F<b>/</b>FOLIO <small>админка</small></span></a>
      <nav class="side__nav" id="sideNav" aria-label="Разделы"></nav>
      <div class="side__foot">
        <button class="side__link" type="button" id="themeBtn"></button>
        <button class="side__link" type="button" id="logoutBtn"></button>
      </div>
    </aside>

    <section class="main">
      <header class="topbar">
        <div>
          <h1 id="viewTitle">Работы</h1>
          <p class="status" id="status"></p>
        </div>
        <div class="topbar__actions">
          <a class="btn btn--ghost" href="../" target="_blank" rel="noopener" id="openSite"></a>
          <button class="btn btn--ghost" type="button" data-act="preview" id="previewBtn" title="Сайт с несохранёнными правками — обновляется сам"></button>
          <button class="btn btn--accent" type="button" id="saveBtn"></button>
        </div>
      </header>
      <div class="view" id="view"></div>
    </section>
  </div>

  <!-- Редактор записи -->
  <div class="drawer" id="drawer" hidden>
    <div class="drawer__backdrop" data-act="drawer-close"></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
      <header class="drawer__head">
        <h2 id="drawerTitle">Работа</h2>
        <button class="icon-btn" type="button" data-act="drawer-close" aria-label="Закрыть" id="drawerClose"></button>
      </header>
      <div class="drawer__body" id="drawerBody"></div>
      <footer class="drawer__foot">
        <button class="btn btn--danger-ghost" type="button" data-act="drawer-delete" id="drawerDelete">Удалить</button>
        <div class="drawer__foot-actions">
          <button class="btn btn--ghost" type="button" data-act="drawer-preview" id="drawerPreview" title="Открыть эту запись на сайте с несохранёнными правками"></button>
          <button class="btn btn--accent" type="button" data-act="drawer-close">Готово</button>
        </div>
      </footer>
    </aside>
  </div>

  <dialog class="confirm" id="confirmDlg">
    <form method="dialog">
      <p id="confirmText"></p>
      <div class="confirm__actions">
        <button class="btn btn--ghost" value="cancel">Отмена</button>
        <button class="btn btn--accent" value="ok" id="confirmOk">Да</button>
      </div>
    </form>
  </dialog>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
</body>
</html>
