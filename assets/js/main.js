/* =========================================================
   F/FOLIO — логика и анимации.
   Весь контент берётся из data/portfolio.js (window.PORTFOLIO).
   ========================================================= */
(() => {
  "use strict";

  const D = window.PORTFOLIO || {};
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
    toast("Скопировано: " + text);
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
      .map((c) => `<a class="social" href="${esc(c.url)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""} aria-label="${esc(c.label)}: ${esc(c.value)}" title="${esc(c.value)}">${iconFor(c.type)}</a>`)
      .join("");
    $("#heroSocials").innerHTML = socials;
    $("#mobileContacts").innerHTML = contacts
      .map((c) => `<a class="chip" href="${esc(c.url)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""}>${iconFor(c.type)} ${esc(c.value)}</a>`)
      .join("");

    $$("[data-count]").forEach((el) => {
      el.dataset.target = el.dataset.count === "projects" ? projects.length : achievements.length;
    });
  }

  function renderTicker() {
    const skills = P.skills && P.skills.length ? P.skills : ["Веб-разработка"];
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
        <a class="contact-row__link" href="${esc(c.url)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""} aria-label="${esc(c.label)}: ${esc(c.value)}" data-cursor="Написать"></a>
        <span class="contact-row__actions">
          <button class="contact-row__btn" type="button" data-copy="${esc(c.value)}" aria-label="Скопировать ${esc(c.value)}" title="Скопировать">${ICONS.copy}</button>
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

  function topTags() {
    const count = {};
    projects.forEach((p) => (p.tags || []).forEach((t) => (count[t] = (count[t] || 0) + 1)));
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  function renderWorkFilters() {
    const items = [["all", projects.length, "Все"], ...topTags().map(([t, n]) => [t, n, t])];
    worksFilters.innerHTML = items
      .map(([key, n, label]) => `<button class="filter${key === worksFilter ? " is-active" : ""}" type="button" data-filter="${esc(key)}" aria-pressed="${key === worksFilter}">${esc(label)}<sup>${n}</sup></button>`)
      .join("");
  }

  function workCard(p, i) {
    const num = String(projects.indexOf(p) + 1).padStart(2, "0");
    return `
      <article class="work-card is-entering" style="--i:${i}" data-tilt>
        <button class="work-card__link" type="button" data-project="${esc(p.id)}" data-cursor="Смотреть" aria-label="Подробнее о проекте ${esc(p.title)}">
          <div class="work-card__media">
            <div class="mini-bar"><span class="browser__dots"><i></i><i></i><i></i></span><span>${esc(p.domain || p.url || p.category)}</span></div>
            <div class="work-card__shot" style="background-image:url('${esc(cover(p))}')" role="img" aria-label="Обложка проекта ${esc(p.title)}"></div>
            ${p.images.length > 1 ? `<span class="photo-count">${ICONS.image}${p.images.length}</span>` : ""}
          </div>
          <div class="work-card__body">
            <div class="work-card__top"><span class="work-card__num">${num}</span><span class="work-card__cat">${esc(p.category)}</span></div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.short)}</p>
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
          <div class="soon__code" aria-hidden="true"><span class="tok-k">const</span> project = <span class="tok-k">new</span> Idea();<br>project.design();<br>project.build();<br>project.test();<br>// скоро в продакшене<span class="caret"></span></div>
          <div>
            <span class="soon__badge"><i class="pulse"></i>В разработке</span>
            <h3 style="margin-top:14px">Новый проект</h3>
            <p>Скоро здесь появится ещё одна работа.</p>
          </div>
        </div>
      </article>`;
  }

  function renderWorks() {
    const list = worksFilter === "all" ? projects : projects.filter((p) => (p.tags || []).includes(worksFilter));
    let html = list.map(workCard).join("");
    if (worksFilter === "all") for (let k = 0; k < (D.upcomingSlots ?? 2); k++) html += soonCard(list.length + k);
    worksGrid.innerHTML = html;
    bindTilt(worksGrid);
  }

  worksFilters.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b || b.dataset.filter === worksFilter) return;
    worksFilter = b.dataset.filter;
    renderWorkFilters();
    renderWorks();
  });

  /* ---------- Достижения ---------- */
  const ACH_TYPES = {
    diploma: ["Дипломы", "Диплом"],
    certificate: ["Сертификаты", "Сертификат"],
    conference: ["Конференции", "Конференция"],
    showcase: ["Шоукейсы", "Шоукейс"],
  };
  let achFilter = "all";

  function renderAchTabs() {
    const tabs = [["all", "Все", achievements.length], ...Object.entries(ACH_TYPES).map(([k, v]) => [k, v[0], achievements.filter((a) => a.type === k).length])];
    $("#achTabs").innerHTML = tabs
      .map(([k, label, n]) => `<button class="ach-tab${k === achFilter ? " is-active" : ""}" type="button" data-type="${k}" aria-pressed="${k === achFilter}"><b>${n}</b><span>${label}</span>${n ? "" : "<small>скоро</small>"}</button>`)
      .join("");
  }

  function renderAch() {
    const list = achFilter === "all" ? achievements : achievements.filter((a) => a.type === achFilter);
    let html = list
      .map((a, i) => {
        const meta = [a.org, a.date].filter(Boolean).join(" · ");
        return `
        <article class="ach is-entering" style="--i:${i}">
          <button class="ach__media" type="button" data-ach="${esc(a.id)}" aria-label="Открыть фото: ${esc(a.title)}" data-cursor="Смотреть">
            <span class="ach__type">${esc((ACH_TYPES[a.type] || ["", "Событие"])[1])}</span>
            ${a.images.length > 1 ? `<span class="photo-count">${ICONS.image}${a.images.length}</span>` : ""}
            <img src="${esc(cover(a))}" alt="${esc(a.title)}" loading="lazy">
            <span class="ach__zoom" aria-hidden="true">${ICONS.zoom}</span>
          </button>
          <div class="ach__body"><h3>${esc(a.title)}</h3>${meta ? `<p>${esc(meta)}</p>` : ""}</div>
        </article>`;
      })
      .join("");
    const what = achFilter === "all" ? "новые достижения" : ACH_TYPES[achFilter][0].toLowerCase();
    html += `
      <article class="ach ach--soon is-entering" style="--i:${list.length}">
        <span class="ach__plus">${ICONS.plus}</span>
        <h3>Скоро здесь</h3>
        <p>Добавлю ${esc(what)} — следите за обновлениями</p>
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
      ? mm.images.map((src, k) => `<div class="mm__slide" style="--src:url('${esc(src)}')"><img src="${esc(src)}" alt="${esc(item.title)} — фото ${k + 1}" decoding="async"></div>`).join("")
      : `<div class="mm__slide is-active mm__empty">Фото скоро появятся</div>`;
    mm.thumbs.innerHTML = mm.images.length > 1
      ? mm.images.map((src, k) => `<button class="mm__thumb" type="button" data-k="${k}" aria-label="Фото ${k + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")
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
        ${item.url ? `<a class="btn btn--accent btn--sm" href="${esc(item.url)}" target="_blank" rel="noopener" data-magnetic>Открыть сайт <span class="btn__icon">${ICONS.arrowUR}</span></a>` : ""}`;
    } else {
      const meta = [item.org, item.date].filter(Boolean).join(" · ");
      mm.info.innerHTML = `
        <p class="sc-detail__cat">${esc((ACH_TYPES[item.type] || ["", "Событие"])[1])}</p>
        <h3 id="mmTitle">${esc(item.title)}</h3>
        ${meta ? `<p class="mm__desc">${esc(meta)}</p>` : ""}`;
    }
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
      [["c", "// обо мне в двух словах"]],
      [["k", "const "], ["v", "firas"], ["x", " = {"]],
      [["p", "  name"], ["x", ": "], ["s", q(`${P.firstName} ${P.lastName}`)], ["x", ","]],
      [["p", "  role"], ["x", ": "], ["s", q((P.role || "").toLowerCase())], ["x", ","]],
      [["p", "  study"], ["x", ": "], ["s", q(`${s.place} · ${s.short || s.program}`)], ["x", ","]],
      [["p", "  work"], ["x", ": "], ["s", q(`${w.company} · ${w.city}`)], ["x", ","]],
      [["p", "  projects"], ["x", ": "], ["n", String(projects.length)], ["x", ", "], ["c", "// и это только начало"]],
      [["p", "  coffee"], ["x", ": "], ["n", "Infinity"], ["x", ","]],
      [["p", "  status"], ["x", ": "], ["s", q((P.status || "").toLowerCase())]],
      [["x", "};"]],
      [],
      [["v", "firas"], ["x", "."], ["p", "build"], ["x", "("], ["s", '"что-то крутое"'], ["x", ");"]],
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

  /* ---------- Услуги (аккордеон) ---------- */
  $("#svcList").addEventListener("click", (e) => {
    const head = e.target.closest(".svc__head");
    if (!head) return;
    const item = head.parentElement;
    const open = !item.classList.contains("is-open");
    $$(".svc", $("#svcList")).forEach((s) => {
      s.classList.remove("is-open");
      $(".svc__head", s).setAttribute("aria-expanded", "false");
    });
    if (open) {
      item.classList.add("is-open");
      head.setAttribute("aria-expanded", "true");
    }
  });

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
      .map((p) => `<div class="slide"><img src="${esc(cover(p))}" alt="Сайт ${esc(p.title)}" decoding="async"></div>`)
      .join("");
    sc.slides = $$(".slide", sc.view);
    sc.tabs.innerHTML = featured
      .map(
        (p, i) => `<li><button class="sc-tab" type="button" data-i="${i}"><span class="sc-tab__num">${String(i + 1).padStart(2, "0")}</span><span class="sc-tab__title">${esc(p.title)}</span><span class="sc-tab__domain">${esc(p.domain)}</span><span class="sc-tab__bar"></span></button></li>`
      )
      .join("");
    sc.tabBtns = $$(".sc-tab", sc.tabs);
    renderDetail(0);
    sc.slides.forEach((s) => $("img", s).addEventListener("load", () => sc.active >= 0 && startSlideScroll(sc.active)));
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
    typeUrl(featured[i].domain || featured[i].url);
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
        ${p.url ? `<a class="btn btn--accent btn--sm" href="${esc(p.url)}" target="_blank" rel="noopener" data-magnetic>Открыть сайт <span class="btn__icon">${ICONS.arrowUR}</span></a>` : ""}
        <button class="btn btn--ghost btn--sm" type="button" data-project="${esc(p.id)}" data-magnetic>Подробнее${p.images.length > 1 ? ` · ${p.images.length} фото` : ""}</button>
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
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
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
  function countUp(el) {
    const target = +el.dataset.target || 0;
    if (reduced()) return (el.textContent = target);
    const t0 = performance.now();
    const f = (now) => {
      const p = clamp((now - t0) / 1400);
      el.textContent = Math.round(easeOut(p) * target);
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
        if (el.dataset.target !== undefined) countUp(el);
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
  const SECTIONS = { top: "главная", showcase: "топ-3 работы", about: "обо мне", works: "все проекты", achievements: "достижения", contact: "контакты" };
  const COMMANDS = {
    help: () =>
      print(
        [
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
          "<span class='t-acc'>clear</span>         очистить экран",
          "<span class='t-acc'>exit</span>          закрыть терминал",
          "<span class='t-cmd'>…и ещё одна секретная команда с sudo</span>",
        ].join("\n")
      ),
    about: () => {
      const s = P.study || {};
      const w = P.work || {};
      print(`${esc(P.firstName)} ${esc(P.lastName)} — ${esc((P.role || "").toLowerCase())}.\nУчусь: ${esc(s.place)}, ${esc(s.level)} «${esc(s.program)}».\nРаботаю: ${esc(w.company)} (${esc(w.city)}) — <a href="${esc(w.url)}" target="_blank" rel="noopener">${esc((w.url || "").replace(/^https?:\/\/|\/$/g, ""))}</a>`);
    },
    projects: () => print(projects.map((p, i) => `<span class='t-acc'>[${i + 1}]</span> ${esc(p.title).padEnd(12)} <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.domain)}</a>`).join("\n") + "\n<span class='t-cmd'>open &lt;n&gt; — открыть</span>"),
    open: (n) => {
      const p = projects[+n - 1];
      if (!p) return print("Нет проекта с таким номером. Смотри: projects");
      print(`<span class='t-ok'>✓</span> открываю ${esc(p.domain)}…`);
      window.open(p.url, "_blank", "noopener");
    },
    achievements: () => print(achievements.map((a) => `<span class='t-acc'>★</span> ${esc(a.title)}`).join("\n") || "Скоро здесь будет много всего."),
    contact: () => print(contacts.map((c) => `${esc(c.label).padEnd(10)} <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.value)}</a>`).join("\n")),
    ls: () => print(Object.entries(SECTIONS).map(([k, v]) => `<span class='t-acc'>${k}/</span>  <span class='t-cmd'>${v}</span>`).join("\n")),
    cd: (s) => {
      if (!SECTIONS[s]) return print("cd: нет такого раздела. Смотри: ls");
      closeTerm();
      $("#" + s).scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
    },
    theme: () => {
      const r = $("#themeBtn").getBoundingClientRect();
      setTheme(root.dataset.theme === "dark" ? "light" : "dark", r.left + r.width / 2, r.top + r.height / 2);
      print(`<span class='t-ok'>✓</span> тема: ${root.dataset.theme === "dark" ? "светлая" : "тёмная"}`);
    },
    date: () => print(new Date().toLocaleString("ru-RU")),
    whoami: () => print("гость, которому очень нравится этот сайт 🙂"),
    intro: (v) => {
      if (v !== "vhs" && v !== "code") return print(`сейчас: <span class='t-acc'>${INTRO}</span>. Варианты: intro vhs · intro code`);
      try { localStorage.setItem("intro", v); sessionStorage.removeItem("fx-seen"); } catch {}
      print(`<span class='t-ok'>✓</span> вступление «${v}», перезагружаю…`);
      setTimeout(() => location.reload(), 700);
    },
    vhs: (mode) => {
      const off = mode ? mode === "off" : !film.classList.contains("is-off");
      film.classList.toggle("is-off", off);
      try { localStorage.setItem("vhs", off ? "off" : "on"); } catch {}
      print(`<span class='t-ok'>✓</span> плёнка ${off ? "выключена" : "включена"}`);
    },
    clear: () => (termOut.innerHTML = ""),
    exit: () => closeTerm(),
    sudo: (...args) => {
      if (args.join(" ") === "hire firas") {
        print("[sudo] пароль для guest: ********");
        setTimeout(() => {
          const tg = contacts.find((c) => c.type === "telegram");
          print(`<span class='t-ok'>Доступ разрешён ✓</span> Отличный выбор!\nПишите: <a href="${esc(tg ? tg.url : "#contact")}" target="_blank" rel="noopener">${esc(tg ? tg.value : "контакты")}</a>`);
          confetti();
        }, 600);
      } else print("sudo: попробуй «sudo hire firas»");
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
    else print(`command not found: ${esc(cmd)}. Попробуй <span class='t-acc'>help</span>`);
  }

  let termOpened = false;
  function openTerm() {
    term.hidden = false;
    root.style.overflow = "hidden";
    if (!termOpened) {
      termOpened = true;
      print("Добро пожаловать в терминал F/FOLIO 👋\nНапиши <span class='t-acc'>help</span>, чтобы увидеть команды.");
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
    if (about) about.textContent = `${[P.role, P.city].filter(Boolean).join(" · ")}. Делаю сайты, веб-платформы и информационные системы — от идеи до продакшена.`;
    const st = $("#footerStatus");
    if (st && P.status) st.textContent = P.status;
    const tg = contacts.find((c) => c.type === "telegram") || contacts[0];
    const cta = $("#footerCta");
    if (cta && tg) {
      cta.href = tg.url;
      if (isExternal(tg.url)) Object.assign(cta, { target: "_blank", rel: "noopener" });
      $(".footer__cta-label", cta).textContent = "Написать в " + tg.label;
    }
    $("#footerProjects").innerHTML =
      projects
        .slice(0, 6)
        .map((p) =>
          p.url
            ? `<li><a href="${esc(p.url)}" target="_blank" rel="noopener"><span>${esc(p.title)}<small>${esc(p.domain || p.category)}</small></span>${ICONS.arrowUR}</a></li>`
            : `<li><button type="button" data-project="${esc(p.id)}"><span>${esc(p.title)}<small>${esc(p.category)}</small></span></button></li>`
        )
        .join("") + `<li><a href="#works" class="footer__more">Все работы →</a></li>`;
    $("#footerContacts").innerHTML = contacts
      .map((c) => `<li><a href="${esc(c.url)}" ${isExternal(c.url) ? 'target="_blank" rel="noopener"' : ""}><i class="footer__ic">${iconFor(c.type)}</i><span>${esc(c.label)}<small>${esc(c.value)}</small></span></a></li>`)
      .join("");
  }

  /* ---------- Часы в подвале ---------- */
  function startClock() {
    const fmt = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: P.timezone || "Europe/Moscow" });
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
    const plural = (n, one, few, many) => {
      const a = n % 10;
      const b = n % 100;
      return `${n} ${a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many}`;
    };
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
              line(`<span class="t-dim">добавлено:</span> ${plural(projects.length, "проект", "проекта", "проектов")} · ${plural(achievements.length, "достижение", "достижения", "достижений")} · ${plural(contacts.length, "контакт", "контакта", "контактов")}`);
              at(110, () => {
                line(`<span class="t-ok">✓</span> зависимости на месте`);
                at(160, next);
              });
            }),
          (next) =>
            typeCmd("npm run build", () => {
              const d = line(`<span class="t-dim">▸</span> собираю страницу <span class="c-bar"><i></i></span> <span class="c-pct">0%</span>`);
              progress(d, 420, () => {
                line(`<span class="t-ok">✓</span> собрано за 0.42 с`);
                at(170, next);
              });
            }),
          (next) =>
            typeCmd("npm start", () => {
              line(`<span class="t-dim">▸</span> поднимаю сервер…`);
              at(170, () => {
                line(`<span class="t-dim">▸</span> подключаю проекты: ${esc(projNames)}`);
                at(200, () => {
                  line(`<span class="t-dim">▸</span> включаю свет…`);
                  at(260, () =>
                    lightUp(() => {
                      line(`<span class="t-ok">✓ сайт запущен</span> <span class="t-dim">за ${((performance.now() - t0) / 1000).toFixed(1)} с</span>`);
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
              line(`<span class="t-dim">▸</span> включаю свет…`);
              at(200, () =>
                lightUp(() => {
                  line(`<span class="t-ok">✓ сайт запущен</span>`);
                  at(280, next);
                })
              );
            }),
        ];
    const run = (i) => (i < steps.length ? steps[i](() => run(i + 1)) : complete());

    // надпись загорается: вспышка → гаснет → горит
    const on = () => {
      name.classList.remove("is-flash");
      glow.classList.remove("is-flash");
      root.classList.add("is-lit");
      name.classList.add("is-glow");
      glow.classList.add("is-on");
    };
    function lightUp(then) {
      if (lit) return then && then();
      lit = true;
      name.classList.add("is-flash");
      glow.classList.add("is-flash");
      at(80, () => {
        name.classList.remove("is-flash");
        glow.classList.remove("is-flash");
      });
      at(240, on);
      at(480, () => then && then());
    }

    // терминал сворачивается в «Задача выполнена»
    function complete() {
      if (revealed) return;
      term.classList.add("is-out");
      pill.classList.add("is-on");
      $("#cDoneTime").textContent = `сайт запущен за ${((performance.now() - t0) / 1000).toFixed(1)} с`;
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
    $("#idName").textContent = [P.firstName, P.lastName].filter(Boolean).join(" ") || "Фирас Хашаб";
    $("#idRole").textContent = [P.role, w.company].filter(Boolean).join(" · ");
    $("#nowWorkLabel").textContent = w.city ? `Работаю · ${w.city}` : "Работаю";
    $("#nowWork").innerHTML = w.url ? `<a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.company)}</a>` : esc(w.company || "—");
    $("#nowStudy").textContent = [s.place, s.short || s.program].filter(Boolean).join(" · ") || "—";
    $("#nowStatus").textContent = P.status || "Открыт к новым проектам";
    if (P.qr) $("#idQr").src = P.qr;
    const tg = contacts.find((c) => c.type === "telegram") || contacts[0];
    const qrLink = $("#idQrLink");
    if (tg) {
      qrLink.href = tg.url;
      $("#idQr").alt = `QR-код: ${tg.label} ${tg.value}`;
      if (isExternal(tg.url)) Object.assign(qrLink, { target: "_blank", rel: "noopener" });
    }
    const fmt = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: P.timezone || "Europe/Moscow" });
    const clock = () => ($("#nowTime").textContent = `${P.city || "Местное время"}, ${fmt.format(new Date())}`);
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
    $(".hero__hello").textContent = "// привет, я программист";
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
    const words = P.typing && P.typing.length ? P.typing : ["сайты", "веб-платформы", "информационные системы", "интерфейсы", "чат-ботов"];
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
    $(".hero__title").addEventListener("pointerenter", glitch);
    const schedule = () => setTimeout(() => { if (visible && !document.hidden) glitch(); schedule(); }, 7000 + Math.random() * 6000);
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

  /* ---------- Старт ---------- */
  function init() {
    renderProfile();
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

    $$(".reveal, [data-split-words], [data-target], #codeWin, #footerGiant").forEach((el) => revealIO.observe(el));
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
    });
    addEventListener("resize", () => {
      fitGiant();
      measureTickers();
      movePill(activeLink);
      if (sc.on && sc.active >= 0) startSlideScroll(sc.active);
    });

    initHeroAtmosphere();
    runIntro(() => {
      root.classList.add("is-ready");
      movePill(activeLink);
    });
    requestAnimationFrame(loop);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
