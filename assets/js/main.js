/* =========================================================
   F/FOLIO — логика и анимации.
   Весь контент берётся из data/portfolio.js (window.PORTFOLIO).
   ========================================================= */
(() => {
  "use strict";

  // ?preview — предпросмотр из админки: данные берутся из черновика в localStorage
  // (несохранённые правки), а не из data/portfolio.js
  const PREVIEW_KEY = "fx-preview";
  const PREVIEW = new URLSearchParams(location.search).has("preview");

  /* ---------- Язык: ru (по умолчанию) / en ----------
     ?lang=en в адресе, кнопка в шапке или «lang en» в терминале — выбор запоминается.
     Статичный текст переводится по атрибутам data-en* в index.html, строки скрипта — tr(ru, en),
     содержимое из админки — полями en у каждой записи (пустое поле — остаётся русский). */
  const LANG = (() => {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "ru") {
      try { localStorage.setItem("lang", q); } catch {}
      return q;
    }
    try { return localStorage.getItem("lang") === "en" ? "en" : "ru"; } catch { return "ru"; }
  })();
  const EN = LANG === "en";
  const tr = (ru, en) => (EN ? en : ru);
  const LOCALE = tr("ru-RU", "en-US");

  // накладывает непустые английские поля поверх русских: строки, списки (теги) и вложенные объекты (учёба, работа)
  function overlay(base, en) {
    const out = { ...base };
    for (const [k, v] of Object.entries(en || {})) {
      if (Array.isArray(v)) { if (v.length) out[k] = v; }
      else if (v && typeof v === "object") out[k] = overlay(base[k] || {}, v);
      else if (String(v ?? "").trim()) out[k] = v;
    }
    return out;
  }
  const localize = (x) => (EN && x && typeof x === "object" && x.en ? overlay(x, x.en) : x);
  const localizeAll = (d) => ({
    ...d,
    profile: localize(d.profile || {}),
    contacts: (d.contacts || []).map(localize),
    projects: (d.projects || []).map(localize),
    achievementTypes: (d.achievementTypes || []).map(localize),
    achievements: (d.achievements || []).map(localize),
    hero: d.hero ? { ...d.hero, facts: (d.hero.facts || []).map(localize) } : d.hero,
  });

  const D = localizeAll((() => {
    if (PREVIEW) {
      try {
        const draft = JSON.parse(localStorage.getItem(PREVIEW_KEY) || "null");
        if (draft && typeof draft === "object") return draft;
      } catch {}
    }
    return window.PORTFOLIO || {};
  })());
  const P = D.profile || {};
  // скрытые записи не показываем; images[0] — обложка (старое поле image тоже понимаем)
  const withImages = (x) => ({ ...x, images: x.images && x.images.length ? x.images : x.image ? [x.image] : [] });
  const projects = (D.projects || []).filter((p) => !p.hidden).map(withImages);
  const achievements = (D.achievements || []).filter((a) => !a.hidden).map(withImages);
  const contacts = D.contacts || [];
  const cover = (x) => x.images[0] || "";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => mqReduce.matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isExternal = (url) => /^https?:/i.test(url || "");
  // форма слова после числа: plural(3, ["проект", "проекта", "проектов"]) → «проекта»;
  // по-английски форм две: [one, many, many] — «1 project» / «3 projects»
  const plural = (n, [one, few, many]) => {
    if (EN) return n === 1 ? one : many;
    const a = n % 10;
    const b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  };

  const ICONS = {
    telegram: '<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    email: '<svg viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
    vk: '<svg viewBox="0 0 24 24"><path style="fill:currentColor;stroke:none" d="M12.8 17.5C6.6 17.5 3 13.2 2.8 6.5h3.1c.1 4.9 2.3 7 4 7.4V6.5h2.9v4.2c1.7-.2 3.5-2.1 4.1-4.2h2.9c-.5 2.6-2.4 4.5-3.8 5.3 1.4.6 3.6 2.3 4.4 5.7h-3.2c-.7-2.1-2.4-3.8-4.4-4v4z"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    arrowUR: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    zoom: '<svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 0c.6 6.5 5.5 11.4 12 12-6.5.6-11.4 5.5-12 12C11.4 17.5 6.5 12.6 0 12 6.5 11.4 11.4 6.5 12 0Z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
  };
  const iconFor = (type) => ICONS[type] || ICONS.link;

  /* ---------- Вид работы: сайт / приложение / бот / база данных / модуль ----------
     От вида зависят заголовок карточки (окно браузера, окно программы, чат,
     клиент БД, терминал) и автоматическая обложка, если фото нет. */
  const KINDS = {
    site: { label: tr("Сайт", "Website"), icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>' },
    app: { label: tr("Приложение", "App"), icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/></svg>' },
    bot: { label: tr("Бот", "Bot"), icon: '<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13v1M15 13v1M9.5 17h5"/><circle cx="12" cy="3.5" r=".5"/></svg>' },
    db: { label: tr("База данных", "Database"), icon: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5.5" rx="8" ry="2.5"/><path d="M4 5.5v13c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"/></svg>' },
    module: { label: tr("Модуль", "Module"), icon: '<svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>' },
  };
  const kindOf = (p) => (KINDS[p.kind] ? p.kind : "site");
  const slugOf = (t) => String(t || "project").toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-|-$/g, "") || "project";

  // подпись и иконка кнопки — по ссылке: GitHub → «Код на GitHub», Telegram → «Открыть бота»…
  function linkInfo(p) {
    const u = String(p.url || "").toLowerCase();
    if (/github\.com/.test(u)) return { label: tr("Код на GitHub", "Code on GitHub"), icon: ICONS.github };
    if (/gitlab\.com/.test(u)) return { label: tr("Код на GitLab", "Code on GitLab"), icon: ICONS.arrowUR };
    if (/(^|\/\/)(t\.me|telegram\.me)\//.test(u)) return { label: kindOf(p) === "bot" ? tr("Открыть бота", "Open the bot") : tr("Открыть в Telegram", "Open in Telegram"), icon: ICONS.telegram };
    if (/(drive\.google|disk\.yandex|yadi\.sk)/.test(u)) return { label: tr("Открыть материалы", "Open materials"), icon: ICONS.arrowUR };
    return { label: kindOf(p) === "site" ? tr("Открыть сайт", "Visit website") : tr("Открыть проект", "Open project"), icon: ICONS.arrowUR };
  }
  const linkButton = (p) => {
    if (!p.url) return "";
    const l = linkInfo(p);
    return `<a class="btn btn--accent btn--sm" href="${esc(p.url)}" target="_blank" rel="noopener" data-magnetic>${l.label} <span class="btn__icon">${l.icon}</span></a>`;
  };

  // заголовок карточки работы — «окно» под вид
  function cardBar(p) {
    const k = kindOf(p);
    const where = esc(p.domain || p.url || p.category);
    if (k === "app") return `<div class="mini-bar mini-bar--app"><span class="mini-bar__title">${KINDS.app.icon}${esc(p.title)}</span><span class="mini-bar__win" aria-hidden="true"><i></i><i></i><i></i></span></div>`;
    if (k === "bot") return `<div class="mini-bar mini-bar--bot"><span class="mini-bar__avatar">${KINDS.bot.icon}</span><span class="mini-bar__title">${esc(p.title)}<small>${tr("бот · онлайн", "bot · online")}</small></span></div>`;
    if (k === "db") return `<div class="mini-bar mini-bar--db"><span class="mini-bar__title">${KINDS.db.icon}${esc(slugOf(p.title))}.db</span><span class="mini-bar__tag">SQL</span></div>`;
    if (k === "module") return `<div class="mini-bar mini-bar--term"><span class="browser__dots"><i></i><i></i><i></i></span><span class="mini-bar__title">~/${esc(slugOf(p.title))} $ ./run</span></div>`;
    return `<div class="mini-bar"><span class="browser__dots"><i></i><i></i><i></i></span><span>${where}</span></div>`;
  }

  // обложка, если фото нет: схема под вид работы (страница, окно, чат, таблицы, код) + название
  function autoCover(p) {
    const k = kindOf(p);
    const art = {
      site: '<i class="ac-nav"></i><i class="ac-hero"></i><span class="ac-cols"><i></i><i></i><i></i></span>',
      app: '<span class="ac-win"><i class="ac-side"></i><span class="ac-panes"><i></i><i></i><i></i><i></i></span></span>',
      bot: '<span class="ac-chat"><i class="in"></i><i class="out"></i><i class="in short"></i><i class="out short"></i></span>',
      db: '<span class="ac-er"><span class="ac-tbl"><b></b><i></i><i></i><i></i></span><span class="ac-tbl"><b></b><i></i><i></i></span><span class="ac-tbl"><b></b><i></i><i></i><i></i></span></span>',
      module: '<span class="ac-code"><i style="--w:44%"></i><i style="--w:62%;--x:1"></i><i style="--w:38%;--x:2"></i><i style="--w:55%;--x:2"></i><i style="--w:30%;--x:1"></i><i style="--w:20%"></i></span>',
    }[k];
    return `
      <span class="auto-cover auto-cover--${k}">
        <span class="auto-cover__art" aria-hidden="true">${art}</span>
        <span class="auto-cover__meta"><span class="auto-cover__icon">${KINDS[k].icon}</span><span><b>${esc(p.title)}</b><small>${esc([KINDS[k].label, p.category].filter(Boolean).join(" · "))}</small></span></span>
      </span>`;
  }

  const featured = (() => {
    // порядок — как в списке работ (его задаёт админка)
    const f = projects.filter((p) => p.featured);
    return (f.length ? f : projects).slice(0, 3);
  })();

  /* ---------- Тост ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(tr("Скопировано: ", "Copied: ") + text);
  }

  /* ---------- Разбивка текста ---------- */
  function splitChars(el) {
    let i = 0;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="word">${[...w].map((c) => `<span class="char" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`)
      .join(" ");
  }

  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          // делим только по обычным пробелам — &nbsp; склеивает слова
          n.textContent.split(/([ \n\t\r]+)/).forEach((part) => {
            if (!part) return;
            if (/^[ \n\t\r]+$/.test(part)) return frag.append(" ");
            const w = document.createElement("span");
            w.className = "split-w";
            const inner = document.createElement("span");
            inner.style.setProperty("--i", i++);
            inner.textContent = part;
            w.append(inner);
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
  }

  /* ---------- Рендер из данных ---------- */
  function renderProfile() {
    if (P.photo) $("#heroImg").src = P.photo;

    const socials = contacts
      .map((c) => `<a class="social" href="${esc(c.url)}" data-type="${esc(c.type)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""} aria-label="${esc(c.label)}: ${esc(c.value)}" title="${esc(c.value)}">${iconFor(c.type)}</a>`)
      .join("");
    $("#heroSocials").innerHTML = socials;
    $("#mobileContacts").innerHTML = contacts
      .map((c) => `<a class="chip" href="${esc(c.url)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""}>${iconFor(c.type)} ${esc(c.value)}</a>`)
      .join("");
  }

  /* ---------- Под именем: цифры и мониторы с топ-3 работами ----------
     Всё задаётся в админке («Профиль → Первый экран»). «Авто»-цифры
     считаются по видимым работам и достижениям, подпись без текста
     подбирается сама. На мониторах — те же работы, что на ноутбуке. */
  const HERO = D.hero || {};
  const FACT_WORDS = {
    projects: EN ? ["project", "projects", "projects"] : ["проект", "проекта", "проектов"],
    live: EN ? ["website live", "websites live", "websites live"] : ["сайт работает", "сайта работают", "сайтов работают"],
    achievements: EN ? ["achievement", "achievements", "achievements"] : ["достижение", "достижения", "достижений"],
  };

  function factShown(f) {
    const n = { projects: projects.length, live: projects.filter((p) => statusOf(p) === "live").length, achievements: achievements.length }[f.kind];
    if (n == null) return { value: String(f.value || ""), label: f.label || "" };
    return { value: String(n).padStart(2, "0"), label: f.label || plural(n, FACT_WORDS[f.kind]) };
  }

  function renderHeroMid() {
    const facts = (Array.isArray(HERO.facts) ? HERO.facts : []).slice(0, 4).map(factShown).filter((f) => f.value);
    if (facts.length) {
      $("#heroFactsList").innerHTML = facts
        .map((f) => {
          // число в начале набегает при появлении: «03», «5+»; текст вроде «∞» остаётся как есть
          const m = /^(\d+)(.*)$/.exec(f.value);
          const num = m
            ? `<b class="hero-fact__num" data-to="${+m[1]}" data-pad="${m[1].length}" data-suffix="${esc(m[2])}">${esc(f.value)}</b>`
            : `<b class="hero-fact__num">${esc(f.value)}</b>`;
          // текст в скобках не разрываем переносом: «(3 курс)» остаётся одним куском
          const label = esc(f.label).replace(/\([^)]*\)/g, (m) => m.replace(/ /g, " "));
          return `<li class="hero-fact">${num}<span class="hero-fact__label">${label}</span></li>`;
        })
        .join("");
      $("#heroFacts").hidden = false;
    }

    // три монитора: на экране — превью сайта, под ним — точка статуса, название и адрес
    if (HERO.showWorks !== false && featured.length) {
      const box = $("#heroScreens");
      box.innerHTML = featured
        .map(
          (p, k) => `
        <button class="mon${statusOf(p) === "dev" ? " is-dev" : ""}" type="button" data-project="${esc(p.id)}" style="--k:${k}" data-cursor="${tr("Смотреть", "View")}" aria-label="${tr("Открыть работу", "Open project")} ${esc(p.title)}">
          <span class="mon__frame"><span class="mon__screen">${cover(p) ? `<img src="${esc(cover(p))}" alt="" decoding="async" draggable="false">` : autoCover(p)}</span></span>
          <span class="mon__cap"><i title="${STATUS[statusOf(p)]}"></i><b>${esc(p.title)}</b><span>${esc(p.domain || p.category)}</span></span>
        </button>`
        )
        .join("");
      box.hidden = false;
    }
  }

  function renderTicker() {
    const skills = P.skills && P.skills.length ? P.skills : [tr("Веб-разработка", "Web development")];
    const group = `<div class="ticker__group">${skills.map((s) => `<span class="ticker__item">${esc(s)}${ICONS.star}</span>`).join("")}</div>`;
    $$(".ticker__track").forEach((t) => (t.innerHTML = group.repeat(3)));
  }

  function renderContacts() {
    $("#contactLinks").innerHTML = contacts
      .map(
        (c) => `
      <div class="contact-row">
        <span class="contact-row__label">${esc(c.label)}</span>
        <span class="contact-row__value">${esc(c.value)}</span>
        <a class="contact-row__link" href="${esc(c.url)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""} aria-label="${esc(c.label)}: ${esc(c.value)}" data-cursor="${tr("Написать", "Write")}"></a>
        <span class="contact-row__actions">
          <button class="contact-row__btn" type="button" data-copy="${esc(c.value)}" aria-label="${tr("Скопировать", "Copy")} ${esc(c.value)}" title="${tr("Скопировать", "Copy")}">${ICONS.copy}</button>
          <span class="contact-row__btn" aria-hidden="true">${ICONS.arrowUR}</span>
        </span>
      </div>`
      )
      .join("");
  }

  /* ---------- Все работы ---------- */
  const worksGrid = $("#worksGrid");
  const worksFilters = $("#worksFilters");
  let worksFilter = "all";
  const STATUS = { live: tr("Уже работает", "Live"), dev: tr("В разработке", "In progress") };
  const statusOf = (p) => (p.status === "dev" ? "dev" : "live");
  // карточки «Скоро здесь» тоже считаются «в разработке»
  const soonSlots = () => Math.max(0, D.upcomingSlots ?? 2);

  function renderWorkFilters() {
    const count = (s) => projects.filter((p) => statusOf(p) === s).length;
    const items = [
      ["all", projects.length + soonSlots(), tr("Все", "All")],
      ["live", count("live"), STATUS.live],
      ["dev", count("dev") + soonSlots(), STATUS.dev],
    ];
    worksFilters.innerHTML = items
      .map(([key, n, label]) => `<button class="filter${key === worksFilter ? " is-active" : ""}" type="button" data-filter="${esc(key)}" aria-pressed="${key === worksFilter}">${esc(label)}<sup>${n}</sup></button>`)
      .join("");
  }

  function workCard(p, i) {
    const num = String(projects.indexOf(p) + 1).padStart(2, "0");
    return `
      <article class="work-card is-entering" style="--i:${i}" data-tilt>
        <button class="work-card__link" type="button" data-project="${esc(p.id)}" data-cursor="${tr("Смотреть", "View")}" aria-label="${tr("Подробнее о проекте", "More about")} ${esc(p.title)}">
          <div class="work-card__media">
            ${cardBar(p)}
            ${cover(p)
              ? `<div class="work-card__shot" style="background-image:url('${esc(cover(p))}')" role="img" aria-label="${tr("Обложка проекта", "Project cover:")} ${esc(p.title)}"></div>`
              : `<div class="work-card__shot work-card__shot--auto" role="img" aria-label="${tr("Обложка проекта", "Project cover:")} ${esc(p.title)}">${autoCover(p)}</div>`}
            <span class="work-card__status is-${statusOf(p)}"><i class="pulse"></i>${STATUS[statusOf(p)]}</span>
            ${p.images.length > 1 ? `<span class="photo-count">${ICONS.image}${p.images.length}</span>` : ""}
          </div>
          <div class="work-card__body">
            <div class="work-card__top"><span class="work-card__num">${num}</span><span class="work-card__cat">${esc(p.category)}</span></div>
            <h3 class="work-card__title">${esc(p.title)}</h3>
            <p class="work-card__text">${esc(p.short)}</p>
            <span class="work-card__more">${tr("Подробнее", "Read more")} ${ICONS.arrowUR}</span>
            <ul class="tags">${(p.tags || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>
          <span class="work-card__arrow" aria-hidden="true">${ICONS.arrowUR}</span>
        </button>
      </article>`;
  }

  function soonCard(i) {
    return `
      <article class="work-card work-card--soon is-entering" style="--i:${i}">
        <div class="soon">
          <div class="soon__code" aria-hidden="true"><span class="tok-k">const</span> project = <span class="tok-k">new</span> Idea();<br>project.design();<br>project.build();<br>project.test();<br>// ${tr("скоро в продакшене", "shipping soon")}<span class="caret"></span></div>
          <div>
            <span class="soon__badge"><i class="pulse"></i>${tr("В разработке", "In progress")}</span>
            <h3 style="margin-top:14px">${tr("Новый проект", "New project")}</h3>
            <p>${tr("Скоро здесь появится ещё одна работа.", "Another project is coming here soon.")}</p>
          </div>
        </div>
      </article>`;
  }

  function renderWorks() {
    const list = worksFilter === "all" ? projects : projects.filter((p) => statusOf(p) === worksFilter);
    let html = list.map(workCard).join("");
    if (worksFilter !== "live") for (let k = 0; k < soonSlots(); k++) html += soonCard(list.length + k);
    worksGrid.innerHTML = html;
    bindTilt(worksGrid);
    markClamped();
  }

  // карточки одной высоты: название — до 2 строк, описание — до 3, теги — в одну строку.
  // Если что-то не влезло, у карточки появляется «Подробнее»: клик открывает окно работы с полным текстом
  function markClamped() {
    $$(".work-card", worksGrid).forEach((card) => {
      const cut = $$(".work-card__title, .work-card__text", card).some((el) => el.scrollHeight > el.clientHeight + 1);
      card.classList.toggle("is-clamped", cut);
      const tags = $(".tags", card);
      card.classList.toggle("is-tags-cut", !!tags && tags.scrollWidth > tags.clientWidth + 1);
    });
  }

  worksFilters.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b || b.dataset.filter === worksFilter) return;
    worksFilter = b.dataset.filter;
    renderWorkFilters();
    renderWorks();
  });

  /* ---------- Достижения ----------
     Типы (вкладки) задаются в админке; { id: [«Дипломы», «Диплом»] }.
     Вкладка типа, в котором нет ни одного видимого достижения, не показывается. */
  const ACH_TYPES_DEFAULT = [
    { id: "diploma", plural: tr("Дипломы", "Diplomas"), single: tr("Диплом", "Diploma") },
    { id: "certificate", plural: tr("Сертификаты", "Certificates"), single: tr("Сертификат", "Certificate") },
    { id: "conference", plural: tr("Конференции", "Conferences"), single: tr("Конференция", "Conference") },
    { id: "showcase", plural: tr("Шоукейсы", "Showcases"), single: tr("Шоукейс", "Showcase") },
  ];
  const ACH_TYPES = Object.fromEntries(
    (Array.isArray(D.achievementTypes) && D.achievementTypes.length ? D.achievementTypes : ACH_TYPES_DEFAULT).map((t) => [t.id, [t.plural || t.single, t.single || t.plural]])
  );
  let achFilter = "all";

  function renderAchTabs() {
    const types = Object.entries(ACH_TYPES)
      .map(([k, v]) => [k, v[0], achievements.filter((a) => a.type === k).length])
      .filter(([, , n]) => n > 0);
    const tabs = [["all", tr("Все", "All"), achievements.length], ...types];
    $("#achTabs").innerHTML = tabs
      .map(([k, label, n]) => `<button class="ach-tab${k === achFilter ? " is-active" : ""}" type="button" data-type="${k}" aria-pressed="${k === achFilter}"><b>${n}</b><span>${label}</span>${n ? "" : `<small>${tr("скоро", "soon")}</small>`}</button>`)
      .join("");
  }

  function renderAch() {
    const list = achFilter === "all" ? achievements : achievements.filter((a) => a.type === achFilter);
    let html = list
      .map((a, i) => {
        const meta = [a.org, a.date].filter(Boolean).join(" · ");
        return `
        <article class="ach is-entering" style="--i:${i}">
          <button class="ach__media" type="button" data-ach="${esc(a.id)}" aria-label="${tr("Открыть фото:", "Open photos:")} ${esc(a.title)}" data-cursor="${tr("Смотреть", "View")}">
            <span class="ach__type">${esc((ACH_TYPES[a.type] || ["", tr("Событие", "Event")])[1])}</span>
            ${a.images.length > 1 ? `<span class="photo-count">${ICONS.image}${a.images.length}</span>` : ""}
            <img src="${esc(cover(a))}" alt="${esc(a.title)}" loading="lazy">
            <span class="ach__zoom" aria-hidden="true">${ICONS.zoom}</span>
          </button>
          <div class="ach__body"><h3>${esc(a.title)}</h3>${meta ? `<p>${esc(meta)}</p>` : ""}</div>
        </article>`;
      })
      .join("");
    const what = achFilter === "all" || !ACH_TYPES[achFilter] ? tr("новые достижения", "achievements") : ACH_TYPES[achFilter][0].toLowerCase();
    html += `
      <article class="ach ach--soon is-entering" style="--i:${list.length}">
        <span class="ach__plus">${ICONS.plus}</span>
        <h3>${tr("Скоро здесь", "Coming soon")}</h3>
        <p>${tr(`Добавлю ${esc(what)} — следите за обновлениями`, `More ${esc(what)} on the way — stay tuned`)}</p>
      </article>`;
    $("#achGrid").innerHTML = html;
  }

  $("#achTabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-type]");
    if (!b || b.dataset.type === achFilter) return;
    achFilter = b.dataset.type;
    renderAchTabs();
    renderAch();
  });

  /* ---------- Окно проекта / достижения с галереей ---------- */
  const mm = {
    el: $("#mediaModal"),
    stage: $("#mmStage"),
    thumbs: $("#mmThumbs"),
    counter: $("#mmCounter"),
    info: $("#mmInfo"),
    images: [],
    title: "",
    i: 0,
  };

  function openMedia(item, kind) {
    if (!item || typeof mm.el.showModal !== "function") return;
    mm.images = item.images;
    mm.title = item.title;
    mm.i = -1;
    mm.el.classList.toggle("is-single", mm.images.length < 2);
    mm.el.classList.toggle("is-photos", kind !== "project");
    mm.stage.innerHTML = mm.images.length
      ? mm.images
          // в --src нужен полный адрес: относительный путь из CSS-переменной браузер считает от style.css (assets/css/) и не находит фото
          .map((src, k) => `<div class="mm__slide" style="--src:url('${esc(new URL(src, document.baseURI).href)}')"><img src="${esc(src)}" alt="${esc(item.title)} — ${tr("фото", "photo")} ${k + 1}" decoding="async"></div>`)
          .join("")
      : kind === "project"
        ? `<div class="mm__slide is-active mm__slide--auto">${autoCover(item)}</div>`
        : `<div class="mm__slide is-active mm__empty">${tr("Фото скоро появятся", "Photos coming soon")}</div>`;
    mm.thumbs.innerHTML = mm.images.length > 1
      ? mm.images.map((src, k) => `<button class="mm__thumb" type="button" data-k="${k}" aria-label="${tr("Фото", "Photo")} ${k + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")
      : "";
    $$(".mm__slide img", mm.stage).forEach((img) => {
      const fit = () => img.parentElement.classList.toggle("is-long", img.naturalHeight / img.naturalWidth > 1.9);
      img.complete ? fit() : img.addEventListener("load", fit, { once: true });
    });
    const tags = (item.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
    if (kind === "project") {
      mm.info.innerHTML = `
        <p class="sc-detail__cat">${esc(item.category)}</p>
        <h3 id="mmTitle">${esc(item.title)}</h3>
        ${item.domain ? `<p class="mm__domain">${esc(item.domain)}</p>` : ""}
        <p class="mm__desc">${esc(item.description || item.short)}</p>
        ${tags ? `<ul class="tags">${tags}</ul>` : ""}
        ${linkButton(item)}`;
    } else {
      const meta = [item.org, item.date].filter(Boolean).join(" · ");
      mm.info.innerHTML = `
        <p class="sc-detail__cat">${esc((ACH_TYPES[item.type] || ["", tr("Событие", "Event")])[1])}</p>
        <h3 id="mmTitle">${esc(item.title)}</h3>
        ${meta ? `<p class="mm__desc">${esc(meta)}</p>` : ""}`;
    }
    // строка состояния «iPad»: время и дата как в iPadOS — «14:05 пт, 24 окт.»
    const now = new Date();
    $("#ipadClock").textContent = `${now.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })}  ${now.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" })}`;
    mm.el.showModal();
    showMedia(0);
  }

  function showMedia(k) {
    const n = mm.images.length;
    if (!n) return;
    k = (k + n) % n;
    const dir = k > mm.i ? 1 : -1;
    mm.i = k;
    $$(".mm__slide", mm.stage).forEach((s, j) => {
      s.style.setProperty("--dir", dir);
      s.classList.toggle("is-active", j === k);
      if (j === k) s.scrollTop = 0;
    });
    $$(".mm__thumb", mm.thumbs).forEach((t, j) => {
      t.classList.toggle("is-active", j === k);
      if (j === k) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    mm.counter.textContent = `${k + 1} / ${n}`;
  }

  mm.el.addEventListener("click", (e) => {
    if (e.target === mm.el || e.target.closest(".mm__close")) return mm.el.close();
    if (e.target.closest(".mm__nav--prev")) return showMedia(mm.i - 1);
    if (e.target.closest(".mm__nav--next")) return showMedia(mm.i + 1);
    const t = e.target.closest(".mm__thumb");
    if (t) showMedia(+t.dataset.k);
  });
  mm.el.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showMedia(mm.i - 1);
    if (e.key === "ArrowRight") showMedia(mm.i + 1);
  });
  // свайп на телефоне
  let swipeX = null;
  mm.stage.addEventListener("pointerdown", (e) => (swipeX = e.clientX));
  mm.stage.addEventListener("pointerup", (e) => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 50) showMedia(mm.i + (dx < 0 ? 1 : -1));
  });

  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-project]");
    if (p) return openMedia(projects.find((x) => x.id === p.dataset.project), "project");
    const a = e.target.closest("[data-ach]");
    if (a) openMedia(achievements.find((x) => x.id === a.dataset.ach), "ach");
  });

  /* ---------- Код «обо мне» с печатью ---------- */
  const codeLines = () => {
    const s = P.study || {};
    const w = P.work || {};
    const q = (t) => `"${t}"`;
    return [
      [["c", tr("// обо мне в двух словах", "// about me in a nutshell")]],
      [["k", "const "], ["v", "firas"], ["x", " = {"]],
      [["p", "  name"], ["x", ": "], ["s", q(`${P.firstName} ${P.lastName}`)], ["x", ","]],
      [["p", "  role"], ["x", ": "], ["s", q((P.role || "").toLowerCase())], ["x", ","]],
      [["p", "  study"], ["x", ": "], ["s", q(`${s.place} · ${s.short || s.program}`)], ["x", ","]],
      [["p", "  work"], ["x", ": "], ["s", q(`${w.company} · ${w.city}`)], ["x", ","]],
      [["p", "  projects"], ["x", ": "], ["n", String(projects.length)], ["x", ", "], ["c", tr("// и это только начало", "// and this is just the beginning")]],
      [["p", "  coffee"], ["x", ": "], ["n", "Infinity"], ["x", ","]],
      [["p", "  status"], ["x", ": "], ["s", q((P.status || "").toLowerCase())]],
      [["x", "};"]],
      [],
      [["v", "firas"], ["x", "."], ["p", "build"], ["x", "("], ["s", tr('"что-то крутое"', '"something awesome"')], ["x", ");"]],
    ];
  };

  function typeCode() {
    const body = $("#codeBody");
    const lines = codeLines();
    const caret = Object.assign(document.createElement("span"), { className: "caret" });
    const rows = lines.map(() => {
      const d = document.createElement("div");
      d.className = "code-line";
      body.append(d);
      return d;
    });
    if (reduced()) {
      lines.forEach((l, i) => (rows[i].innerHTML = l.map(([c, t]) => `<span class="tok-${c}">${esc(t)}</span>`).join("")));
      rows.at(-1).append(caret);
      return;
    }
    let li = 0, ti = 0, ci = 0, span = null;
    const step = () => {
      if (li >= lines.length) return;
      const row = rows[li];
      row.classList.add("is-current");
      const tok = lines[li][ti];
      if (!tok) {
        row.classList.remove("is-current");
        li++; ti = 0; ci = 0; span = null;
        if (li < lines.length) rows[li].append(caret);
        return setTimeout(step, 90);
      }
      if (!span) {
        span = document.createElement("span");
        span.className = "tok-" + tok[0];
        row.insertBefore(span, caret.parentNode === row ? caret : null);
        if (caret.parentNode !== row) row.append(caret);
      }
      span.textContent += tok[1][ci++];
      if (ci >= tok[1].length) { ti++; ci = 0; span = null; }
      setTimeout(step, 16 + Math.random() * 30);
    };
    rows[0].append(caret);
    step();
  }


  /* ---------- Ноутбук ---------- */
  const sc = {
    sec: $("#showcase"),
    laptop: $("#laptop"),
    screen: $("#screen"),
    view: $("#screenView"),
    url: $("#screenUrl"),
    tabs: $("#scTabs"),
    detail: $("#scDetail"),
    cur: { lid: -89, tilt: -38, yaw: -22, s: 0.84, ty: 40 },
    active: -1,
    on: false,
    bootTimer: 0,
    slides: [],
    anims: [],
    OPEN_END: 0.24,
  };

  function buildKeyboard() {
    const rows = [
      { fn: true, keys: Array(14).fill(1) },
      { keys: [...Array(13).fill(1), 1.6] },
      { keys: [1.6, ...Array(12).fill(1), 1] },
      { keys: [1.9, ...Array(11).fill(1), 1.9] },
      { keys: [2.4, ...Array(10).fill(1), 2.4] },
      { keys: [1, 1, 1, 1.3, 5.6, 1.3, 1, 1, 1, 1] },
    ];
    $("#keyboard").innerHTML = rows
      .map((r) => `<div class="kb-row${r.fn ? " kb-row--fn" : ""}">${r.keys.map((g) => `<i class="key" style="flex-grow:${g}"></i>`).join("")}</div>`)
      .join("");
  }

  function renderShowcase() {
    sc.view.innerHTML = featured
      .map((p) => (cover(p) ? `<div class="slide"><img src="${esc(cover(p))}" alt="${tr("Сайт", "Website")} ${esc(p.title)}" decoding="async"></div>` : `<div class="slide slide--auto">${autoCover(p)}</div>`))
      .join("");
    sc.slides = $$(".slide", sc.view);
    sc.tabs.innerHTML = featured
      .map(
        (p, i) => `<li><button class="sc-tab" type="button" data-i="${i}"><span class="sc-tab__num">${String(i + 1).padStart(2, "0")}</span><span class="sc-tab__title">${esc(p.title)}</span><span class="sc-tab__domain">${esc(p.domain)}</span><span class="sc-tab__bar"></span></button></li>`
      )
      .join("");
    sc.tabBtns = $$(".sc-tab", sc.tabs);
    renderDetail(0);
    sc.slides.forEach((s) => $("img", s)?.addEventListener("load", () => sc.active >= 0 && startSlideScroll(sc.active)));
  }

  function startSlideScroll(i) {
    sc.anims.forEach((a) => a.cancel());
    sc.anims = [];
    const img = $("img", sc.slides[i]);
    if (!img || reduced()) return;
    const d = img.offsetHeight - sc.view.offsetHeight;
    if (d <= 10) return;
    sc.anims.push(
      img.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-d}px)` }], {
        duration: Math.max(7000, d * 7),
        delay: 1400,
        easing: "cubic-bezier(.45,0,.55,1)",
        direction: "alternate",
        iterations: Infinity,
      })
    );
  }

  let urlTimer;
  function typeUrl(text) {
    clearInterval(urlTimer);
    sc.url.textContent = "";
    if (reduced()) return (sc.url.textContent = text);
    let k = 0;
    urlTimer = setInterval(() => {
      sc.url.textContent = text.slice(0, ++k);
      if (k >= text.length) clearInterval(urlTimer);
    }, 45);
  }

  function setActive(i) {
    if (i === sc.active || !featured[i]) return;
    const prev = sc.active;
    sc.active = i;
    sc.slides.forEach((s, k) => {
      s.classList.toggle("is-active", k === i);
      s.classList.toggle("is-prev", k === prev);
    });
    setTimeout(() => sc.slides[prev] && sc.active !== prev && sc.slides[prev].classList.remove("is-prev"), 950);
    sc.tabBtns.forEach((b, k) => b.classList.toggle("is-active", k === i));
    typeUrl(featured[i].domain || featured[i].url || featured[i].category || featured[i].title);
    renderDetail(i);
    if (sc.on) startSlideScroll(i);
  }

  function renderDetail(i) {
    const p = featured[i];
    if (!p) return;
    sc.detail.innerHTML = `
      <p class="sc-detail__cat">${esc(p.category)}</p>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <ul class="tags">${(p.tags || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="sc-detail__actions">
        ${linkButton(p)}
        <button class="btn btn--ghost btn--sm" type="button" data-project="${esc(p.id)}" data-magnetic>${tr("Подробнее", "Details")}${p.images.length > 1 ? ` · ${p.images.length} ${tr("фото", "photos")}` : ""}</button>
      </div>`;
  }

  function screenOn() {
    if (sc.on || sc.bootTimer) return;
    sc.screen.classList.add("is-booting");
    sc.bootTimer = setTimeout(() => {
      sc.bootTimer = 0;
      sc.on = true;
      sc.screen.classList.remove("is-booting");
      sc.screen.classList.add("is-on");
      if (sc.active < 0) setActive(0);
      else startSlideScroll(sc.active);
    }, reduced() ? 0 : 1150);
  }
  function screenOff() {
    clearTimeout(sc.bootTimer);
    sc.bootTimer = 0;
    sc.on = false;
    sc.screen.classList.remove("is-booting", "is-on");
    sc.anims.forEach((a) => a.cancel());
  }

  const scSeg = () => {
    const start = sc.OPEN_END + 0.04;
    return { start, len: (1 - start) / Math.max(1, featured.length) };
  };
  function scProgress() {
    const total = sc.sec.offsetHeight - innerHeight;
    if (total <= 0) return 1;
    return clamp(-sc.sec.getBoundingClientRect().top / total);
  }

  function updateLaptop() {
    if (reduced()) return;
    const r = sc.sec.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const p = scProgress();
    const o = easeOut(clamp(p / sc.OPEN_END));
    const t = { lid: lerp(-89, 11, o), tilt: lerp(-38, -13, o), yaw: lerp(-22, 0, o), s: lerp(0.84, 1, o), ty: lerp(40, 0, o) };
    let changed = false;
    for (const k in t) {
      const v = lerp(sc.cur[k], t[k], 0.12);
      if (Math.abs(v - sc.cur[k]) > 0.001) changed = true;
      sc.cur[k] = v;
    }
    if (changed) {
      const s = sc.laptop.style;
      s.setProperty("--lid", sc.cur.lid.toFixed(2) + "deg");
      s.setProperty("--tilt", sc.cur.tilt.toFixed(2) + "deg");
      s.setProperty("--yaw", sc.cur.yaw.toFixed(2) + "deg");
      s.setProperty("--s", sc.cur.s.toFixed(4));
      s.setProperty("--ty", sc.cur.ty.toFixed(1) + "px");
    }
    // экран включается, когда крышка почти открыта
    if (sc.cur.lid > 2) screenOn();
    else if (sc.cur.lid < -45) screenOff();

    const { start, len } = scSeg();
    const idx = p < start ? 0 : Math.min(featured.length - 1, Math.floor((p - start) / len));
    const segP = p < start ? 0 : clamp((p - start) / len - idx);
    if (sc.on) setActive(idx);
    sc.tabBtns.forEach((b, k) => b.style.setProperty("--p", !sc.on ? 0 : k < idx ? 1 : k === idx ? segP.toFixed(3) : 0));
  }

  sc.tabs.addEventListener("click", (e) => {
    const b = e.target.closest(".sc-tab");
    if (!b) return;
    const i = +b.dataset.i;
    if (reduced()) return setActive(i);
    const { start, len } = scSeg();
    const total = sc.sec.offsetHeight - innerHeight;
    const top = sc.sec.getBoundingClientRect().top + scrollY + total * (start + len * (i + 0.5));
    scrollTo({ top, behavior: "smooth" });
  });

  // «печатающие» клавиши, пока экран включён
  setInterval(() => {
    if (!sc.on || document.hidden || reduced()) return;
    const keys = $$("#keyboard .key");
    const k = keys[(Math.random() * keys.length) | 0];
    k.classList.add("is-glow");
    setTimeout(() => k.classList.remove("is-glow"), 260);
  }, 420);

  /* ---------- Бегущие ленты ---------- */
  const tickers = $$(".ticker__track").map((el) => ({ el, dir: +el.dataset.dir || 1, x: 0, w: 0 }));
  const measureTickers = () => tickers.forEach((t) => (t.w = t.el.firstElementChild ? t.el.firstElementChild.offsetWidth : 0));
  let tickerVisible = true;
  let scrollVel = 0;
  let lastScrollY = scrollY;
  let scrollSign = 1;
  function updateTickers() {
    if (!tickerVisible || reduced()) return;
    const speed = 0.7 + Math.min(Math.abs(scrollVel) * 0.25, 14);
    tickers.forEach((t) => {
      if (!t.w) return;
      t.x -= speed * t.dir * scrollSign;
      if (t.x <= -t.w) t.x += t.w;
      if (t.x > 0) t.x -= t.w;
      t.el.style.transform = `translate3d(${t.x.toFixed(2)}px,0,0)`;
    });
  }

  /* ---------- Курсор-клякса ----------
     Свободно: капля, которая тянется по движению и слегка «дышит» краями.
     Над кнопкой: перетекает в её форму и подсвечивает, кнопку слегка тянет к мыши.
     Над крупным блоком (карточка, строка): обрисовывает его мягким контуром.
     Всё на пружинах, поэтому движение мягкое, с небольшим «желе». */
  const cursor = $(".cursor");
  const blob = $(".cursor__blob");
  const label = $(".cursor__label");
  const useCursor = finePointer && !reduced();
  const SNAP = "a, button, [data-cursor], select, summary, label[for]";
  const FREE = 14;
  // капля перетекает только в маленькие кнопки; над крупными блоками остаётся каплей
  const SMALL_W = 240;
  const SMALL_H = 64;

  const spring = (x) => ({ x, v: 0 });
  // k — жёсткость, d — затухание: d < 1 даёт лёгкий перелёт, как у жидкости
  const stepSpring = (s, to, k, d) => { s.v = (s.v + (to - s.x) * k) * d; s.x += s.v; };

  const cur = {
    x: innerWidth / 2, y: innerHeight / 2, // указатель
    cx: spring(innerWidth / 2), cy: spring(innerHeight / 2), // центр капли
    w: spring(FREE), h: spring(FREE), r: spring(FREE / 2),
    free: spring(1), // 1 — свободная капля, 0 — форма кнопки
    lx: spring(innerWidth / 2), ly: spring(innerHeight / 2), // ярлык
    mag: { x: spring(0), y: spring(0) },
    target: null, mode: "free", radius: 0, down: false, last: performance.now(), t: 0,
    lastScroll: scrollY,
  };

  function radiusOf(el, r) {
    let node = el;
    // у кнопки-обёртки радиуса может не быть — берём у родителя (карточка)
    for (let i = 0; i < 2 && node; i++, node = node.parentElement) {
      const v = getComputedStyle(node).borderTopLeftRadius;
      const n = parseFloat(v) || 0;
      if (n) return Math.min(v.endsWith("%") ? (n / 100) * Math.min(r.width, r.height) : n, Math.min(r.width, r.height) / 2);
    }
    return 10;
  }

  function setTarget(t) {
    if (t === cur.target) return;
    releaseMagnet();
    cur.target = t;
    if (!t) {
      cur.mode = "free";
    } else {
      const r = t.getBoundingClientRect();
      cur.mode = r.width <= SMALL_W && r.height <= SMALL_H ? "control" : "free";
      cur.radius = Math.max(radiusOf(t, r), 8);
    }
    cursor.classList.toggle("is-control", cur.mode === "control");
    const lab = t && t.closest("[data-cursor]");
    cursor.classList.toggle("is-label", !!lab);
    if (lab) label.textContent = lab.dataset.cursor;
  }

  function pickTarget(el) {
    if (!el || !el.closest) return setTarget(null);
    const typing = el.closest("input, textarea, [contenteditable]");
    cursor.classList.toggle("is-text", !!typing);
    setTarget(typing ? null : el.closest(SNAP));
  }

  // кнопка возвращается на место с пружинкой
  function releaseMagnet() {
    const el = cur.target;
    if (!el || !el.style.translate) return;
    const from = el.style.translate;
    el.style.translate = "";
    el.animate([{ translate: from }, { translate: "0px 0px" }], { duration: 650, easing: "cubic-bezier(.34,1.56,.64,1)" });
    cur.mag.x.x = cur.mag.y.x = cur.mag.x.v = cur.mag.y.v = 0;
  }

  function splash(x, y) {
    for (let i = 0; i < 7; i++) {
      const d = document.createElement("i");
      d.className = "cursor__drop";
      const size = 3 + Math.random() * 4;
      Object.assign(d.style, { width: size + "px", height: size + "px", left: x - size / 2 + "px", top: y - size / 2 + "px" });
      cursor.append(d);
      const a = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 16 + Math.random() * 20;
      d.animate(
        [{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(0)`, opacity: 0 }],
        { duration: 420 + Math.random() * 200, easing: "cubic-bezier(.2,.8,.3,1)" }
      ).onfinish = () => d.remove();
    }
  }

  // <dialog> открывается в «верхнем слое» и перекрывает любой z-index.
  // Курсор тоже живёт в верхнем слое (popover) и поднимается над каждым открытым окном.
  // Плёнка лежит там же, под курсором: зерно должно быть и поверх окон.
  const canPopover = typeof HTMLElement.prototype.showPopover === "function";
  const film = $("#film");
  function raiseCursor() {
    const layers = [film, useCursor ? cursor : null].filter(Boolean);
    if (canPopover) {
      layers.forEach((el) => {
        if (!el.hasAttribute("popover")) el.setAttribute("popover", "manual");
        if (el.matches(":popover-open")) el.hidePopover();
        el.showPopover();
      });
    } else {
      const host = $("dialog[open]") || document.body;
      layers.forEach((el) => host.append(el));
    }
  }
  raiseCursor();
  $$("dialog").forEach((dlg) => new MutationObserver(() => raiseCursor()).observe(dlg, { attributes: true, attributeFilter: ["open"] }));
  try { if (localStorage.getItem("vhs") === "off") film.classList.add("is-off"); } catch {}

  if (useCursor) {
    root.classList.add("has-cursor");

    addEventListener("pointermove", (e) => {
      cur.x = e.clientX;
      cur.y = e.clientY;
      cursor.classList.remove("is-hidden");
    }, { passive: true });
    document.addEventListener("pointerover", (e) => pickTarget(e.target));
    addEventListener("pointerdown", (e) => {
      cur.down = true;
      splash(e.clientX, e.clientY);
    });
    addEventListener("pointerup", () => (cur.down = false));
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    addEventListener("blur", () => cursor.classList.add("is-hidden"));
  }

  function updateCursor() {
    if (!useCursor) return;
    const now = performance.now();
    const steps = Math.min(4, Math.max(1, Math.round((now - cur.last) / 16.7)));
    cur.last = now;
    cur.t += steps * 0.016;

    // при прокрутке под неподвижной мышью оказывается другой элемент
    if (scrollY !== cur.lastScroll) {
      cur.lastScroll = scrollY;
      pickTarget(document.elementFromPoint(cur.x, cur.y));
    }

    const t = cur.target && cur.target.isConnected ? cur.target : null;
    if (!t && cur.target) setTarget(null);
    let tx = cur.x, ty = cur.y, tw = FREE, th = FREE, tr = FREE / 2;
    if (t && cur.mode === "control") {
      // кнопку тянет к мыши, капля облегает её уже сдвинутой
      if (cur.mode === "control") {
        const r0 = t.getBoundingClientRect();
        const mx = (cur.x - (r0.left + r0.width / 2)) * 0.22;
        const my = (cur.y - (r0.top + r0.height / 2)) * 0.32;
        for (let i = 0; i < steps; i++) {
          stepSpring(cur.mag.x, mx, 0.2, 0.7);
          stepSpring(cur.mag.y, my, 0.2, 0.7);
        }
        t.style.translate = `${cur.mag.x.x.toFixed(2)}px ${cur.mag.y.x.toFixed(2)}px`;
      }
      const r = t.getBoundingClientRect();
      const pad = 7;
      tw = r.width + pad * 2;
      th = r.height + pad * 2;
      tr = cur.radius + pad;
      // центр капли чуть смещается к указателю — будто она тянется за мышью
      const pull = 0.12;
      tx = r.left + r.width / 2 + (cur.x - (r.left + r.width / 2)) * pull;
      ty = r.top + r.height / 2 + (cur.y - (r.top + r.height / 2)) * pull;
      if (cur.down) { tw -= 6; th -= 6; }
    } else if (cur.down) {
      tw = th = FREE * 0.7;
      tr = tw / 2;
    }

    const free = cur.mode === "free";
    for (let i = 0; i < steps; i++) {
      stepSpring(cur.cx, tx, free ? 0.3 : 0.2, free ? 0.6 : 0.68);
      stepSpring(cur.cy, ty, free ? 0.3 : 0.2, free ? 0.6 : 0.68);
      stepSpring(cur.w, tw, 0.17, 0.68);
      stepSpring(cur.h, th, 0.17, 0.68);
      stepSpring(cur.r, tr, 0.17, 0.68);
      stepSpring(cur.free, free ? 1 : 0, 0.12, 0.75);
      stepSpring(cur.lx, cur.x + 18, 0.22, 0.62);
      stepSpring(cur.ly, cur.y + 22, 0.22, 0.62);
    }

    const f = clamp(cur.free.x);
    const w = Math.max(2, cur.w.x);
    const h = Math.max(2, cur.h.x);
    // растяжение по скорости — только у свободной капли
    const vx = cur.cx.v, vy = cur.cy.v;
    const speed = Math.hypot(vx, vy);
    const stretch = Math.min(speed * 0.05, 0.7) * f;
    const angle = speed > 0.1 ? Math.atan2(vy, vx) : 0;
    // «дыхание» краёв: каждый угол колышется в своём ритме
    const wob = (0.16 + Math.min(speed * 0.02, 0.2)) * f;
    const rr = cur.r.x;
    const c = (ph, sp) => (rr * (1 + wob * Math.sin(cur.t * sp + ph))).toFixed(1) + "px";
    const s = blob.style;
    s.width = w.toFixed(1) + "px";
    s.height = h.toFixed(1) + "px";
    s.borderRadius = `${c(0, 3.1)} ${c(1.7, 2.6)} ${c(3.4, 3.5)} ${c(5.1, 2.9)} / ${c(2.2, 2.8)} ${c(4, 3.3)} ${c(0.8, 2.4)} ${c(2.9, 3.7)}`;
    s.transform = `translate3d(${(cur.cx.x - w / 2).toFixed(1)}px, ${(cur.cy.x - h / 2).toFixed(1)}px, 0) rotate(${angle * f}rad) scale(${1 + stretch}, ${1 - stretch * 0.45})`;
    label.style.transform = `translate3d(${cur.lx.x.toFixed(1)}px, ${cur.ly.x.toFixed(1)}px, 0)`;
  }

  /* ---------- Заливка кнопок из точки входа курсора ---------- */
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest(".btn");
    if (!b || b.contains(e.relatedTarget)) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--fx", ((e.clientX - r.left) / r.width) * 100 + "%");
    b.style.setProperty("--fy", ((e.clientY - r.top) / r.height) * 100 + "%");
  });

  /* ---------- 3D-наклон карточек ---------- */
  function bindTilt(scope) {
    if (!finePointer || reduced()) return;
    $$("[data-tilt]", scope).forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", ((nx - 0.5) * 8).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - ny) * 6).toFixed(2) + "deg");
        card.style.setProperty("--mx", nx * 100 + "%");
        card.style.setProperty("--my", ny * 100 + "%");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Параллакс первого экрана ---------- */
  const hero = $(".hero");
  const heroPhoto = $("#heroPhoto");
  if (heroPhoto && finePointer && !reduced()) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      const s = heroPhoto.style;
      s.setProperty("--ry", (nx * 10).toFixed(2) + "deg");
      s.setProperty("--rx", (-ny * 8).toFixed(2) + "deg");
      s.setProperty("--px", (-nx * 14).toFixed(1) + "px");
      s.setProperty("--py", (-ny * 10).toFixed(1) + "px");
      s.setProperty("--lx", (nx * 22).toFixed(1) + "px");
      s.setProperty("--ly", (ny * 16).toFixed(1) + "px");
    });
    hero.addEventListener("pointerleave", () => {
      ["--rx", "--ry", "--px", "--py", "--lx", "--ly"].forEach((v) => heroPhoto.style.removeProperty(v));
    });
  }

  /* ---------- Подсветка карточки контактов ---------- */
  const contactCard = $("#contactCard");
  contactCard.addEventListener("pointermove", (e) => {
    const r = contactCard.getBoundingClientRect();
    contactCard.style.setProperty("--mx", e.clientX - r.left + "px");
    contactCard.style.setProperty("--my", e.clientY - r.top + "px");
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (b) copyText(b.dataset.copy);
  });

  /* ---------- «Облачко» у кнопки почты на первом экране ----------
     mailto без почтового клиента ничего не открывает, поэтому по клику
     над кнопкой всплывает сообщение: «печатает…», затем почта для
     сотрудничества, «Скопировать» и ссылки на новое письмо в Gmail и
     Яндекс Почте (открываются в браузере, адрес и тема уже вписаны). */
  const MAIL_SUBJECT = tr("Сотрудничество", "Collaboration");
  const webmail = (to) => [
    ["Gmail", `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(MAIL_SUBJECT)}`],
    [tr("Яндекс Почта", "Yandex Mail"), `https://mail.yandex.ru/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(MAIL_SUBJECT)}`],
  ];
  const heroSocials = $("#heroSocials");
  let mailBubble = null;

  function closeMailBubble() {
    if (!mailBubble) return;
    const b = mailBubble;
    mailBubble = null;
    $('.social[data-type="email"]', heroSocials)?.classList.remove("is-active");
    b.classList.remove("is-open");
    b.classList.add("is-closing");
    setTimeout(() => b.remove(), 260);
  }

  function openMailBubble(btn) {
    const c = contacts.find((x) => x.type === "email");
    if (!c) return;
    const b = document.createElement("div");
    b.className = "mail-bubble";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", tr("Почта для сотрудничества", "Email for collaboration"));
    b.innerHTML = `
      <span class="mail-bubble__typing" aria-hidden="true"><i></i><i></i><i></i></span>
      <div class="mail-bubble__msg">
        <p>${tr("Пишите мне на почту — открыт к сотрудничеству:", "Email me — I’m open to collaboration:")}</p>
        <b class="mail-bubble__mail">${esc(c.value)}</b>
        <div class="mail-bubble__actions">
          <button class="mail-bubble__btn mail-bubble__btn--accent" type="button" data-copy="${esc(c.value)}">${ICONS.copy}${tr("Скопировать", "Copy")}</button>
          ${webmail(c.value).map(([name, url]) => `<a class="mail-bubble__btn" href="${esc(url)}" target="_blank" rel="noopener">${name}${ICONS.arrowUR}</a>`).join("")}
        </div>
      </div>
      <button class="mail-bubble__close" type="button" aria-label="${tr("Закрыть", "Close")}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
    heroSocials.append(b);
    // хвостик — над кнопкой, само облачко не вылезает за края экрана
    const box = heroSocials.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const center = r.left + r.width / 2;
    const left = clamp(center - 34, 12, innerWidth - b.offsetWidth - 12);
    b.style.left = left - box.left + "px";
    b.style.setProperty("--tail", center - left + "px");
    if (!reduced()) {
      b.classList.add("is-typing");
      setTimeout(() => b.classList.remove("is-typing"), 700);
    }
    requestAnimationFrame(() => b.classList.add("is-open"));
    btn.classList.add("is-active");
    mailBubble = b;
  }

  heroSocials.addEventListener("click", (e) => {
    const a = e.target.closest('.social[data-type="email"]');
    if (!a) return;
    e.preventDefault();
    mailBubble ? closeMailBubble() : openMailBubble(a);
  });
  // закрывается крестиком, кликом мимо и клавишей Esc
  document.addEventListener("click", (e) => {
    if (!mailBubble) return;
    if (e.target.closest(".mail-bubble__close") || !e.target.closest('.mail-bubble, .social[data-type="email"]')) closeMailBubble();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMailBubble());

  /* ---------- Шапка: состояние и активный раздел ---------- */
  const nav = $("#nav");
  const pill = $(".nav__pill");
  const navLinks = $$(".nav__links a");
  let activeLink = navLinks[0];
  function movePill(a) {
    if (!a || !a.offsetWidth) return;
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = `translateX(${a.offsetLeft - 4}px)`;
    pill.style.opacity = 1;
  }
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const link = navLinks.find((a) => a.dataset.spy === en.target.id);
        if (!link) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a === link));
        activeLink = link;
        movePill(link);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["top", "showcase", "about", "works", "achievements", "contact"].forEach((id) => $("#" + id) && spy.observe($("#" + id)));

  /* ---------- Мобильное меню ---------- */
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  $$("nav a", menu).forEach((a, i) => a.style.setProperty("--i", i));
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? tr("Закрыть меню", "Close menu") : tr("Открыть меню", "Open menu"));
    root.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => !menu.classList.contains("is-open") && (menu.hidden = true), 700);
    }
  }
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));

  /* ---------- Тема ---------- */
  const metaTheme = $('meta[name="theme-color"]');
  const syncMeta = () => (metaTheme.content = root.dataset.theme === "light" ? "#f3efe6" : "#0c0c0d");
  syncMeta();
  function setTheme(next, x, y) {
    const apply = () => {
      root.dataset.theme = next;
      syncMeta();
      try { localStorage.setItem("theme", next); } catch {}
    };
    if (!document.startViewTransition || reduced()) return apply();
    root.classList.add("no-trans");
    const tr = document.startViewTransition(apply);
    tr.ready.then(() => {
      const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.7,0,.3,1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
    tr.finished.finally(() => root.classList.remove("no-trans"));
  }
  $("#themeBtn").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTheme(root.dataset.theme === "dark" ? "light" : "dark", r.left + r.width / 2, r.top + r.height / 2);
  });

  /* ---------- Появление при скролле и счётчики ---------- */
  // число набегает от нуля; data-pad — сколько знаков (ведущие нули), data-suffix — хвост вроде «+»
  function countUp(el, delay = 0) {
    const target = +el.dataset.to || 0;
    const pad = +el.dataset.pad || 1;
    const suffix = el.dataset.suffix || "";
    const show = (n) => (el.textContent = String(n).padStart(pad, "0") + suffix);
    if (reduced()) return show(target);
    show(0);
    const t0 = performance.now() + delay;
    const f = (now) => {
      const p = clamp((now - t0) / 1400);
      show(Math.round(easeOut(p) * target));
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add("in");
        if (el.id === "codeWin") typeCode();
        if (el.id === "footerGiant") lightFooter();
        revealIO.unobserve(el);
      });
    },
    { threshold: 0.2 }
  );

  function lightFooter() {
    $$("span", $("#footerGiant")).forEach((s, i) => setTimeout(() => s.classList.add("is-lit"), reduced() ? 0 : i * 70));
  }

  /* ---------- Терминал ---------- */
  const term = $("#terminal");
  const termOut = $("#termOut");
  const termInput = $("#termInput");
  const hist = [];
  let histI = 0;
  const print = (html, cls = "") => {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.innerHTML = html;
    termOut.append(d);
    termOut.scrollTop = termOut.scrollHeight;
  };
  const SECTIONS = EN
    ? { top: "home", showcase: "top 3 works", about: "about me", works: "all projects", achievements: "achievements", contact: "contact" }
    : { top: "главная", showcase: "топ-3 работы", about: "обо мне", works: "все проекты", achievements: "достижения", contact: "контакты" };
  const COMMANDS = {
    help: () =>
      print(
        (EN
          ? [
              "<span class='t-acc'>help</span>          list of commands",
              "<span class='t-acc'>about</span>         a few words about me",
              "<span class='t-acc'>projects</span>      my work",
              "<span class='t-acc'>open</span> &lt;n&gt;      open project number n",
              "<span class='t-acc'>achievements</span>  achievements",
              "<span class='t-acc'>contact</span>       how to reach me",
              "<span class='t-acc'>ls</span> / <span class='t-acc'>cd</span> &lt;section&gt;  go to a section",
              "<span class='t-acc'>theme</span>         toggle the theme",
              "<span class='t-acc'>vhs</span> [on|off]    film grain over the site",
              "<span class='t-acc'>intro</span> vhs|code  choose the intro",
              "<span class='t-acc'>lang</span> ru|en      switch the language",
              "<span class='t-acc'>clear</span>         clear the screen",
              "<span class='t-acc'>exit</span>          close the terminal",
              "<span class='t-cmd'>…and one more secret command with sudo</span>",
            ]
          : [
              "<span class='t-acc'>help</span>          список команд",
              "<span class='t-acc'>about</span>         коротко обо мне",
              "<span class='t-acc'>projects</span>      мои работы",
              "<span class='t-acc'>open</span> &lt;n&gt;      открыть проект номер n",
              "<span class='t-acc'>achievements</span>  достижения",
              "<span class='t-acc'>contact</span>       как связаться",
              "<span class='t-acc'>ls</span> / <span class='t-acc'>cd</span> &lt;раздел&gt;  перейти к разделу",
              "<span class='t-acc'>theme</span>         сменить тему",
              "<span class='t-acc'>vhs</span> [on|off]    плёнка и зерно поверх сайта",
              "<span class='t-acc'>intro</span> vhs|code  выбрать вступление",
              "<span class='t-acc'>lang</span> ru|en      сменить язык",
              "<span class='t-acc'>clear</span>         очистить экран",
              "<span class='t-acc'>exit</span>          закрыть терминал",
              "<span class='t-cmd'>…и ещё одна секретная команда с sudo</span>",
            ]
        ).join("\n")
      ),
    about: () => {
      const s = P.study || {};
      const w = P.work || {};
      const site = `<a href="${esc(w.url)}" target="_blank" rel="noopener">${esc((w.url || "").replace(/^https?:\/\/|\/$/g, ""))}</a>`;
      print(
        EN
          ? `${esc(P.firstName)} ${esc(P.lastName)} — ${esc((P.role || "").toLowerCase())}.\nStudying: ${esc(s.place)}, ${esc(s.level)}, “${esc(s.program)}”.\nWorking at: ${esc(w.company)}, ${esc(w.city)} — ${site}`
          : `${esc(P.firstName)} ${esc(P.lastName)} — ${esc((P.role || "").toLowerCase())}.\nУчусь: ${esc(s.place)}, ${esc(s.level)} «${esc(s.program)}».\nРаботаю: ${esc(w.company)}, ${esc(w.city)} — ${site}`
      );
    },
    projects: () => print(projects.map((p, i) => `<span class='t-acc'>[${i + 1}]</span> ${esc(p.title).padEnd(12)} <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.domain)}</a>`).join("\n") + `\n<span class='t-cmd'>open &lt;n&gt; — ${tr("открыть", "open")}</span>`),
    open: (n) => {
      const p = projects[+n - 1];
      if (!p) return print(tr("Нет проекта с таким номером. Смотри: projects", "There’s no project with that number. Try: projects"));
      if (!p.url) {
        print(tr(`У «${esc(p.title)}» нет ссылки — открываю описание…`, `“${esc(p.title)}” has no link — opening the details…`));
        closeTerm();
        return openMedia(p, "project");
      }
      print(`<span class='t-ok'>✓</span> ${tr("открываю", "opening")} ${esc(p.domain || p.url)}…`);
      window.open(p.url, "_blank", "noopener");
    },
    achievements: () => print(achievements.map((a) => `<span class='t-acc'>★</span> ${esc(a.title)}`).join("\n") || tr("Скоро здесь будет много всего.", "Plenty coming here soon.")),
    contact: () => print(contacts.map((c) => `${esc(c.label).padEnd(10)} <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.value)}</a>`).join("\n")),
    ls: () => print(Object.entries(SECTIONS).map(([k, v]) => `<span class='t-acc'>${k}/</span>  <span class='t-cmd'>${v}</span>`).join("\n")),
    cd: (s) => {
      if (!SECTIONS[s]) return print(tr("cd: нет такого раздела. Смотри: ls", "cd: no such section. Try: ls"));
      closeTerm();
      $("#" + s).scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
    },
    theme: () => {
      const r = $("#themeBtn").getBoundingClientRect();
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next, r.left + r.width / 2, r.top + r.height / 2);
      print(`<span class='t-ok'>✓</span> ${tr("тема", "theme")}: ${next === "light" ? tr("светлая", "light") : tr("тёмная", "dark")}`);
    },
    date: () => print(new Date().toLocaleString(LOCALE)),
    whoami: () => print(tr("гость, которому очень нравится этот сайт 🙂", "a guest who really likes this site 🙂")),
    intro: (v) => {
      if (v !== "vhs" && v !== "code") return print(tr(`сейчас: <span class='t-acc'>${INTRO}</span>. Варианты: intro vhs · intro code`, `current: <span class='t-acc'>${INTRO}</span>. Options: intro vhs · intro code`));
      try { localStorage.setItem("intro", v); sessionStorage.removeItem("fx-seen"); } catch {}
      print(`<span class='t-ok'>✓</span> ${tr(`вступление «${v}», перезагружаю…`, `intro “${v}”, reloading…`)}`);
      setTimeout(() => location.reload(), 700);
    },
    lang: (v) => {
      if (v !== "ru" && v !== "en") return print(tr(`сейчас: <span class='t-acc'>${LANG}</span>. Варианты: lang ru · lang en`, `current: <span class='t-acc'>${LANG}</span>. Options: lang ru · lang en`));
      print(`<span class='t-ok'>✓</span> ${v === "en" ? "switching to English…" : "переключаю на русский…"}`);
      setTimeout(() => setLang(v), 500);
    },
    vhs: (mode) => {
      const off = mode ? mode === "off" : !film.classList.contains("is-off");
      film.classList.toggle("is-off", off);
      try { localStorage.setItem("vhs", off ? "off" : "on"); } catch {}
      print(`<span class='t-ok'>✓</span> ${off ? tr("плёнка выключена", "film effect off") : tr("плёнка включена", "film effect on")}`);
    },
    clear: () => (termOut.innerHTML = ""),
    exit: () => closeTerm(),
    sudo: (...args) => {
      if (args.join(" ") === "hire firas") {
        print(tr("[sudo] пароль для guest: ********", "[sudo] password for guest: ********"));
        setTimeout(() => {
          const tg = contacts.find((c) => c.type === "telegram");
          const link = `<a href="${esc(tg ? tg.url : "#contact")}" target="_blank" rel="noopener">${esc(tg ? tg.value : tr("контакты", "contacts"))}</a>`;
          print(tr(`<span class='t-ok'>Доступ разрешён ✓</span> Отличный выбор!\nПишите: ${link}`, `<span class='t-ok'>Access granted ✓</span> Great choice!\nMessage me: ${link}`));
          confetti();
        }, 600);
      } else print(tr("sudo: попробуй «sudo hire firas»", "sudo: try “sudo hire firas”"));
    },
  };

  function runCommand(raw) {
    const line = raw.trim();
    print(`<span class='t-ok'>➜</span> <span class='t-cmd'>~</span> ${esc(line)}`);
    if (!line) return;
    hist.push(line);
    histI = hist.length;
    const [cmd, ...args] = line.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) fn(...args);
    else print(`command not found: ${esc(cmd)}. ${tr("Попробуй", "Try")} <span class='t-acc'>help</span>`);
  }

  let termOpened = false;
  function openTerm() {
    term.hidden = false;
    root.style.overflow = "hidden";
    if (!termOpened) {
      termOpened = true;
      print(tr("Добро пожаловать в терминал F/FOLIO 👋\nНапиши <span class='t-acc'>help</span>, чтобы увидеть команды.", "Welcome to the F/FOLIO terminal 👋\nType <span class='t-acc'>help</span> to see the commands."));
    }
    setTimeout(() => termInput.focus(), 30);
  }
  function closeTerm() {
    term.hidden = true;
    root.style.overflow = "";
  }
  $("#termBtn").addEventListener("click", openTerm);
  $$("[data-open-term]").forEach((b) => b.addEventListener("click", openTerm));
  $(".terminal__close").addEventListener("click", closeTerm);
  term.addEventListener("click", (e) => e.target === term && closeTerm());
  $("#termForm").addEventListener("submit", (e) => {
    e.preventDefault();
    runCommand(termInput.value);
    termInput.value = "";
  });
  termInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hist.length) {
      histI = Math.max(0, histI - 1);
      termInput.value = hist[histI];
      e.preventDefault();
    } else if (e.key === "ArrowDown" && hist.length) {
      histI = Math.min(hist.length, histI + 1);
      termInput.value = hist[histI] || "";
      e.preventDefault();
    }
  });
  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (e.key === "Escape" && !term.hidden) closeTerm();
    else if ((e.key === "`" || e.key === "ё" || e.key === "Ё") && !typing && term.hidden) {
      e.preventDefault();
      openTerm();
    }
  });

  function confetti() {
    if (reduced()) return;
    const colors = ["#ff9f1c", "#ffd166", "#f4f1ea", "#3ddc84", "#ff6b6b"];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.background = colors[i % colors.length];
      c.style.left = innerWidth / 2 + "px";
      c.style.top = innerHeight / 2 + "px";
      document.body.append(c);
      const a = Math.random() * Math.PI * 2;
      const v = 200 + Math.random() * 420;
      c.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          { transform: `translate(${Math.cos(a) * v}px, ${Math.sin(a) * v + 380}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ],
        { duration: 1400 + Math.random() * 900, easing: "cubic-bezier(.2,.8,.3,1)" }
      ).onfinish = () => c.remove();
    }
  }

  /* ---------- Подвал ---------- */
  function renderFooter() {
    const about = $("#footerAbout");
    if (about) about.textContent = `${[P.role, P.city].filter(Boolean).join(" · ")}. ${tr("Делаю сайты, веб-платформы и информационные системы — от идеи до продакшена.", "I build websites, web platforms and information systems — from idea to production.")}`;
    const st = $("#footerStatus");
    if (st && P.status) st.textContent = P.status;
    const tg = contacts.find((c) => c.type === "telegram") || contacts[0];
    const cta = $("#footerCta");
    if (cta && tg) {
      cta.href = tg.url;
      if (isExternal(tg.url)) Object.assign(cta, { target: "_blank", rel: "noopener" });
      $(".footer__cta-label", cta).textContent = tr("Написать в ", "Message me on ") + tg.label;
    }
    $("#footerProjects").innerHTML =
      projects
        .slice(0, 6)
        .map((p) =>
          p.url
            ? `<li><a href="${esc(p.url)}" target="_blank" rel="noopener"><span>${esc(p.title)}<small>${esc(p.domain || p.category)}</small></span>${ICONS.arrowUR}</a></li>`
            : `<li><button type="button" data-project="${esc(p.id)}"><span>${esc(p.title)}<small>${esc(p.category)}</small></span></button></li>`
        )
        .join("") + `<li><a href="#works" class="footer__more">${tr("Все работы →", "All work →")}</a></li>`;
    $("#footerContacts").innerHTML = contacts
      .map((c) => `<li><a href="${esc(c.url)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""}><i class="footer__ic">${iconFor(c.type)}</i><span>${esc(c.label)}<small>${esc(c.value)}</small></span></a></li>`)
      .join("");
  }

  /* ---------- Часы в подвале ---------- */
  function startClock() {
    const fmt = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: P.timezone || "Europe/Moscow" });
    const el = $("#clock");
    const tick = () => (el.textContent = `${P.city || ""}, ${fmt.format(new Date())}`);
    tick();
    setInterval(tick, 1000);
    $("#year").textContent = new Date().getFullYear();
  }

  // гигантское имя в подвале ровно по ширине экрана
  function fitGiant() {
    const g = $("#footerGiant");
    g.style.fontSize = "100px";
    const w = g.scrollWidth;
    if (w) g.style.fontSize = Math.min(220, (100 * (g.clientWidth * 0.94)) / w) + "px";
  }

  /* ---------- Какое вступление показывать ----------
     ?intro=code или ?intro=vhs в адресе — переключить (запоминается),
     в терминале — команда «intro code» / «intro vhs». */
  const INTRO_DEFAULT = "code";
  const introParam = new URLSearchParams(location.search).get("intro");
  const INTRO = (() => {
    if (introParam === "vhs" || introParam === "code") {
      try { localStorage.setItem("intro", introParam); } catch {}
      return introParam;
    }
    try {
      const v = localStorage.getItem("intro");
      if (v === "vhs" || v === "code") return v;
    } catch {}
    return INTRO_DEFAULT;
  })();
  root.dataset.intro = INTRO;

  // полное вступление — первый раз за визит (или когда вариант выбран ссылкой)
  function introIsFull() {
    let seen = false;
    try { seen = sessionStorage.getItem("fx-seen") === "1"; } catch {}
    try { sessionStorage.setItem("fx-seen", "1"); } catch {}
    return !seen || !!introParam;
  }

  function runIntro(done) {
    // в предпросмотре и сразу после смены языка вступление только мешает — сразу показываем сайт
    let skip = false;
    try {
      skip = sessionStorage.getItem("fx-skip-intro") === "1";
      sessionStorage.removeItem("fx-skip-intro");
    } catch {}
    if (PREVIEW || skip) {
      $("#tv")?.remove();
      $("#compile")?.remove();
      return done();
    }
    if (INTRO === "code") {
      $("#tv")?.remove();
      return runCodeIntro(done);
    }
    $("#compile")?.remove();
    return runVhsIntro(done);
  }

  /* ---------- Вступление «запуск сайта» ----------
     Имя уже стоит на своём месте, но тёмное, как выключенная вывеска.
     Под ним терминал: npm install → npm run build → npm start.
     На «включаю свет…» надпись загорается с одним щелчком, терминал
     сворачивается в «Задача выполнена ✓», и проявляется остальной сайт.
     Повторно за визит — короткая версия. Клик или клавиша — пропустить. */
  function runCodeIntro(done) {
    const box = $("#compile");
    $("#film")?.classList.add("is-off");
    const name = $("#heroName");
    if (!box) return done();
    if (reduced() || scrollY > innerHeight * 0.5 || !name) {
      box.remove();
      return done();
    }
    const full = introIsFull();
    root.classList.add("is-compiling");
    root.style.overflow = "hidden";

    const term = $("#cTerm");
    const out = $("#cOut");
    const glow = $(".compile__glow", box);
    const pill = $("#cDone");
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    let lit = false;
    let revealed = false;
    const t0 = performance.now();

    // терминал — под надписью, свечение — за ней
    const place = () => {
      const r = name.getBoundingClientRect();
      const th = term.offsetHeight || 270;
      box.style.setProperty("--term-top", Math.round(Math.min(r.bottom + Math.min(56, innerHeight * 0.06), innerHeight - th - 40)) + "px");
      Object.assign(glow.style, { left: r.left + r.width / 2 + "px", top: r.top + r.height / 2 + "px", width: r.width * 1.5 + "px", height: r.height * 3.2 + "px" });
    };
    place();
    document.fonts && document.fonts.ready.then(place);
    addEventListener("resize", place);

    const prompt = `<span class="t-ok">➜</span> <span class="t-acc">f-folio</span> <span class="t-dim">git:(</span><span class="t-red">main</span><span class="t-dim">)</span> `;
    const line = (html) => {
      const d = document.createElement("div");
      d.innerHTML = html;
      out.append(d);
      out.scrollTop = out.scrollHeight;
      return d;
    };
    const caret = Object.assign(document.createElement("span"), { className: "caret" });
    const typeCmd = (text, then) => {
      const d = line(prompt + '<span class="t-cmd"></span>');
      const cmd = $(".t-cmd", d);
      d.append(caret);
      let n = 0;
      const tick = () => {
        cmd.textContent = text.slice(0, ++n);
        if (n < text.length) return at(full ? 26 : 14, tick);
        caret.remove();
        at(full ? 110 : 50, then);
      };
      at(full ? 90 : 30, tick);
    };
    const count = (n, forms) => `${n} ${plural(n, forms)}`;
    const projNames = projects.slice(0, 3).map((p) => p.title).join(", ") + (projects.length > 3 ? "…" : "");
    const progress = (d, dur, then) => {
      const bar = $(".c-bar i", d);
      const pct = $(".c-pct", d);
      const s = performance.now();
      const id = setInterval(() => {
        const p = clamp((performance.now() - s) / dur);
        const e = easeInOut(p);
        bar.style.transform = `scaleX(${e})`;
        pct.textContent = Math.round(e * 100) + "%";
        if (p >= 1) {
          clearInterval(id);
          then();
        }
      }, 16);
      timers.push(id);
    };

    const steps = full
      ? [
          (next) =>
            typeCmd("npm install", () => {
              line(`<span class="t-dim">${tr("добавлено:", "added:")}</span> ${count(projects.length, FACT_WORDS.projects)} · ${count(achievements.length, FACT_WORDS.achievements)} · ${count(contacts.length, EN ? ["contact", "contacts", "contacts"] : ["контакт", "контакта", "контактов"])}`);
              at(110, () => {
                line(`<span class="t-ok">✓</span> ${tr("зависимости на месте", "dependencies installed")}`);
                at(160, next);
              });
            }),
          (next) =>
            typeCmd("npm run build", () => {
              const d = line(`<span class="t-dim">▸</span> ${tr("собираю страницу", "building the page")} <span class="c-bar"><i></i></span> <span class="c-pct">0%</span>`);
              progress(d, 420, () => {
                line(`<span class="t-ok">✓</span> ${tr("собрано за 0.42 с", "built in 0.42 s")}`);
                at(170, next);
              });
            }),
          (next) =>
            typeCmd("npm start", () => {
              line(`<span class="t-dim">▸</span> ${tr("поднимаю сервер…", "starting the server…")}`);
              at(170, () => {
                line(`<span class="t-dim">▸</span> ${tr("подключаю проекты:", "loading projects:")} ${esc(projNames)}`);
                at(200, () => {
                  line(`<span class="t-dim">▸</span> ${tr("включаю свет…", "turning on the lights…")}`);
                  at(260, () =>
                    lightUp(() => {
                      line(`<span class="t-ok">✓ ${tr("сайт запущен", "site is live")}</span> <span class="t-dim">${tr("за", "in")} ${((performance.now() - t0) / 1000).toFixed(1)} ${tr("с", "s")}</span>`);
                      at(380, next);
                    })
                  );
                });
              });
            }),
        ]
      : [
          (next) =>
            typeCmd("npm start", () => {
              line(`<span class="t-dim">▸</span> ${tr("включаю свет…", "turning on the lights…")}`);
              at(200, () =>
                lightUp(() => {
                  line(`<span class="t-ok">✓ ${tr("сайт запущен", "site is live")}</span>`);
                  at(280, next);
                })
              );
            }),
        ];
    const run = (i) => (i < steps.length ? steps[i](() => run(i + 1)) : complete());

    // надпись загорается по буквам, как неон: каждая пару раз мигает и остаётся гореть
    const chars = $$(".char", name);
    const on = () => {
      chars.forEach((c) => c.classList.add("is-on"));
      root.classList.add("is-lit");
      name.classList.add("is-glow");
      glow.classList.add("is-on");
    };
    function lightUp(then) {
      if (lit) return then && then();
      lit = true;
      const gap = full ? 95 : 45;
      chars.forEach((c, i) => at(i * gap + Math.random() * gap * 0.6, () => c.classList.add("is-on")));
      at(chars.length * gap * 0.35, () => glow.classList.add("is-on"));
      const end = chars.length * gap + (full ? 560 : 320);
      at(end, on);
      at(end + 140, () => then && then());
    }

    // терминал сворачивается в «Задача выполнена»
    function complete() {
      if (revealed) return;
      term.classList.add("is-out");
      pill.classList.add("is-on");
      $("#cDoneTime").textContent = `${tr("сайт запущен за", "site launched in")} ${((performance.now() - t0) / 1000).toFixed(1)} ${tr("с", "s")}`;
      at(full ? 950 : 650, reveal);
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      timers.forEach((id) => (clearTimeout(id), clearInterval(id)));
      caret.remove();
      lit = true;
      on();
      pill.classList.add("is-leave");
      term.classList.add("is-out");
      box.classList.add("is-reveal");
      root.classList.remove("is-compiling");
      root.style.overflow = "";
      removeEventListener("resize", place);
      done();
      pixelBuild();
      setTimeout(() => {
        box.remove();
        root.classList.remove("is-lit");
      }, 1500);
      setTimeout(() => name.classList.remove("is-glow"), 2400);
    }

    // фото на бейдже проявляется из крупных пикселей
    function pixelBuild() {
      const arch = $(".idcard__photo") || $(".hero__arch");
      const img = $("#heroImg");
      if (!arch || !img || !img.naturalWidth) return;
      const w = arch.clientWidth;
      const h = arch.clientHeight;
      const cv = document.createElement("canvas");
      cv.className = "hero__pixels";
      cv.width = w;
      cv.height = h;
      arch.append(cv);
      const ctx = cv.getContext("2d");
      const tmp = document.createElement("canvas");
      const tctx = tmp.getContext("2d");
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const sw = w / scale;
      const sh = h / scale;
      const sx = (img.naturalWidth - sw) * 0.5;
      const sy = (img.naturalHeight - sh) * 0.32;
      [4, 7, 12, 20, 34, 56, 100].forEach((n, k) =>
        setTimeout(() => {
          tmp.width = n;
          tmp.height = Math.max(1, Math.round((n * h) / w));
          tctx.drawImage(img, sx, sy, sw, sh, 0, 0, tmp.width, tmp.height);
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(tmp, 0, 0, w, h);
        }, 200 + k * 90)
      );
      setTimeout(() => {
        cv.classList.add("is-out");
        setTimeout(() => cv.remove(), 450);
      }, 200 + 7 * 90 + 60);
    }

    box.addEventListener("pointerdown", () => reveal());
    addEventListener("keydown", function onKey() {
      removeEventListener("keydown", onKey);
      reveal();
    });
    at(full ? 340 : 160, () => run(0));
  }

  /* ---------- Бейдж на первом экране ----------
     Висит на ленте и чуть покачивается. Можно потянуть мышью или пальцем —
     раскачается и вернётся на пружине. Клик/тап/Enter — перевернуть:
     на обороте QR-код на Telegram и «чем я занят сейчас». */
  function initIdCard() {
    const card = $("#idcard");
    const flip = $("#idFlip");
    if (!card || !flip) return;

    const w = P.work || {};
    const s = P.study || {};
    $("#idName").textContent = [P.firstName, P.lastName].filter(Boolean).join(" ") || tr("Фирас Хашаб", "Firas Khashab");
    $("#idRole").textContent = [P.role, w.company].filter(Boolean).join(" · ");
    $("#nowWorkLabel").textContent = w.city ? `${tr("Работаю", "Working")} · ${w.city}` : tr("Работаю", "Working");
    $("#nowWork").innerHTML = w.url ? `<a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.company)}</a>` : esc(w.company || "—");
    $("#nowStudy").textContent = [s.place, s.short || s.program].filter(Boolean).join(" · ") || "—";
    $("#nowStatus").textContent = P.status || tr("Открыт к новым проектам", "Open to new projects");
    if (P.qr) $("#idQr").src = P.qr;
    const tg = contacts.find((c) => c.type === "telegram") || contacts[0];
    const qrLink = $("#idQrLink");
    if (tg) {
      qrLink.href = tg.url;
      $("#idQr").alt = `${tr("QR-код", "QR code")}: ${tg.label} ${tg.value}`;
      if (isExternal(tg.url)) Object.assign(qrLink, { target: "_blank", rel: "noopener" });
    }
    const fmt = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit", timeZone: P.timezone || "Europe/Moscow" });
    const clock = () => ($("#nowTime").textContent = `${P.city || tr("Местное время", "Local time")}, ${fmt.format(new Date())}`);
    clock();
    setInterval(clock, 15000);

    // переворот
    const setFlip = (on) => {
      card.classList.toggle("is-flipped", on);
      flip.setAttribute("aria-pressed", on);
      st.v += on ? -1.6 : 1.6; // переворот слегка раскачивает бейдж
    };
    flip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setFlip(!card.classList.contains("is-flipped"));
      }
    });

    // маятник: угол a, скорость v; без касания тянется к лёгкому покачиванию
    const st = { a: 0, v: 0, drag: false, x0: 0, a0: 0, moved: false, id: null };
    let visible = true;
    new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(card);
    const tick = (now) => {
      requestAnimationFrame(tick);
      if (!visible || st.drag) return;
      const idle = reduced() ? 0 : Math.sin(now / 1500) * 1.4;
      st.v += (idle - st.a) * 0.018;
      st.v *= 0.965;
      st.a += st.v;
      card.style.setProperty("--swing", st.a.toFixed(2) + "deg");
    };
    requestAnimationFrame(tick);

    flip.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("a")) return;
      st.drag = true;
      st.moved = false;
      st.x0 = e.clientX;
      st.a0 = st.a;
      st.id = e.pointerId;
      flip.setPointerCapture(e.pointerId);
    });
    flip.addEventListener("pointermove", (e) => {
      if (!st.drag || e.pointerId !== st.id) {
        // быстрое движение мыши над бейджем слегка его толкает
        if (!st.drag && e.pointerType === "mouse") st.v += clamp(e.movementX * 0.015, -0.6, 0.6);
        return;
      }
      const dx = e.clientX - st.x0;
      if (Math.abs(dx) > 6 && !st.moved) {
        st.moved = true;
        card.classList.add("is-dragging");
      }
      if (!st.moved) return;
      const a = clamp(st.a0 + dx * 0.11, -38, 38);
      st.v = a - st.a;
      st.a = a;
      card.style.setProperty("--swing", st.a.toFixed(2) + "deg");
    });
    const release = (e) => {
      if (!st.drag || (e && e.pointerId !== st.id)) return;
      st.drag = false;
      card.classList.remove("is-dragging");
      if (!st.moved) setFlip(!card.classList.contains("is-flipped"));
    };
    flip.addEventListener("pointerup", release);
    flip.addEventListener("pointercancel", () => {
      st.drag = false;
      card.classList.remove("is-dragging");
    });
  }

  // первый экран в режиме «код»: моно-приветствие, каретка после имени,
  // а фон — настоящий код этого сайта, который подсвечивается вокруг курсора
  function initCodeHero() {
    if (INTRO !== "code") return;
    $(".hero__hello").textContent = tr("// привет, я программист", "// hi, I’m a software developer");
    $$(".hero__name .word").at(-1)?.insertAdjacentHTML("beforeend", '<i class="hero__caret" aria-hidden="true"></i>');
    const src = [runCodeIntro, initHeroAtmosphere, updateLaptop, renderShowcase, openMedia, updateCursor, typeCode, setTheme]
      .map((f) => f.toString())
      .join("\n\n");
    let text = src;
    while (text.length < 16000) text += "\n\n" + src;
    $$(".hero__src").forEach((p) => (p.textContent = text));
  }

  // подзаголовок: «Создаю …» с печатающимся словом
  function typedSubtitle() {
    const el = $("#heroType");
    if (!el) return;
    const words = P.typing && P.typing.length ? P.typing : EN ? ["websites", "web platforms", "information systems", "interfaces", "chatbots"] : ["сайты", "веб-платформы", "информационные системы", "интерфейсы", "чат-ботов"];
    el.textContent = words[0];
    if (reduced()) return;
    let wi = 0;
    let ci = words[0].length;
    let del = true;
    const step = () => {
      const w = words[wi];
      if (del) {
        if (ci > 0) {
          el.textContent = w.slice(0, --ci);
          return setTimeout(step, 30);
        }
        del = false;
        wi = (wi + 1) % words.length;
        return setTimeout(step, 260);
      }
      const nw = words[wi];
      if (ci < nw.length) {
        el.textContent = nw.slice(0, ++ci);
        return setTimeout(step, 60 + Math.random() * 60);
      }
      del = true;
      setTimeout(step, 2200);
    };
    setTimeout(step, 4600);
  }

  /* ---------- Вступление: включается VHS-телевизор ----------
     Первый визит: белая точка → линия → кадр с помехами и «▶ PLAY» → сигнал ловится,
     сайт проступает сквозь развёртку и на миг расходится по цветам.
     Повторно за визит — короткая версия. Клик или клавиша — пропустить. */
  function runVhsIntro(done) {
    const tv = $("#tv");
    if (!tv) return done();
    if (reduced()) {
      tv.remove();
      return done();
    }
    const full = introIsFull();
    const T = full ? { open: 120, on: 720, clear: 1150, reveal: 2050, end: 2700 } : { open: 40, on: 380, clear: 0, reveal: 560, end: 1050 };

    root.style.overflow = "hidden";
    const screen = $(".tv__screen", tv);
    const canvas = $(".tv__noise", tv);
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(canvas.width, canvas.height);
    const buf = new Uint32Array(img.data.buffer);
    let alive = true;
    // помехи: серый шум с холодным оттенком, как на старой кассете
    const noise = () => {
      if (!alive) return;
      for (let i = 0; i < buf.length; i++) {
        const v = (Math.random() * 235) | 0;
        buf[i] = (255 << 24) | (Math.min(255, v + 28) << 16) | (v << 8) | v;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(noise);
    };
    const t0 = performance.now();
    const clock = setInterval(() => {
      const s = Math.floor((performance.now() - t0) / 1000) + 1;
      $("#tvTime").textContent = `SP 0:00:${String(s).padStart(2, "0")}`;
    }, 250);

    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    let finished = false;

    at(T.open, () => {
      screen.animate(
        [
          { transform: "scale(.015, .003)", filter: "brightness(3)" },
          { transform: "scale(1, .004)", filter: "brightness(2.5)", offset: 0.45 },
          { transform: "scale(1, 1)", filter: "brightness(1)" },
        ],
        { duration: full ? 620 : 320, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }
      );
    });
    at(T.on, () => {
      screen.classList.add("is-on");
      noise();
    });
    if (full) at(T.clear, () => screen.classList.add("is-clearing"));
    at(T.reveal, reveal);
    at(T.end, finish);

    function reveal() {
      if (tv.classList.contains("is-reveal")) return;
      tv.classList.add("is-reveal");
      root.classList.add("is-tuning");
      done();
      // кадр с помехами мигает и гаснет — под ним уже сайт
      screen.animate([{ opacity: 1 }, { opacity: 0.25 }, { opacity: 0.8 }, { opacity: 0.1 }, { opacity: 0.45 }, { opacity: 0 }], { duration: 480, easing: "steps(6)", fill: "forwards" });
      setTimeout(() => root.classList.remove("is-tuning"), 900);
    }
    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      reveal();
      tv.classList.add("is-done");
      root.style.overflow = "";
      setTimeout(() => {
        alive = false;
        clearInterval(clock);
        tv.remove();
      }, 400);
    }
    const skip = () => {
      timers.forEach(clearTimeout);
      reveal();
      setTimeout(finish, 350);
    };
    tv.addEventListener("pointerdown", skip, { once: true });
    addEventListener("keydown", function onKey() {
      removeEventListener("keydown", onKey);
      if (!finished) skip();
    });
  }

  /* ---------- Первый экран: жидкий свет, зерно, таймкод, глитч ---------- */
  function initHeroAtmosphere() {
    initCodeHero();
    typedSubtitle();
    const cv = $("#heroLiquid");
    const grain = $(".film__grain");

    // зерно для всего сайта: одна шумовая текстура, дальше её только двигает CSS
    const g = document.createElement("canvas");
    g.width = g.height = 180;
    const gc = g.getContext("2d");
    const gi = gc.createImageData(180, 180);
    for (let i = 0; i < gi.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v;
      gi.data[i + 3] = (Math.random() * 120) | 0;
    }
    gc.putImageData(gi, 0, 0);
    grain.style.backgroundImage = `url(${g.toDataURL()})`;

    // свет: несколько тёплых пятен медленно плывут, одно тянется за курсором.
    // Рисуем на крошечном canvas — при растяжении он сам становится мягким.
    const ctx = cv.getContext("2d");
    const SCALE = 0.12;
    let w = 0, h = 0;
    const resize = () => {
      w = cv.width = Math.max(40, Math.round(hero.clientWidth * SCALE));
      h = cv.height = Math.max(40, Math.round(hero.clientHeight * SCALE));
    };
    resize();
    addEventListener("resize", resize);
    // x, y — опорная точка (доли экрана), r — радиус, fx/fy — скорость дрейфа
    const blobs = [
      { x: 0.5, y: 0.74, r: 0.34, c: [255, 140, 20], a: 0.5, fx: 0.07, fy: 0.05, ph: 0 },
      { x: 0.3, y: 0.62, r: 0.26, c: [255, 84, 30], a: 0.34, fx: 0.05, fy: 0.08, ph: 2.1 },
      { x: 0.72, y: 0.6, r: 0.25, c: [255, 196, 80], a: 0.28, fx: 0.06, fy: 0.04, ph: 4.2 },
      { x: 0.58, y: 0.95, r: 0.3, c: [230, 70, 40], a: 0.3, fx: 0.04, fy: 0.06, ph: 1.3 },
    ];
    const m = { x: 0.5, y: 0.7, tx: 0.5, ty: 0.7 };
    const lit = INTRO === "code" ? $(".hero__src--lit") : null;
    const L = { x: null, y: null, ptr: false };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      m.tx = (e.clientX - r.left) / r.width;
      m.ty = (e.clientY - r.top) / r.height;
      L.ptr = e.pointerType === "mouse";
    });
    hero.addEventListener("pointerleave", () => (L.ptr = false));
    let visible = true;
    new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(hero);

    let last = 0;
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!visible || document.hidden || now - last < 33) return; // ~30 кадров хватает
      last = now;
      const t = now / 1000;
      const dark = root.dataset.theme !== "light";
      const k = dark ? 1 : 0.6;
      m.x = lerp(m.x, m.tx, 0.03);
      m.y = lerp(m.y, m.ty, 0.03);
      if (lit) {
        // «фонарик»: за мышью, а без мыши — медленно бродит сам
        const W = hero.clientWidth;
        const H = hero.clientHeight;
        const tx = L.ptr ? m.tx * W : W * (0.5 + 0.34 * Math.sin(t * 0.33));
        const ty = L.ptr ? m.ty * H : H * (0.48 + 0.24 * Math.sin(t * 0.51));
        L.x = L.x === null ? tx : lerp(L.x, tx, 0.22);
        L.y = L.y === null ? ty : lerp(L.y, ty, 0.22);
        lit.style.setProperty("--lx-src", L.x.toFixed(0) + "px");
        lit.style.setProperty("--ly-src", L.y.toFixed(0) + "px");
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      const big = Math.max(w, h);
      const spot = (x, y, r, [cr, cg, cb], a) => {
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        gr.addColorStop(0.55, `rgba(${cr},${cg},${cb},${a * 0.35})`);
        gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
      };
      blobs.forEach((b) => {
        const x = (b.x + Math.sin(t * b.fx * 6.28 + b.ph) * 0.14 + (m.x - 0.5) * 0.08) * w;
        const y = (b.y + Math.cos(t * b.fy * 6.28 + b.ph) * 0.1 + (m.y - 0.5) * 0.06) * h;
        const r = b.r * big * (1 + Math.sin(t * 0.4 + b.ph) * 0.12);
        spot(x, y, r, b.c, b.a * k);
      });
      spot(m.x * w, m.y * h, 0.17 * big, [255, 150, 40], 0.26 * k);
    };
    if (reduced()) {
      visible = true;
      draw(1000);
    } else requestAnimationFrame(draw);

    // таймкод кассеты: сколько вы уже на сайте
    const osd = $("#heroTime");
    const start = Date.now();
    if (osd) setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      osd.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }, 1000);

    // глитч имени: при наведении и изредка сам по себе
    const name = $("#heroName");
    const scramble = () => {
      if (reduced() || name.dataset.busy) return;
      name.dataset.busy = "1";
      const GL = "<>/{}[]=;:01#*";
      const cs = $$(".char", name);
      let left = cs.length;
      cs.forEach((c, i) => {
        const real = c.textContent;
        c.style.width = c.getBoundingClientRect().width + "px";
        c.style.textAlign = "center";
        let n = 0;
        const max = 3 + (i % 3) + ((Math.random() * 4) | 0);
        const id = setInterval(() => {
          if (++n <= max) return (c.textContent = GL[(Math.random() * GL.length) | 0]);
          clearInterval(id);
          c.textContent = real;
          c.style.width = c.style.textAlign = "";
          if (--left === 0) delete name.dataset.busy;
        }, 55);
      });
    };
    if (INTRO === "code" && $(".hero__osd")) {
      const label = [...$(".hero__osd").childNodes].find((n) => n.nodeType === 3 && n.textContent.includes("PLAY"));
      if (label) label.textContent = "BUILD OK ";
    }
    const glitch = () => {
      if (INTRO === "code") return scramble();
      if (reduced() || name.classList.contains("is-glitch")) return;
      name.classList.add("is-glitch");
      name.addEventListener("animationend", () => name.classList.remove("is-glitch"), { once: true });
    };
    // только сам по себе, раз в 20 секунд: на наведение не реагирует, чтобы не отвлекать
    const schedule = () => setTimeout(() => { if (visible && !document.hidden) glitch(); schedule(); }, 20000);
    schedule();
  }

  /* ---------- Главный цикл ---------- */
  const progressBar = $("#scrollProgress");
  function loop() {
    const y = scrollY;
    const dy = y - lastScrollY;
    lastScrollY = y;
    scrollVel = lerp(scrollVel, dy, 0.2);
    if (scrollVel > 0.4) scrollSign = 1;
    else if (scrollVel < -0.4) scrollSign = -1;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    nav.classList.toggle("is-scrolled", y > 30);
    updateCursor();
    updateTickers();
    updateLaptop();
    requestAnimationFrame(loop);
  }

  /* ---------- Язык страницы ----------
     Русский текст лежит в разметке, английский — в атрибутах data-en (текст),
     data-en-html (текст с разметкой), data-en-aria / -title / -alt / -cursor. */
  function applyStatic() {
    if (!EN) return;
    $$("[data-en]").forEach((el) => (el.textContent = el.dataset.en));
    $$("[data-en-html]").forEach((el) => (el.innerHTML = el.dataset.enHtml));
    $$("[data-en-aria]").forEach((el) => el.setAttribute("aria-label", el.dataset.enAria));
    $$("[data-en-title]").forEach((el) => (el.title = el.dataset.enTitle));
    $$("[data-en-alt]").forEach((el) => (el.alt = el.dataset.enAlt));
    $$("[data-en-cursor]").forEach((el) => (el.dataset.cursor = el.dataset.enCursor));
    $("#langBtn")?.setAttribute("lang", "ru");
    const title = "F/FOLIO · Firas Khashab, software developer";
    document.title = title;
    const meta = (sel, v) => document.querySelector(sel)?.setAttribute("content", v);
    meta('meta[name="description"]', "Portfolio of software developer Firas Khashab: websites, platforms and information systems. GameCode, Lib.Rusobr, Help-Lib.");
    meta('meta[property="og:title"]', title);
    meta('meta[property="og:description"]', "Websites, platforms and information systems.");
  }

  // смена языка — перезагрузка без вступления (его уже видели)
  function setLang(v) {
    try {
      localStorage.setItem("lang", v);
      sessionStorage.setItem("fx-skip-intro", "1");
    } catch {}
    const u = new URL(location.href);
    u.searchParams.delete("lang");
    location.replace(u.href);
  }
  $("#langBtn")?.addEventListener("click", () => setLang(EN ? "ru" : "en"));

  /* ---------- Старт ---------- */
  function init() {
    applyStatic();
    root.classList.remove("i18n-wait");
    renderProfile();
    renderHeroMid();
    renderTicker();
    renderContacts();
    renderFooter();
    initIdCard();
    renderWorkFilters();
    renderWorks();
    renderAchTabs();
    renderAch();
    buildKeyboard();
    renderShowcase();
    splitChars($("#heroName"));
    $$("[data-split-words]").forEach(splitWords);

    const giant = $("#footerGiant");
    giant.innerHTML = [...giant.textContent].map((c) => (c === " " ? " " : `<span>${esc(c)}</span>`)).join("");

    $$(".reveal, [data-split-words], #codeWin, #footerGiant").forEach((el) => revealIO.observe(el));
    new IntersectionObserver((en) => (tickerVisible = en[0].isIntersecting)).observe($(".ticker"));

    if (reduced()) {
      // без анимаций ноутбук сразу открыт
      const s = sc.laptop.style;
      s.setProperty("--lid", "11deg");
      s.setProperty("--tilt", "-13deg");
      s.setProperty("--yaw", "0deg");
      s.setProperty("--s", "1");
      screenOn();
    }

    startClock();
    fitGiant();
    measureTickers();
    document.fonts && document.fonts.ready.then(() => {
      measureTickers();
      fitGiant();
      markClamped();
    });
    addEventListener("resize", () => {
      fitGiant();
      measureTickers();
      markClamped();
      movePill(activeLink);
      if (sc.on && sc.active >= 0) startSlideScroll(sc.active);
    });

    initHeroAtmosphere();
    runIntro(() => {
      root.classList.add("is-ready");
      movePill(activeLink);
      // цифры под именем набегают вместе с появлением блока
      $$("#heroFacts .hero-fact__num[data-to]").forEach((el, i) => countUp(el, 450 + i * 130));
    });
    if (PREVIEW) initPreview();
    requestAnimationFrame(loop);
  }

  /* ---------- Предпросмотр из админки ----------
     Плашка внизу; ?open=<id> — сразу открыть окно этой работы/достижения
     (даже скрытой); админка переписывает черновик — страница обновляется сама. */
  function initPreview() {
    const bar = document.createElement("div");
    bar.className = "preview-bar";
    bar.innerHTML = `<i class="pulse"></i><span>${tr("Предпросмотр<em> — несохранённые правки из админки, обновляется сам</em>", "Preview<em> — unsaved changes from the admin panel, updates automatically</em>")}</span><button type="button">${tr("Закрыть", "Close")}</button>`;
    $("button", bar).addEventListener("click", () => (window.close(), bar.remove()));
    document.body.append(bar);

    const id = new URLSearchParams(location.search).get("open");
    const found = id && [
      ...(D.projects || []).map((p) => [withImages(p), "project"]),
      ...(D.achievements || []).map((a) => [withImages(a), "ach"]),
    ].find(([x]) => x.id === id);
    if (found) setTimeout(() => openMedia(found[0], found[1]), 400);

    let reloadTimer;
    addEventListener("storage", (e) => {
      if (e.key !== PREVIEW_KEY) return;
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => location.reload(), 300);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
