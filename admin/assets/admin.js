/* =========================================================
   Админка портфолио: работы, достижения, профиль, контакты.
   Все правки копятся в памяти и уходят на сервер кнопкой
   «Сохранить» (или Ctrl+S).
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const imgUrl = (p) => (p ? "../" + p : "");
  const uid = (prefix) => prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const MAX_UPLOAD = 15 * 1024 * 1024;

  try {
    const t = localStorage.getItem("theme");
    root.dataset.theme = t === "light" || t === "dark" ? t : matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {}

  /* ---------- Иконки ---------- */
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    works: svg('<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
    at: svg('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    grip: svg('<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>'),
    star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
    eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: svg('<path d="M10.7 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
    up: svg('<path d="m18 15-6-6-6 6"/>'),
    down: svg('<path d="m6 9 6 6 6-6"/>'),
    left: svg('<path d="m15 18-6-6 6-6"/>'),
    right: svg('<path d="m9 18 6-6-6-6"/>'),
    trash: svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'),
    x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    upload: svg('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
    ext: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
    image: svg('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    save: svg('<path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M7 3v5h8M7 21v-7h10v7"/>'),
    history: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'),
    download: svg('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'),
  };

  const VIEWS = {
    works: { title: "Работы", icon: I.works },
    achievements: { title: "Достижения", icon: I.trophy },
    profile: { title: "Профиль", icon: I.user },
    contacts: { title: "Контакты", icon: I.at },
    settings: { title: "Настройки", icon: I.gear },
  };
  const CONTACT_TYPES = { telegram: "Telegram", email: "Почта", github: "GitHub", vk: "ВКонтакте", link: "Ссылка" };
  // типы достижений правятся в «Достижениях» и хранятся в данных; эти — если их там ещё нет
  const ACH_TYPES_DEFAULT = [
    { id: "diploma", plural: "Дипломы", single: "Диплом" },
    { id: "certificate", plural: "Сертификаты", single: "Сертификат" },
    { id: "conference", plural: "Конференции", single: "Конференция" },
    { id: "showcase", plural: "Шоукейсы", single: "Шоукейс" },
  ];
  const ACH_TYPES_MAX = 12;
  // { id: «Диплом» } — для выпадающего списка и подписей
  const achTypeNames = () => Object.fromEntries(S.data.achievementTypes.map((t) => [t.id, t.single || t.plural || "Без названия"]));
  const PROJECT_STATUS = { live: "Уже работает", dev: "В разработке" };
  const PROJECT_KINDS = { site: "Сайт", app: "Приложение", bot: "Бот", db: "База данных", module: "Модуль" };
  // цифры под именем на первом экране
  const FACT_KINDS = { projects: "Число работ (авто)", live: "Работающих сайтов (авто)", achievements: "Число достижений (авто)", custom: "Свой текст" };
  const FACT_WORDS = { projects: ["проект", "проекта", "проектов"], live: ["сайт работает", "сайта работают", "сайтов работают"], achievements: ["достижение", "достижения", "достижений"] };
  const FACTS_MAX = 4;
  const plural = (n, [one, few, many]) => {
    const a = n % 10;
    const b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  };

  /* ---------- Состояние ---------- */
  const S = {
    data: null,
    version: "",
    csrf: "",
    dirty: false,
    saving: false,
    view: "works",
    edit: null, // { list: "projects" | "achievements", id }
    pending: {}, // загружающиеся файлы: { [itemKey]: [{ id, name, progress }] }
  };

  /* ---------- Сервер ---------- */
  async function api(action, { method = "GET", body } = {}) {
    const headers = {};
    if (S.csrf) headers["X-CSRF-Token"] = S.csrf;
    if (body) headers["Content-Type"] = "application/json";
    let res;
    try {
      res = await fetch("api.php?action=" + action, { method, headers, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" });
    } catch {
      throw Object.assign(new Error("Нет связи с сервером"), { status: 0 });
    }
    let json = {};
    try { json = await res.json(); } catch {}
    if (!res.ok) {
      const err = Object.assign(new Error(json.error || "Ошибка сервера (" + res.status + ")"), { status: res.status, data: json });
      if (res.status === 401 && action !== "login") onSessionLost();
      throw err;
    }
    return json;
  }

  function uploadFile(file, folder, onProgress) {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "api.php?action=upload");
      xhr.setRequestHeader("X-CSRF-Token", S.csrf);
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
      xhr.onload = () => {
        let j = {};
        try { j = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status === 401) onSessionLost();
        xhr.status === 200 && j.file ? resolve(j.file) : reject(new Error(j.error || "Не удалось загрузить " + file.name));
      };
      xhr.onerror = () => reject(new Error("Нет связи с сервером"));
      xhr.send(fd);
    });
  }

  /* ---------- Мелочи интерфейса ---------- */
  let toastTimer;
  function toast(msg, type = "ok") {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast is-show toast--" + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), type === "error" ? 5000 : 2600);
  }

  function confirmBox(text, okLabel = "Да", danger = false) {
    const dlg = $("#confirmDlg");
    $("#confirmText").textContent = text;
    const ok = $("#confirmOk");
    ok.textContent = okLabel;
    ok.className = "btn " + (danger ? "btn--danger" : "btn--accent");
    dlg.returnValue = "";
    dlg.showModal();
    return new Promise((resolve) => dlg.addEventListener("close", () => resolve(dlg.returnValue === "ok"), { once: true }));
  }

  const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  function setPath(obj, path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] == null ? (o[k] = {}) : o[k]), obj);
    target[last] = value;
  }
  // путь с «@» — поле записи, открытой в редакторе
  const scopeFor = (path) => (path.startsWith("@") ? [currentItem(), path.slice(1)] : [S.data, path]);
  const readField = (path) => { const [o, p] = scopeFor(path); return o ? getPath(o, p) : undefined; };
  const writeField = (path, v) => { const [o, p] = scopeFor(path); if (o) setPath(o, p, v); };

  function domainOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  }
  function autoContactUrl(type, value) {
    const v = (value || "").trim();
    if (!v) return "";
    if (type === "email") return "mailto:" + v;
    if (type === "telegram") return "https://t.me/" + v.replace(/^@/, "");
    if (type === "github") return "https://github.com/" + v.replace(/^@/, "");
    if (type === "vk") return "https://vk.com/" + v.replace(/^@/, "");
    return /^https?:\/\//.test(v) ? v : "";
  }

  /* ---------- Данные ---------- */
  function normalize(d) {
    d = d && typeof d === "object" ? d : {};
    d.profile = d.profile || {};
    d.profile.study = d.profile.study || {};
    d.profile.work = d.profile.work || {};
    d.profile.skills = Array.isArray(d.profile.skills) ? d.profile.skills : [];
    d.contacts = Array.isArray(d.contacts) ? d.contacts : [];
    const fix = (x) => {
      x.images = Array.isArray(x.images) ? x.images : x.image ? [x.image] : [];
      delete x.image;
      x.hidden = !!x.hidden;
      return x;
    };
    d.projects = (Array.isArray(d.projects) ? d.projects : []).map((p) => {
      fix(p);
      p.featured = !!p.featured;
      p.status = p.status === "dev" ? "dev" : "live";
      p.kind = PROJECT_KINDS[p.kind] ? p.kind : "site";
      p.tags = Array.isArray(p.tags) ? p.tags : [];
      return p;
    });
    d.achievementTypes = (Array.isArray(d.achievementTypes) && d.achievementTypes.length ? d.achievementTypes : ACH_TYPES_DEFAULT)
      .filter((t) => t && typeof t === "object")
      .map((t) => ({ id: t.id || uid("t"), plural: t.plural || "", single: t.single || "", ...(t.en ? { en: t.en } : {}) }));
    d.achievements = (Array.isArray(d.achievements) ? d.achievements : []).map(fix);
    d.upcomingSlots = Number.isFinite(+d.upcomingSlots) ? +d.upcomingSlots : 2;
    d.hero = d.hero && typeof d.hero === "object" ? d.hero : {};
    d.hero.facts = (Array.isArray(d.hero.facts) ? d.hero.facts : [])
      .filter((f) => f && typeof f === "object")
      .map((f) => ({ kind: FACT_KINDS[f.kind] ? f.kind : "custom", value: f.value || "", label: f.label || "", ...(f.en ? { en: f.en } : {}) }));
    d.hero.showWorks = d.hero.showWorks !== false;
    return d;
  }

  async function loadData() {
    const r = await api("data");
    S.data = normalize(r.data);
    S.version = r.version;
    setDirty(false);
  }

  function setDirty(v) {
    S.dirty = v;
    const st = $("#status");
    st.textContent = v ? "Есть несохранённые изменения" : "Все изменения сохранены";
    st.classList.toggle("is-dirty", v);
    $("#saveBtn").classList.toggle("is-pulse", v);
    if (v && previewOn) schedulePreview();
  }
  const markDirty = () => setDirty(true);

  /* ---------- Предпросмотр ----------
     Черновик (все текущие правки, даже несохранённые) кладём в localStorage,
     сайт с ?preview берёт данные оттуда. Пока вкладка предпросмотра открыта,
     каждая правка переписывает черновик — и сайт обновляется сам. */
  const PREVIEW_KEY = "fx-preview";
  let previewOn = false;
  let previewTimer;
  function pushPreview() {
    try {
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(S.data));
      return true;
    } catch {
      toast("Не удалось подготовить предпросмотр", "error");
      return false;
    }
  }
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(pushPreview, 500);
  }
  // item — открыть на сайте окно этой работы/достижения и прокрутить к её разделу
  function openPreview(list, item) {
    if (!S.data || !pushPreview()) return;
    previewOn = true;
    const q = item ? `&open=${encodeURIComponent(item.id)}` : "";
    const hash = item ? (list === "projects" ? "#works" : "#achievements") : "";
    window.open(`../?preview=1${q}${hash}`, "fx-preview");
  }

  async function save(force = false) {
    if (S.saving) return;
    if (Object.values(S.pending).some((l) => l.length)) return toast("Дождитесь окончания загрузки фото", "error");
    S.saving = true;
    $("#saveBtn").classList.add("is-loading");
    try {
      const r = await api("save", { method: "POST", body: { data: S.data, version: S.version, force } });
      S.data = normalize(r.data);
      S.version = r.version;
      setDirty(false);
      toast("Сохранено — изменения уже на сайте");
      renderView();
    } catch (e) {
      if (e.status === 409 && e.data && e.data.conflict) {
        S.saving = false;
        $("#saveBtn").classList.remove("is-loading");
        if (await confirmBox("Данные изменились в другой вкладке или на другом устройстве. Перезаписать их вашей версией?", "Перезаписать", true)) return save(true);
        return;
      }
      if (e.status !== 401) toast(e.message, "error");
    } finally {
      S.saving = false;
      $("#saveBtn").classList.remove("is-loading");
    }
  }

  /* ---------- Вход ---------- */
  let setupMode = false;
  function showLogin(session) {
    $("#boot").hidden = true;
    $("#appView").hidden = true;
    $("#loginView").hidden = false;
    setupMode = !session.hasPassword;
    $("#loginTitle").textContent = setupMode ? "Первый вход" : "Вход";
    $("#loginRepeatField").hidden = !setupMode;
    $("#loginPass").autocomplete = setupMode ? "new-password" : "current-password";
    $("#loginBtn").textContent = setupMode ? "Создать пароль и войти" : "Войти";
    $("#loginHint").textContent = setupMode
      ? session.setupAllowed
        ? "Придумайте пароль для админки (не короче 8 символов). Он сохранится на сервере в зашифрованном виде."
        : "Пароль ещё не задан. В целях безопасности первый пароль задаётся на компьютере: откройте админку локально или выполните php admin/set-password.php."
      : "Введите пароль администратора.";
    $("#loginBtn").disabled = setupMode && !session.setupAllowed;
    setTimeout(() => $("#loginPass").focus(), 50);
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pass = $("#loginPass").value;
    const err = $("#loginError");
    err.textContent = "";
    if (setupMode) {
      if (pass.length < 8) return (err.textContent = "Пароль должен быть не короче 8 символов");
      if (pass !== $("#loginRepeat").value) return (err.textContent = "Пароли не совпадают");
    }
    $("#loginBtn").classList.add("is-loading");
    try {
      const r = await api(setupMode ? "setup" : "login", { method: "POST", body: { password: pass } });
      S.csrf = r.csrf;
      $("#loginPass").value = $("#loginRepeat").value = "";
      if (!S.data || !S.dirty) await loadData();
      showApp();
    } catch (e2) {
      err.textContent = e2.message;
      $("#loginForm").classList.remove("is-shake");
      void $("#loginForm").offsetWidth;
      $("#loginForm").classList.add("is-shake");
    } finally {
      $("#loginBtn").classList.remove("is-loading");
    }
  });

  function onSessionLost() {
    if (!$("#loginView").hidden) return;
    toast("Сессия истекла — войдите снова. Несохранённые правки не потеряются.", "error");
    showLogin({ hasPassword: true });
  }

  /* ---------- Каркас ---------- */
  function showApp() {
    $("#boot").hidden = true;
    $("#loginView").hidden = true;
    $("#appView").hidden = false;
    renderNav();
    renderView();
  }

  function renderNav() {
    const counts = { works: S.data.projects.length, achievements: S.data.achievements.length, contacts: S.data.contacts.length };
    $("#sideNav").innerHTML = Object.entries(VIEWS)
      .map(([k, v]) => `<button class="side__item${k === S.view ? " is-active" : ""}" type="button" data-view="${k}">${v.icon}<span>${v.title}</span>${counts[k] != null ? `<em>${counts[k]}</em>` : ""}</button>`)
      .join("");
  }

  function paintStatic() {
    $("#saveBtn").innerHTML = `${I.save}<span>Сохранить</span><kbd>Ctrl S</kbd>`;
    $("#openSite").innerHTML = `${I.ext}<span>Сайт</span>`;
    $("#previewBtn").innerHTML = `${I.eye}<span>Предпросмотр</span>`;
    $("#drawerPreview").innerHTML = `${I.eye}<span>Предпросмотр</span>`;
    $("#logoutBtn").innerHTML = `${I.logout}<span>Выйти</span>`;
    $("#drawerClose").innerHTML = I.x;
    paintTheme();
  }
  function paintTheme() {
    const dark = root.dataset.theme === "dark";
    $("#themeBtn").innerHTML = `${dark ? I.sun : I.moon}<span>${dark ? "Светлая тема" : "Тёмная тема"}</span>`;
  }

  $("#sideNav").addEventListener("click", (e) => {
    const b = e.target.closest("[data-view]");
    if (!b) return;
    S.view = b.dataset.view;
    closeDrawer();
    renderNav();
    renderView();
    $(".main").scrollTo({ top: 0 });
  });
  $("#saveBtn").addEventListener("click", () => save());
  $("#themeBtn").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
    paintTheme();
  });
  $("#logoutBtn").addEventListener("click", async () => {
    if (S.dirty && !(await confirmBox("Есть несохранённые изменения. Выйти без сохранения?", "Выйти", true))) return;
    try { await api("logout", { method: "POST" }); } catch {}
    S.csrf = "";
    S.data = null;
    setDirty(false);
    showLogin({ hasPassword: true });
  });

  /* ---------- Представления ---------- */
  function renderView() {
    if (!S.data) return;
    $("#viewTitle").textContent = VIEWS[S.view].title;
    const html = { works: viewWorks, achievements: viewAchievements, profile: viewProfile, contacts: viewContacts, settings: viewSettings }[S.view]();
    // если курсор стоял в поле страницы — вернём его туда после перерисовки
    const active = document.activeElement;
    const keep = active && $("#view").contains(active) && active.dataset.path ? { path: active.dataset.path, start: active.selectionStart, end: active.selectionEnd } : null;
    $("#view").innerHTML = html;
    if (keep) {
      const el = $(`#view [data-path="${CSS.escape(keep.path)}"]`);
      if (el) {
        el.focus();
        try { el.setSelectionRange(keep.start, keep.end); } catch {}
      }
    }
    renderNav();
    if (S.view === "settings") loadBackups();
  }

  const emptyState = (text, act, label) => `<div class="empty"><p>${text}</p><button class="btn btn--accent" type="button" data-act="${act}">${I.plus}<span>${label}</span></button></div>`;
  const thumb = (x) => (x.images[0] ? `<img src="${esc(imgUrl(x.images[0]))}" alt="" loading="lazy">` : `<span class="thumb-empty">${I.image}</span>`);

  function rowActions(x, list) {
    return `
      ${list === "projects" ? `<button class="icon-btn${x.featured ? " is-on" : ""}" type="button" data-act="feature" title="${x.featured ? "Убрать с ноутбука" : "Показать на ноутбуке (Топ-3)"}" aria-pressed="${x.featured}">${I.star}</button>` : ""}
      <button class="icon-btn${x.hidden ? " is-off" : ""}" type="button" data-act="toggle-hidden" title="${x.hidden ? "Показать на сайте" : "Скрыть с сайта"}" aria-pressed="${x.hidden}">${x.hidden ? I.eyeOff : I.eye}</button>
      <button class="icon-btn" type="button" data-act="move-up" title="Выше">${I.up}</button>
      <button class="icon-btn" type="button" data-act="move-down" title="Ниже">${I.down}</button>
      <button class="icon-btn icon-btn--danger" type="button" data-act="delete" title="Удалить">${I.trash}</button>`;
  }

  function viewWorks() {
    const list = S.data.projects;
    let place = 0;
    const featuredPlace = new Map();
    list.forEach((p) => p.featured && !p.hidden && featuredPlace.set(p.id, ++place));
    const rows = list
      .map((p, i) => {
        const fp = featuredPlace.get(p.id);
        const badges = [
          fp && fp <= 3 ? `<span class="badge badge--accent">${I.star}Ноутбук №${fp}</span>` : "",
          fp && fp > 3 ? `<span class="badge" title="На ноутбуке помещаются только первые 3">${I.star}Не влезает в Топ-3</span>` : "",
          p.status === "dev" ? `<span class="badge">${PROJECT_STATUS.dev}</span>` : "",
          p.hidden ? `<span class="badge badge--muted">Скрыта</span>` : "",
        ].join("");
        return `
        <li class="row${p.hidden ? " is-hidden" : ""}" data-list="projects" data-id="${esc(p.id)}">
          <span class="row__grip" data-grip title="Перетащите, чтобы изменить порядок">${I.grip}</span>
          <span class="row__num">${String(i + 1).padStart(2, "0")}</span>
          <button class="row__thumb" type="button" data-act="edit">${thumb(p)}</button>
          <button class="row__main" type="button" data-act="edit">
            <b>${esc(p.title || "Без названия")}</b>
            <span>${esc([p.kind !== "site" ? PROJECT_KINDS[p.kind] : "", p.domain || p.category || "без ссылки"].filter(Boolean).join(" · "))} · ${p.images.length} фото</span>
          </button>
          <span class="row__badges">${badges}</span>
          <div class="row__actions">${rowActions(p, "projects")}</div>
        </li>`;
      })
      .join("");
    return `
      <div class="toolbar">
        <button class="btn btn--accent" type="button" data-act="add-project">${I.plus}<span>Добавить работу</span></button>
        <label class="inline-field">Карточек «Скоро здесь»
          <input type="number" min="0" max="6" data-path="upcomingSlots" value="${esc(S.data.upcomingSlots)}">
        </label>
      </div>
      <p class="hint">Порядок здесь = порядок на сайте. Перетаскивайте за ${I.grip} или жмите стрелки. ${I.star} — показать на ноутбуке и на мониторах первого экрана: там видны первые три отмеченные работы.</p>
      ${list.length ? `<ul class="rows" data-sortable="projects">${rows}</ul>` : emptyState("Работ пока нет", "add-project", "Добавить первую работу")}`;
  }

  function viewAchievements() {
    const list = S.data.achievements;
    const names = achTypeNames();
    const rows = list
      .map(
        (a, i) => `
        <li class="row${a.hidden ? " is-hidden" : ""}" data-list="achievements" data-id="${esc(a.id)}">
          <span class="row__grip" data-grip title="Перетащите, чтобы изменить порядок">${I.grip}</span>
          <span class="row__num">${String(i + 1).padStart(2, "0")}</span>
          <button class="row__thumb" type="button" data-act="edit">${thumb(a)}</button>
          <button class="row__main" type="button" data-act="edit">
            <b>${esc(a.title || "Без названия")}</b>
            <span>${esc([names[a.type], a.org, a.date].filter(Boolean).join(" · "))} · ${a.images.length} фото</span>
          </button>
          <span class="row__badges">${a.hidden ? `<span class="badge badge--muted">Скрыто</span>` : ""}</span>
          <div class="row__actions">${rowActions(a, "achievements")}</div>
        </li>`
      )
      .join("");
    return `
      <div class="toolbar">
        <button class="btn btn--accent" type="button" data-act="add-ach">${I.plus}<span>Добавить достижение</span></button>
      </div>
      <p class="hint">Тип выбирается в карточке достижения, сами типы — ниже. Счётчики и вкладки на сайте пересчитываются сами.</p>
      ${list.length ? `<ul class="rows" data-sortable="achievements">${rows}</ul>` : emptyState("Достижений пока нет", "add-ach", "Добавить первое")}
      ${viewAchTypes()}`;
  }

  /* --- типы достижений: вкладки на сайте --- */
  function viewAchTypes() {
    const types = S.data.achievementTypes;
    const rows = types
      .map((t, k) => {
        const all = S.data.achievements.filter((a) => a.type === t.id);
        const shown = all.filter((a) => !a.hidden).length;
        return `
        <li class="row row--type" data-list="achievementTypes" data-k="${k}">
          <span class="row__grip" data-grip title="Перетащите, чтобы изменить порядок вкладок">${I.grip}</span>
          <div class="type-fields">
            ${field("Вкладка на сайте", `achievementTypes.${k}.plural`, { placeholder: "Хакатоны", max: 40 })}
            ${field("На карточке", `achievementTypes.${k}.single`, { placeholder: "Хакатон", max: 40 })}
          </div>
          <span class="row__badges">
            <span class="badge">${all.length} шт.</span>
            ${shown ? "" : `<span class="badge badge--muted" title="Пока в этом типе нет видимых достижений">Не виден на сайте</span>`}
          </span>
          <div class="row__actions">
            <button class="icon-btn" type="button" data-act="move-up" title="Левее">${I.up}</button>
            <button class="icon-btn" type="button" data-act="move-down" title="Правее">${I.down}</button>
            <button class="icon-btn icon-btn--danger" type="button" data-act="delete" title="Удалить тип">${I.trash}</button>
          </div>
        </li>`;
      })
      .join("");
    return `
      <section class="card ach-types">
        <h2>Типы достижений</h2>
        <p class="hint">Это вкладки над достижениями на сайте, в том же порядке. Тип, в котором нет ни одного видимого достижения, на сайте не показывается. Удалить можно только пустой тип.</p>
        <ul class="rows" data-sortable="achievementTypes">${rows}</ul>
        ${types.length < ACH_TYPES_MAX ? `<button class="btn btn--ghost btn--sm" type="button" data-act="add-ach-type">${I.plus}<span>Добавить тип</span></button>` : ""}
      </section>`;
  }

  /* --- поля формы --- */
  // grow — однострочный текст, который не влезает в поле: textarea растёт по высоте, Enter не переносит строку
  function field(label, path, { type = "text", placeholder = "", max = 0, hint = "", list = "", rows = 0, grow = false } = {}) {
    const v = readField(path) ?? "";
    const attrs = `data-path="${esc(path)}" placeholder="${esc(placeholder)}"${max ? ` maxlength="${max}"` : ""}${list ? ` list="${list}"` : ""}`;
    const input = grow
      ? `<textarea rows="1" data-grow ${attrs}>${esc(v)}</textarea>`
      : rows ? `<textarea rows="${rows}" ${attrs}>${esc(v)}</textarea>` : `<input type="${type}" value="${esc(v)}" ${attrs}>`;
    const counter = max ? `<small class="counter" data-counter="${esc(path)}">${String(v).length} / ${max}</small>` : "";
    return `<label class="field"><span>${label}${counter}</span>${input}${hint ? `<small class="field__hint">${hint}</small>` : ""}</label>`;
  }
  function toggle(label, path, hint = "") {
    const v = !!readField(path);
    return `<label class="switch"><input type="checkbox" data-path="${esc(path)}"${v ? " checked" : ""}><i></i><span><b>${label}</b>${hint ? `<small>${hint}</small>` : ""}</span></label>`;
  }
  function chips(label, path, placeholder) {
    const list = readField(path) || [];
    return `
      <div class="field"><span>${label}</span>
        <div class="chips" data-chips="${esc(path)}">
          ${list.map((t, k) => `<span class="chip">${esc(t)}<button type="button" data-act="chip-del" data-k="${k}" aria-label="Удалить ${esc(t)}">${I.x}</button></span>`).join("")}
          <input type="text" data-chip-input placeholder="${esc(placeholder)}" aria-label="${esc(label)}">
        </div>
      </div>`;
  }
  function select(label, path, options) {
    const v = readField(path);
    return `<label class="field"><span>${label}</span><select data-path="${esc(path)}">${Object.entries(options).map(([k, t]) => `<option value="${k}"${k === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
  }

  function photoGrid(path, folder) {
    const images = readField(path) || [];
    const key = pendingKey(path);
    const pend = S.pending[key] || [];
    return `
      <div class="photos" data-photos="${esc(path)}" data-folder="${folder}" data-dropzone>
        <div class="photos__grid" data-sortable="${esc(path)}">
          ${images
            .map(
              (src, k) => `
            <figure class="tile" data-k="${k}" data-tile>
              <img src="${esc(imgUrl(src))}" alt="" draggable="false">
              <span class="tile__n">${k + 1}</span>
              ${k === 0 ? `<span class="tile__cover">Обложка</span>` : ""}
              <div class="tile__actions">
                <button type="button" data-act="img-left" title="Левее" aria-label="Левее">${I.left}</button>
                ${k ? `<button type="button" data-act="img-cover" title="Сделать обложкой" aria-label="Сделать обложкой">${I.star}</button>` : ""}
                <button type="button" data-act="img-right" title="Правее" aria-label="Правее">${I.right}</button>
                <button type="button" data-act="img-del" title="Убрать фото" aria-label="Убрать фото" class="is-danger">${I.trash}</button>
              </div>
            </figure>`
            )
            .join("")}
          ${pend.map((f) => `<figure class="tile is-loading" data-pending="${f.id}"><span class="tile__name">${esc(f.name)}</span><span class="tile__bar"><i style="transform:scaleX(${f.progress})"></i></span></figure>`).join("")}
          <label class="tile tile--add">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple data-upload hidden>
            ${I.upload}<span>Добавить фото</span><small>или перетащите сюда</small>
          </label>
        </div>
      </div>`;
  }

  function singlePhoto(label, path, folder) {
    const src = readField(path);
    return `
      <div class="field"><span>${label}</span>
        <div class="single-photo" data-photos="${esc(path)}" data-folder="${folder}" data-single data-dropzone>
          <div class="single-photo__img">${src ? `<img src="${esc(imgUrl(src))}" alt="">` : I.image}</div>
          <label class="btn btn--ghost btn--sm">${I.upload}<span>${src ? "Заменить" : "Загрузить"}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" data-upload hidden>
          </label>
          ${(S.pending[pendingKey(path)] || []).length ? `<span class="muted">Загружаю…</span>` : ""}
        </div>
      </div>`;
  }

  function viewProfile() {
    return `
      <div class="cards">
        <section class="card">
          <h2>Главное</h2>
          <div class="grid-2">
            ${field("Имя", "profile.firstName")}
            ${field("Фамилия", "profile.lastName")}
            ${field("Кто вы", "profile.role", { placeholder: "Программист" })}
            ${field("Город", "profile.city")}
          </div>
          ${field("Статус (зелёная точка в шапке)", "profile.status", { max: 120 })}
          ${field("Цитата (сейчас на сайте не показывается)", "profile.quote", { rows: 3, max: 300 })}
          ${field("Часовой пояс для часов в подвале", "profile.timezone", { list: "tzList", placeholder: "Europe/Moscow" })}
          <datalist id="tzList"><option value="Europe/Moscow"><option value="Europe/Samara"><option value="Asia/Yekaterinburg"><option value="Europe/Kaliningrad"></datalist>
        </section>
        <section class="card">
          <h2>Фото</h2>
          ${singlePhoto("Фото на бейдже", "profile.photo", "profile")}
          <p class="hint">Фото на бейдже в центре первого экрана — кадрируется в квадрат, лицо лучше по центру.</p>
          ${singlePhoto("QR-код на обороте бейджа", "profile.qr", "profile")}
          <p class="hint">Например, QR на ваш Telegram. Клик по нему на сайте ведёт на первый контакт из «Контактов» с типом Telegram.</p>
        </section>
        <section class="card">
          <h2>Учёба</h2>
          <div class="grid-2">
            ${field("Вуз", "profile.study.place")}
            ${field("Уровень", "profile.study.level", { placeholder: "Бакалавриат" })}
            ${field("Направление", "profile.study.program")}
            ${field("Сокращение", "profile.study.short", { placeholder: "ИСТ", max: 20 })}
          </div>
        </section>
        <section class="card">
          <h2>Работа</h2>
          <div class="grid-2">
            ${field("Компания", "profile.work.company")}
            ${field("Город", "profile.work.city")}
            ${field("Сайт компании", "profile.work.url", { type: "url", placeholder: "https://" })}
            ${field("О компании", "profile.work.about")}
          </div>
        </section>
        <section class="card card--wide">
          <h2>Первый экран: цифры и работы</h2>
          <p class="hint">Под именем — до ${FACTS_MAX} цифр. «Авто» считаются сами по работам и достижениям, которые видны на сайте; если подпись пустая, она подберётся сама («3 проекта»). Рядом — три монитора с превью топ-3 работ.</p>
          <div class="facts-preview" id="factsPreview" aria-label="Как это будет на сайте">${factsPreviewHtml()}</div>
          ${viewFacts()}
          ${toggle("Мониторы с топ-3 работами", "hero.showWorks", "Те же работы, что на ноутбуке: отмеченные ★ в «Работах». Клик по монитору открывает работу")}
        </section>
        <section class="card card--wide">
          <h2>Бегущая строка</h2>
          ${chips("Навыки и направления", "profile.skills", "Напишите и нажмите Enter")}
        </section>
      </div>`;
  }

  /* --- цифры на первом экране --- */
  // то же, что покажет сайт: скрытые записи не считаются
  function factShown(f) {
    const projects = S.data.projects.filter((p) => !p.hidden);
    const n = {
      projects: projects.length,
      live: projects.filter((p) => p.status !== "dev").length,
      achievements: S.data.achievements.filter((a) => !a.hidden).length,
    }[f.kind];
    if (n == null) return { value: f.value, label: f.label };
    return { value: String(n).padStart(2, "0"), label: f.label || plural(n, FACT_WORDS[f.kind]) };
  }

  function factsPreviewHtml() {
    const facts = S.data.hero.facts;
    if (!facts.length) return `<p class="muted">Цифр нет — под именем останутся только мониторы с работами.</p>`;
    return facts.map((f) => { const s = factShown(f); return `<div class="fp"><b>${esc(s.value || "—")}</b><span>${esc(s.label)}</span></div>`; }).join("");
  }

  function viewFacts() {
    const facts = S.data.hero.facts;
    const rows = facts
      .map((f, k) => {
        const auto = f.kind !== "custom";
        const s = factShown(f);
        return `
        <li class="row row--fact" data-list="hero.facts" data-k="${k}">
          <span class="row__grip" data-grip title="Перетащите, чтобы изменить порядок">${I.grip}</span>
          <div class="fact-fields">
            ${select("Что показать", `hero.facts.${k}.kind`, FACT_KINDS)}
            ${auto
              ? `<label class="field"><span>Значение</span><input type="text" value="${esc(s.value)}" disabled title="Считается само"></label>`
              : field("Значение", `hero.facts.${k}.value`, { placeholder: "∞", max: 12 })}
            ${field("Подпись", `hero.facts.${k}.label`, { placeholder: auto ? s.label : "чашек кофе", max: 40 })}
          </div>
          <div class="row__actions">
            <button class="icon-btn" type="button" data-act="move-up" title="Выше">${I.up}</button>
            <button class="icon-btn" type="button" data-act="move-down" title="Ниже">${I.down}</button>
            <button class="icon-btn icon-btn--danger" type="button" data-act="delete" title="Удалить">${I.trash}</button>
          </div>
        </li>`;
      })
      .join("");
    return `
      ${facts.length ? `<ul class="rows facts-rows" data-sortable="hero.facts">${rows}</ul>` : ""}
      ${facts.length < FACTS_MAX ? `<button class="btn btn--ghost btn--sm" type="button" data-act="add-fact">${I.plus}<span>Добавить цифру</span></button>` : ""}`;
  }

  function viewContacts() {
    const rows = S.data.contacts
      .map(
        (c, k) => `
        <li class="row row--contact" data-list="contacts" data-k="${k}">
          <span class="row__grip" data-grip title="Перетащите, чтобы изменить порядок">${I.grip}</span>
          <div class="contact-fields">
            ${select("Тип", `contacts.${k}.type`, CONTACT_TYPES)}
            ${field("Подпись", `contacts.${k}.label`, { placeholder: "Telegram" })}
            ${field("Что показать", `contacts.${k}.value`, { placeholder: "@username" })}
            ${field("Ссылка", `contacts.${k}.url`, { placeholder: "https://" })}
          </div>
          <div class="row__actions">
            <button class="icon-btn" type="button" data-act="move-up" title="Выше">${I.up}</button>
            <button class="icon-btn" type="button" data-act="move-down" title="Ниже">${I.down}</button>
            <button class="icon-btn icon-btn--danger" type="button" data-act="delete" title="Удалить">${I.trash}</button>
          </div>
        </li>`
      )
      .join("");
    return `
      <div class="toolbar"><button class="btn btn--accent" type="button" data-act="add-contact">${I.plus}<span>Добавить контакт</span></button></div>
      <p class="hint">Контакты появятся в шапке первого экрана, в меню и в блоке «Контакты». Ссылка для Telegram, почты, GitHub и ВК заполняется сама.</p>
      ${S.data.contacts.length ? `<ul class="rows" data-sortable="contacts">${rows}</ul>` : emptyState("Контактов нет", "add-contact", "Добавить контакт")}`;
  }

  function viewSettings() {
    return `
      <div class="cards">
        <section class="card">
          <h2>Пароль</h2>
          <form class="stack" id="passForm" autocomplete="off">
            <label class="field"><span>Текущий пароль</span><input type="password" name="current" autocomplete="current-password" required></label>
            <label class="field"><span>Новый пароль (от 8 символов)</span><input type="password" name="next" autocomplete="new-password" minlength="8" required></label>
            <label class="field"><span>Повторите новый пароль</span><input type="password" name="repeat" autocomplete="new-password" minlength="8" required></label>
            <button class="btn btn--accent" type="submit">Сменить пароль</button>
          </form>
        </section>
        <section class="card">
          <h2>Резервные копии</h2>
          <p class="hint">Перед каждым сохранением прошлая версия откладывается (хранятся последние 40). Можно откатиться.</p>
          <ul class="backups" id="backups"><li class="muted">Загружаю…</li></ul>
        </section>
        <section class="card">
          <h2>Неиспользуемые фото</h2>
          <p class="hint">Фото, которые вы убрали из работ, остаются на сервере. Здесь их можно удалить. Внимание: если потом откатиться на старую копию, этих фото уже не будет.</p>
          <div class="stack" id="cleanupBox"><button class="btn btn--ghost" type="button" data-act="scan-unused">Найти</button></div>
        </section>
        <section class="card">
          <h2>Экспорт</h2>
          <p class="hint">Скачать все данные одним файлом — на всякий случай.</p>
          <button class="btn btn--ghost" type="button" data-act="export">${I.download}<span>Скачать JSON</span></button>
        </section>
      </div>`;
  }

  async function loadBackups() {
    try {
      const r = await api("backups");
      const box = $("#backups");
      if (!box) return;
      box.innerHTML = r.backups.length
        ? r.backups
            .slice(0, 15)
            .map((b) => `<li><span>${I.history}${new Date(b.time).toLocaleString("ru-RU", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</span><button class="btn btn--ghost btn--sm" type="button" data-act="restore" data-name="${esc(b.name)}">Восстановить</button></li>`)
            .join("")
        : `<li class="muted">Копий пока нет — они появятся после первого сохранения.</li>`;
    } catch (e) {
      if (e.status !== 401) toast(e.message, "error");
    }
  }

  /* ---------- Редактор записи (выезжающая панель) ---------- */
  function currentItem() {
    if (!S.edit || !S.data) return null;
    return S.data[S.edit.list].find((x) => x.id === S.edit.id) || null;
  }

  function openDrawer(list, id) {
    S.edit = { list, id };
    const d = $("#drawer");
    d.hidden = false;
    requestAnimationFrame(() => d.classList.add("is-open"));
    renderDrawer();
    $("#drawerBody").scrollTop = 0;
    setTimeout(() => {
      const first = $("#drawerBody input[data-path]");
      if (first && !first.value) first.focus();
    }, 320);
  }

  function closeDrawer() {
    if (!S.edit) return;
    S.edit = null;
    const d = $("#drawer");
    d.classList.remove("is-open");
    setTimeout(() => !S.edit && (d.hidden = true), 300);
    renderView();
  }

  function renderDrawer() {
    const x = currentItem();
    if (!x) return closeDrawer();
    const isProject = S.edit.list === "projects";
    $("#drawerTitle").textContent = isProject ? x.title || "Новая работа" : x.title || "Новое достижение";
    $("#drawerBody").innerHTML = isProject
      ? `
        <section class="drawer__section">
          <h3>Фото <small>${x.images.length}</small></h3>
          ${photoGrid("@images", "projects")}
          <p class="hint">Первое фото — обложка: оно на ноутбуке и в карточке. Для сайта лучше длинный скриншот всей страницы шириной ~1440px, остальные — что угодно: экраны, фото с защиты, макеты. Нет фото — на сайте будет автоматическая обложка по виду работы.</p>
        </section>
        <section class="drawer__section">
          ${field("Название", "@title", { placeholder: "GameCode", max: 120, grow: true })}
          ${select("Вид работы (оформление карточки и обложки)", "@kind", PROJECT_KINDS)}
          <div class="grid-2">
            ${field("Ссылка", "@url", { type: "url", placeholder: "https://…", hint: "Сайт, GitHub или бот в Telegram — подпись кнопки подберётся сама" })}
            ${field("Как показывать адрес", "@domain", { placeholder: "заполнится сам" })}
          </div>
          <div class="grid-2">
            ${select("Статус (по нему фильтр на сайте)", "@status", PROJECT_STATUS)}
            ${field("Категория", "@category", { placeholder: "Веб-платформа", list: "catList" })}
          </div>
          <datalist id="catList">${[...new Set(S.data.projects.map((p) => p.category).filter(Boolean))].map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
          ${chips("Теги", "@tags", "Напишите тег и нажмите Enter")}
          ${field("Коротко — для карточки", "@short", { max: 220, rows: 2 })}
          ${field("Подробно — для окна проекта и ноутбука", "@description", { max: 3000, rows: 6 })}
        </section>
        <section class="drawer__section">
          ${toggle("Показывать на ноутбуке", "@featured", "В Топ-3 попадают первые три отмеченные работы по порядку")}
          ${toggle("Скрыть с сайта", "@hidden", "Черновик: работа сохранится, но на сайте её не будет")}
        </section>`
      : `
        <section class="drawer__section">
          <h3>Фото <small>${x.images.length}</small></h3>
          ${photoGrid("@images", "achievements")}
          <p class="hint">Первое фото — обложка карточки. По клику на сайте откроется галерея со всеми фото.</p>
        </section>
        <section class="drawer__section">
          ${select("Тип", "@type", achTypeNames())}
          ${field("Название", "@title", { placeholder: "Диплом III степени", max: 200, grow: true })}
          <div class="grid-2">
            ${field("Где / кем выдан", "@org", { placeholder: "Конференция, вуз, компания", max: 200, grow: true })}
            ${field("Когда", "@date", { placeholder: "Май 2026" })}
          </div>
          ${toggle("Скрыть с сайта", "@hidden")}
        </section>`;
    $$("#drawerBody textarea[data-grow]").forEach(fitArea);
  }

  // высота поля data-grow — по тексту, без полосы прокрутки
  function fitArea(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + 2 + "px";
  }
  addEventListener("resize", () => $$("textarea[data-grow]").forEach(fitArea));
  // в однострочном поле Enter не переносит строку
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches && e.target.matches("textarea[data-grow]")) e.preventDefault();
  });

  /* ---------- Действия ---------- */
  function listOf(el) {
    const row = el.closest("[data-list]");
    if (!row) return null;
    const list = getPath(S.data, row.dataset.list); // «projects» или вложенный путь вроде «hero.facts»
    const idx = row.dataset.id != null ? list.findIndex((x) => x.id === row.dataset.id) : +row.dataset.k;
    return { name: row.dataset.list, list, idx, item: list[idx] };
  }

  function move(arr, from, to) {
    if (to < 0 || to >= arr.length || from === to) return false;
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return true;
  }

  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || !S.data) return;
    const act = b.dataset.act;
    const ctx = listOf(b);

    switch (act) {
      case "add-project": {
        const p = { id: uid("p"), title: "", url: "", domain: "", category: "", status: "live", kind: "site", tags: [], short: "", description: "", images: [], featured: false, hidden: false };
        S.data.projects.unshift(p);
        markDirty();
        renderView();
        return openDrawer("projects", p.id);
      }
      case "add-ach": {
        const a = { id: uid("a"), type: S.data.achievementTypes[0]?.id || "", title: "", org: "", date: "", images: [], hidden: false };
        S.data.achievements.unshift(a);
        markDirty();
        renderView();
        return openDrawer("achievements", a.id);
      }
      case "add-contact":
        S.data.contacts.push({ type: "link", label: "", value: "", url: "" });
        markDirty();
        renderView();
        return $$("#view .row--contact").at(-1)?.querySelector("input")?.focus();
      case "add-ach-type":
        if (S.data.achievementTypes.length >= ACH_TYPES_MAX) return;
        S.data.achievementTypes.push({ id: uid("t"), plural: "", single: "" });
        markDirty();
        renderView();
        return $$("#view .row--type").at(-1)?.querySelector("input")?.focus();
      case "add-fact":
        if (S.data.hero.facts.length >= FACTS_MAX) return;
        S.data.hero.facts.push({ kind: "custom", value: "", label: "" });
        markDirty();
        renderView();
        return $$("#view .row--fact").at(-1)?.querySelector("input")?.focus();
      case "edit":
        return ctx && openDrawer(ctx.name, ctx.item.id);
      case "feature":
        ctx.item.featured = !ctx.item.featured;
        break;
      case "toggle-hidden":
        ctx.item.hidden = !ctx.item.hidden;
        break;
      case "move-up":
      case "move-down":
        if (!move(ctx.list, ctx.idx, ctx.idx + (act === "move-up" ? -1 : 1))) return;
        break;
      case "delete": {
        // тип нельзя удалить, пока он у кого-то стоит, и последний тип тоже нельзя
        if (ctx.name === "achievementTypes") {
          const used = S.data.achievements.filter((a) => a.type === ctx.item.id).length;
          if (used) return toast(`Этот тип стоит у достижений: ${used}. Сначала смените им тип`, "error");
          if (ctx.list.length < 2) return toast("Нужен хотя бы один тип", "error");
        }
        const name = ctx.item.title || ctx.item.plural || ctx.item.value || "эту запись";
        if (!(await confirmBox(`Удалить «${name}»? Это можно отменить, если не сохранять изменения.`, "Удалить", true))) return;
        ctx.list.splice(ctx.idx, 1);
        break;
      }
      case "preview":
        return openPreview();
      case "drawer-preview":
        return S.edit && openPreview(S.edit.list, currentItem());
      case "drawer-close":
        return closeDrawer();
      case "drawer-delete": {
        const x = currentItem();
        if (!x || !(await confirmBox(`Удалить «${x.title || "без названия"}»?`, "Удалить", true))) return;
        const list = S.data[S.edit.list];
        list.splice(list.indexOf(x), 1);
        markDirty();
        return closeDrawer();
      }
      case "chip-del": {
        const path = b.closest("[data-chips]").dataset.chips;
        readField(path).splice(+b.dataset.k, 1);
        markDirty();
        return rerenderAround(b);
      }
      case "img-left":
      case "img-right":
      case "img-cover":
      case "img-del": {
        const path = b.closest("[data-photos]").dataset.photos;
        const arr = readField(path);
        const k = +b.closest("[data-tile]").dataset.k;
        if (act === "img-del") arr.splice(k, 1);
        else if (act === "img-cover") move(arr, k, 0);
        else if (!move(arr, k, k + (act === "img-left" ? -1 : 1))) return;
        markDirty();
        return rerenderAround(b);
      }
      case "restore": {
        const msg = S.dirty ? "Восстановить эту копию? Несохранённые изменения пропадут." : "Восстановить эту копию? Текущая версия тоже отложится в копии.";
        if (!(await confirmBox(msg, "Восстановить"))) return;
        try {
          const r = await api("restore", { method: "POST", body: { name: b.dataset.name } });
          S.data = normalize(r.data);
          S.version = r.version;
          setDirty(false);
          toast("Копия восстановлена");
          renderView();
        } catch (er) { if (er.status !== 401) toast(er.message, "error"); }
        return;
      }
      case "scan-unused": {
        if (S.dirty) return toast("Сначала сохраните изменения", "error");
        try {
          const r = await api("unused");
          $("#cleanupBox").innerHTML = r.files.length
            ? `<p>Найдено файлов: <b>${r.files.length}</b> (${(r.size / 1048576).toFixed(1)} МБ)</p><button class="btn btn--danger" type="button" data-act="cleanup">Удалить их</button>`
            : `<p class="muted">Лишних файлов нет ✓</p>`;
        } catch (er) { if (er.status !== 401) toast(er.message, "error"); }
        return;
      }
      case "cleanup": {
        if (!(await confirmBox("Удалить неиспользуемые фото с сервера? Вернуть их будет нельзя.", "Удалить", true))) return;
        try {
          const r = await api("cleanup", { method: "POST" });
          toast("Удалено файлов: " + r.removed);
          $("#cleanupBox").innerHTML = `<button class="btn btn--ghost" type="button" data-act="scan-unused">Найти снова</button>`;
        } catch (er) { if (er.status !== 401) toast(er.message, "error"); }
        return;
      }
      case "export": {
        const blob = new Blob([JSON.stringify(S.data, null, 2)], { type: "application/json" });
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "portfolio-" + new Date().toISOString().slice(0, 10) + ".json" });
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        return;
      }
      default:
        return;
    }
    markDirty();
    renderView();
  });

  // перерисовать ту часть, где был клик (панель редактора или страницу)
  function rerenderAround(el) {
    if (el.closest("#drawer")) renderDrawer();
    else renderView();
  }

  /* ---------- Ввод в полях ---------- */
  let listRefresh;
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.dataset || !el.dataset.path || !S.data) return;
    const path = el.dataset.path;
    // однострочное поле: вставленные переносы строк превращаем в пробелы, высоту подгоняем под текст
    if (el.hasAttribute("data-grow")) {
      if (/[\r\n]/.test(el.value)) {
        const pos = el.selectionStart;
        el.value = el.value.replace(/\s*[\r\n]+\s*/g, " ");
        el.setSelectionRange(Math.min(pos, el.value.length), Math.min(pos, el.value.length));
      }
      fitArea(el);
    }
    let v = el.type === "checkbox" ? el.checked : el.type === "number" ? Math.max(0, Math.min(6, parseInt(el.value, 10) || 0)) : el.value;
    const before = readField(path);
    writeField(path, v);
    markDirty();

    const counter = el.closest(".field")?.querySelector("[data-counter]");
    if (counter) counter.textContent = `${String(v).length} / ${el.maxLength}`;

    // адрес сайта → домен, если домен не меняли руками
    if (path === "@url") {
      const item = currentItem();
      if (item && (!item.domain || item.domain === domainOf(before))) {
        item.domain = domainOf(v);
        const dom = $('#drawerBody [data-path="@domain"]');
        if (dom) dom.value = item.domain;
      }
    }
    // контакт: ссылка собирается из значения
    const cm = path.match(/^contacts\.(\d+)\.(value|type)$/);
    if (cm) {
      const c = S.data.contacts[+cm[1]];
      const prevAuto = cm[2] === "value" ? autoContactUrl(c.type, before) : autoContactUrl(before, c.value);
      if (!c.url || c.url === prevAuto) {
        c.url = autoContactUrl(c.type, c.value);
        const urlInput = el.closest(".row").querySelector(`[data-path="contacts.${cm[1]}.url"]`);
        if (urlInput) urlInput.value = c.url;
      }
      if (cm[2] === "type" && (!c.label || Object.values(CONTACT_TYPES).includes(c.label))) {
        c.label = CONTACT_TYPES[c.type];
        const labelInput = el.closest(".row").querySelector(`[data-path="contacts.${cm[1]}.label"]`);
        if (labelInput) labelInput.value = c.label;
      }
    }
    // цифры первого экрана: смена типа меняет поля строки, остальное — только превью
    if (/^hero\.facts\.\d+\.kind$/.test(path)) return renderView();
    if (path.startsWith("hero.facts.")) {
      const pv = $("#factsPreview");
      if (pv) pv.innerHTML = factsPreviewHtml();
    }
    if (path === "@title") $("#drawerTitle").textContent = v || "Без названия";
    if (el.closest("#drawer") || el.type === "checkbox") {
      clearTimeout(listRefresh);
      listRefresh = setTimeout(() => {
        if (el.closest("#drawer")) renderView();
        else if (el.type === "checkbox") renderView();
      }, 250);
    }
  });

  /* ---------- Теги-чипсы ---------- */
  document.addEventListener("keydown", (e) => {
    const input = e.target.closest && e.target.closest("[data-chip-input]");
    if (!input) return;
    const path = input.closest("[data-chips]").dataset.chips;
    const list = readField(path);
    if ((e.key === "Enter" || e.key === ",") && input.value.trim()) {
      e.preventDefault();
      input.value.split(",").map((s) => s.trim()).filter(Boolean).forEach((t) => !list.includes(t) && list.push(t));
      markDirty();
      rerenderAround(input);
      focusChipInput(path);
    } else if (e.key === "Enter") {
      e.preventDefault();
    } else if (e.key === "Backspace" && !input.value && list.length) {
      list.pop();
      markDirty();
      rerenderAround(input);
      focusChipInput(path);
    }
  });
  document.addEventListener("focusout", (e) => {
    // ушли из поля тега, не нажав Enter — тоже добавим
    const input = e.target.closest && e.target.closest("[data-chip-input]");
    if (!input || !input.value.trim()) return;
    // без перерисовки: иначе потеряется клик по кнопке, ради которого ушли из поля
    const box = input.closest("[data-chips]");
    const list = readField(box.dataset.chips);
    input.value.split(",").map((s) => s.trim()).filter(Boolean).forEach((t) => {
      if (list.includes(t)) return;
      list.push(t);
      input.insertAdjacentHTML("beforebegin", `<span class="chip">${esc(t)}<button type="button" data-act="chip-del" data-k="${list.length - 1}" aria-label="Удалить ${esc(t)}">${I.x}</button></span>`);
    });
    input.value = "";
    markDirty();
  });
  const focusChipInput = (path) => setTimeout(() => $(`[data-chips="${CSS.escape(path)}"] [data-chip-input]`)?.focus(), 0);

  /* ---------- Загрузка фото ---------- */
  const pendingKey = (path) => (path.startsWith("@") ? (S.edit ? S.edit.list + ":" + S.edit.id : "none") : path) + ":" + path;

  async function handleFiles(files, box) {
    const path = box.dataset.photos;
    const folder = box.dataset.folder;
    const single = box.hasAttribute("data-single");
    const key = pendingKey(path);
    // запоминаем, куда класть результат, даже если редактор закроют
    const owner = path.startsWith("@") ? { ...S.edit } : null;
    const target = () => {
      if (!owner) return { obj: S.data, p: path };
      const item = S.data[owner.list].find((x) => x.id === owner.id);
      return item ? { obj: item, p: path.slice(1) } : null;
    };
    let list = [...files].filter((f) => {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) { toast(`«${f.name}» — не картинка`, "error"); return false; }
      if (f.size > MAX_UPLOAD) { toast(`«${f.name}» больше 15 МБ`, "error"); return false; }
      return true;
    });
    if (single) list = list.slice(0, 1);
    if (!list.length) return;
    S.pending[key] = S.pending[key] || [];
    const jobs = list.map((f) => ({ id: uid("u"), name: f.name, progress: 0, file: f }));
    S.pending[key].push(...jobs);
    rerenderAround(box);

    for (const job of jobs) {
      try {
        const res = await uploadFile(job.file, folder, (p) => {
          job.progress = p;
          const bar = $(`[data-pending="${job.id}"] .tile__bar i`);
          if (bar) bar.style.transform = `scaleX(${p})`;
        });
        const t = target();
        if (t) {
          if (single) setPath(t.obj, t.p, res.path);
          else getPath(t.obj, t.p).push(res.path);
          markDirty();
        }
      } catch (er) {
        toast(er.message, "error");
      }
      S.pending[key] = S.pending[key].filter((j) => j !== job);
      refreshPhotos(owner);
    }
    if (!S.pending[key].length) delete S.pending[key];
    refreshPhotos(owner);
  }

  function refreshPhotos(owner) {
    if (owner) {
      if (S.edit && S.edit.list === owner.list && S.edit.id === owner.id) renderDrawer();
      renderView();
    } else renderView();
  }

  document.addEventListener("change", (e) => {
    const input = e.target.closest && e.target.closest("[data-upload]");
    if (!input || !input.files.length) return;
    handleFiles(input.files, input.closest("[data-photos]"));
    input.value = "";
  });
  ["dragenter", "dragover"].forEach((type) =>
    document.addEventListener(type, (e) => {
      const zone = e.target.closest && e.target.closest("[data-dropzone]");
      if (!zone || !e.dataTransfer || ![...e.dataTransfer.types].includes("Files")) return;
      e.preventDefault();
      zone.classList.add("is-drop");
    })
  );
  document.addEventListener("dragleave", (e) => {
    const zone = e.target.closest && e.target.closest("[data-dropzone]");
    if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("is-drop");
  });
  document.addEventListener("drop", (e) => {
    const zone = e.target.closest && e.target.closest("[data-dropzone]");
    if (!zone || !e.dataTransfer.files.length) return;
    e.preventDefault();
    zone.classList.remove("is-drop");
    handleFiles(e.dataTransfer.files, zone);
  });
  // файл, брошенный мимо зоны, не должен открываться вместо админки
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => e.preventDefault());

  /* ---------- Перетаскивание (строки и фото) ---------- */
  let drag = null;
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const grip = e.target.closest("[data-grip]");
    const tile = !e.target.closest("button, input, label") && e.target.closest("[data-tile]");
    const item = grip ? grip.closest(".row") : tile;
    if (!item) return;
    const container = item.parentElement;
    drag = { item, container, x0: e.clientX, y0: e.clientY, started: false, pointerId: e.pointerId };
    if (grip) e.preventDefault();
  });

  document.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.started) {
      if (Math.hypot(dx, dy) < 6) return;
      startDrag();
    }
    e.preventDefault();
    drag.item.style.transform = `translate(${dx}px, ${dy}px) rotate(${drag.isGrid ? 2 : 0.6}deg) scale(1.02)`;
    placeAt(e.clientX, e.clientY);
    autoScroll(e.clientY);
  });

  function startDrag() {
    const { item, container } = drag;
    const r = item.getBoundingClientRect();
    drag.started = true;
    drag.isGrid = container.classList.contains("photos__grid");
    drag.siblings = () => [...container.children].filter((c) => c !== item && c !== drag.ph && (c.matches(".row") || c.matches("[data-tile]")));
    drag.from = [...container.children].filter((c) => c.matches(".row, [data-tile]")).indexOf(item);
    drag.ph = document.createElement(item.tagName);
    drag.ph.className = item.className + " is-placeholder";
    if (item.hasAttribute("data-tile")) drag.ph.setAttribute("data-tile", "");
    drag.ph.style.height = r.height + "px";
    if (drag.isGrid) drag.ph.style.width = r.width + "px";
    item.after(drag.ph);
    Object.assign(item.style, { position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", zIndex: 999, pointerEvents: "none" });
    item.classList.add("is-dragging");
    document.body.classList.add("is-sorting");
  }

  function placeAt(x, y) {
    const sibs = drag.siblings();
    for (const s of sibs) {
      const r = s.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      const before = drag.isGrid ? x < r.left + r.width / 2 : y < r.top + r.height / 2;
      const ref = before ? s : s.nextSibling;
      if (ref === drag.ph || (before && s.previousSibling === drag.ph) || (!before && s.nextSibling === drag.ph)) return;
      flip(sibs, () => drag.container.insertBefore(drag.ph, ref));
      return;
    }
  }

  // плавно сдвигаем соседей (FLIP)
  function flip(els, mutate) {
    const first = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
    mutate();
    els.forEach((el) => {
      const a = first.get(el);
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 220, easing: "cubic-bezier(.22,1,.36,1)" });
    });
  }

  function autoScroll(y) {
    const scroller = drag.container.closest(".drawer__body") || $(".main");
    const r = scroller.getBoundingClientRect();
    if (y < r.top + 60) scroller.scrollBy(0, -12);
    else if (y > r.bottom - 60) scroller.scrollBy(0, 12);
  }

  function endDrag(cancel) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.started) return;
    const to = [...d.container.children].filter((c) => c !== d.item && c.matches(".row, [data-tile]")).indexOf(d.ph);
    d.item.removeAttribute("style");
    d.item.classList.remove("is-dragging");
    d.ph.replaceWith(d.item);
    document.body.classList.remove("is-sorting");
    if (cancel || to < 0 || to === d.from) return;
    const key = d.container.dataset.sortable;
    const arr = key === "projects" || key === "achievements" || key === "contacts" ? S.data[key] : readField(key);
    move(arr, d.from, to);
    markDirty();
    rerenderAround(d.container);
    if (d.container.closest("#drawer")) renderView();
  }
  document.addEventListener("pointerup", () => endDrag(false));
  document.addEventListener("pointercancel", () => endDrag(true));

  /* ---------- Смена пароля ---------- */
  document.addEventListener("submit", async (e) => {
    if (e.target.id !== "passForm") return;
    e.preventDefault();
    const f = new FormData(e.target);
    if (f.get("next") !== f.get("repeat")) return toast("Новые пароли не совпадают", "error");
    try {
      await api("password", { method: "POST", body: { current: f.get("current"), next: f.get("next") } });
      e.target.reset();
      toast("Пароль изменён");
    } catch (er) { if (er.status !== 401) toast(er.message, "error"); }
  });

  /* ---------- Горячие клавиши и защита от потери правок ---------- */
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "ы" || e.code === "KeyS")) {
      e.preventDefault();
      if (S.data && !$("#appView").hidden) save();
    }
    if (e.key === "Escape" && S.edit && !$("#confirmDlg").open) closeDrawer();
  });
  window.addEventListener("beforeunload", (e) => {
    if (S.dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  /* ---------- Старт ---------- */
  async function boot() {
    paintStatic();
    try {
      const s = await api("session");
      if (s.authed) {
        S.csrf = s.csrf;
        await loadData();
        showApp();
      } else showLogin(s);
    } catch (e) {
      $("#boot").innerHTML = `<p class="boot__error">${esc(e.message)}<br><small>Админке нужен PHP 8.1+. Локально запустите: php -S localhost:8080 в папке сайта.</small></p>`;
    }
  }
  boot();
})();
