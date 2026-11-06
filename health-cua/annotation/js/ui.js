// Small DOM helpers. Everything that reaches the page from data goes through text nodes or esc(); no innerHTML of raw data.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Markdown subset used by the task instructions and the agent's message: headings, bold, italics, ordered and bulleted lists.
export function md(text) {
  const lines = esc(text).replace(/\r/g, '').split('\n');
  const out = [];
  let list = null; let para = [];
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,;:]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flush(); close(); continue; }
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { flush(); close(); const n = Math.min(m[1].length + 1, 4); out.push(`<h${n}>${inline(m[2])}</h${n}>`); continue; }
    if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) { flush(); if (list !== 'ol') { close(); out.push(`<ol start="${Number(m[1])}">`); list = 'ol'; } out.push(`<li value="${Number(m[1])}">${inline(m[2])}</li>`); continue; }  // the value keeps nested bullets from taking a number
    if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) {
      flush();
      const nested = /^\s{2,}/.test(line) && list;
      if (!nested && list !== 'ul') { close(); out.push('<ul>'); list = 'ul'; }
      out.push(`<li${nested ? ' class="sub"' : ''}>${inline(m[1])}</li>`); continue;
    }
    close(); para.push(line.trim());
  }
  flush(); close();
  return out.join('');
}

export function toast(msg, kind = '') {
  const t = h('div', { class: `toast ${kind}` }, msg);
  document.getElementById('toasts').append(t);
  setTimeout(() => t.remove(), kind === 'bad' ? 6000 : 3000);
}

export function confirmBox(title, body, okLabel = 'Confirm', danger = false) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    const done = (v) => { root.innerHTML = ''; resolve(v); };
    const ok = h('button', { class: danger ? 'danger' : 'primary', onclick: () => done(true) }, okLabel);
    root.append(h('div', { class: 'modal-back', onclick: (e) => { if (e.target === e.currentTarget) done(false); } },
      h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, h('h2', {}, title), typeof body === 'string' ? h('p', {}, body) : body,
        h('div', { class: 'row' }, h('button', { onclick: () => done(false) }, 'Cancel'), ok))));
    ok.focus();
  });
}

export function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// Typed answers of one form: edits of every field are merged and saved together after a pause, on leaving a box, on leaving the page and
// before submit, so moving quickly from one box to the next never drops the first box's text.
export function textSaver(save, ms = 400) {
  let pending = {}; let t = null;
  const flush = () => { clearTimeout(t); t = null; const p = pending; pending = {}; return Object.keys(p).length ? save(p) : Promise.resolve(); };
  const away = () => { if (document.visibilityState === 'hidden') flush(); };
  document.addEventListener('visibilitychange', away); window.addEventListener('pagehide', flush);
  window.addEventListener('hashchange', () => { flush(); document.removeEventListener('visibilitychange', away); window.removeEventListener('pagehide', flush); }, { once: true });
  return { queue(patch) { Object.assign(pending, patch); clearTimeout(t); t = setTimeout(flush, ms); }, flush };
}

// A database call that has not answered after ms rejects with code 'timeout' instead of leaving the page on "Loading…" (for example when a
// hospital network blocks the database connection).
export const NO_CONNECTION = 'The study database does not answer. Check your network connection (some hospital networks block it, but a home network or a phone hotspot usually works), then reload the page.';
export function withTimeout(p, ms = 10000) {
  let t;
  const late = new Promise((_, reject) => { t = setTimeout(() => reject(Object.assign(new Error(NO_CONNECTION), { code: 'timeout' })), ms); });
  return Promise.race([p, late]).finally(() => clearTimeout(t));
}

// Dates in text we write (order lines, answer keys) as clinicians write them: 2024-07-29 becomes Jul 29, 2024. Agents' notes are left as written.
export function humanDates(text) {
  return String(text ?? '').replace(/\b(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?\b/g, (m, y, mo, d) => fmtDate(`${y}-${mo}-${d}`));
}

// Active time: counted while the tab is visible and the reader has used the mouse or keyboard in the last minute.
export function activeTimer(initial, persist) {
  let lastInput = Date.now(); let active = initial || 0; let unsaved = 0;
  const bump = () => { lastInput = Date.now(); };
  const events = ['mousemove', 'keydown', 'wheel', 'pointerdown', 'scroll'];
  events.forEach((e) => window.addEventListener(e, bump, { passive: true, capture: true }));
  const timer = setInterval(() => {
    if (document.visibilityState === 'visible' && Date.now() - lastInput < 60000) { active += 5000; unsaved += 5000; }
    if (unsaved >= 15000) { unsaved = 0; persist(active).catch(() => {}); }
  }, 5000);
  const cleanup = () => { clearInterval(timer); events.forEach((e) => window.removeEventListener(e, bump, { capture: true })); };
  window.addEventListener('hashchange', cleanup, { once: true });
  return { cleanup, value: () => active };
}

// Light or dark page: follows the system unless the reader picks one; kept in this browser only.
const THEME_KEY = 'hcua-validity-theme';
function applyTheme(t) { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; }
try { applyTheme(localStorage.getItem(THEME_KEY)); } catch { /* storage blocked: follow the system */ }
export function themeButton() {
  const dark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const b = h('button', { class: 'iconbtn', html: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 2.5a7.5 7.5 0 0 1 0 15z" fill="currentColor"/></svg>' });
  const label = () => { const l = dark() ? 'Switch to a light page' : 'Switch to a dark page'; b.setAttribute('aria-label', l); b.title = l; };
  b.onclick = () => { const t = dark() ? 'light' : 'dark'; applyTheme(t); try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ } label(); };
  label(); return b;
}

export const BRAND = 'Health-CUA';  // the name beside the logo; page titles keep 'Health-CUA Annotation'
export const brand = (href = '#/') => h('a', { class: 'brand', href }, h('img', { class: 'mark', src: 'img/logo-64.png', alt: '' }), BRAND);

// The account button of the top bar: the Google photo or initials; the menu holds the name, the study and progress, links and Sign out.
// lines: [[label, text]] shown under the name; links: [[text, href]].
export function profileMenu(user, { lines = [], links = [], onSignOut, onSwitch } = {}) {
  if (!user) return null;
  const initials = (user.name || user.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  const face = user.photo ? h('img', { src: user.photo, alt: '', referrerpolicy: 'no-referrer' }) : h('span', {}, initials);
  const btn = h('button', { class: 'avatar', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': 'Account', title: user.email }, face);
  const menu = h('div', { class: 'menu', role: 'menu', hidden: true },
    h('div', { class: 'who' }, h('strong', {}, user.name || user.email), user.name ? h('div', { class: 'small muted' }, user.email) : null),
    lines.length ? h('dl', { class: 'menu-lines' }, lines.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])) : null,
    links.map(([t, href]) => h('a', { role: 'menuitem', href }, t)),
    onSwitch ? h('button', { role: 'menuitem', class: 'menu-switch', onclick: onSwitch }, 'Sign in with another account') : null,
    onSignOut ? h('button', { role: 'menuitem', class: 'menu-out', onclick: onSignOut }, 'Sign out') : null);
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); };
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const wrap = h('div', { class: 'account' }, btn, menu);
  return wrap;
}

// The page shown when the database cannot be reached.
export function connectionView(app, e) {
  app.replaceChildren(h('main', { class: 'page' }, h('div', { class: 'card stack', style: { maxWidth: '620px' } }, h('h1', {}, 'Cannot connect'),
    h('p', {}, e?.code === 'timeout' ? NO_CONNECTION : `Something went wrong: ${e?.message || e}`), h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => location.reload() }, 'Reload')))));
}

export function emailKey(email) { return String(email || '').trim().toLowerCase().replaceAll('.', ','); }
export const EMAIL_RE = /^[^\s@#$\[\]\/]+@[^\s@#$\[\]\/]+\.[^\s@#$\[\]\/]+$/;

export function fmtDate(s) {
  if (!s) return '';
  const d = new Date(String(s).length <= 10 ? `${s}T12:00:00Z` : String(s).replace(' ', 'T') + (String(s).length === 16 ? ':00Z' : ''));
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function fmtTime(ms) {
  if (!ms) return '';
  return new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function radios(name, options, value, onChange) {
  return h('div', { class: 'choice', role: 'radiogroup' }, options.map(([v, label]) =>
    h('label', {}, h('input', { type: 'radio', name, value: v, checked: String(value) === String(v), onchange: () => onChange(v) }), label)));
}

export const GOOGLE_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.3 5.7c4.3-4 7-9.9 7-17z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';

// Open recruitment: the block a rater takes next. An item counts in the analysis only once two physicians have rated it, so a block that one
// other physician has taken comes first, then an untaken block, then the block with the fewest raters (ties: first id); never one this
// rater has taken. Returns null when the rater has taken every block.
export function nextBlock(blocks, claims, uid) {
  const free = Object.keys(blocks || {}).filter((b) => !claims?.[b]?.[uid]).sort();
  if (!free.length) return null;
  const rank = (b) => { const n = Object.keys(claims?.[b] || {}).length; return n === 1 ? 0 : n === 0 ? 1 : n; };
  return free.reduce((best, b) => (rank(b) < rank(best) ? b : best));
}
// a block as the item list of a slot ({id: {pos}}), so the queue and item pages work unchanged
export const blockSlot = (block, kind) => ({ role: 'rater', [kind]: Object.fromEntries(Object.entries(block?.[kind] || {}).map(([id, pos]) => [id, { pos }])) });

// The class of an order line, from its name (the packet records none): referrals and consults, visit orders, procedures (surgery, endoscopy,
// biopsy, ECG, audiometry, fetal monitoring...), imaging, and laboratory for the rest. Every line of packet B-4.6 was checked by hand
// (tests/ui.test.mjs holds the lines that were misfiled before).
const ORDER_KINDS = [['Referrals', /\breferr|\bconsult|e-?consult/i],
  ['Visit orders', /\b(follow-?up|office|clinic|return) visit\b/i],
  ['Procedures', /\b(biops\w*|endoscop\w*|colonoscop\w*|sigmoidoscop\w*|egd|bronchoscop\w*|cystoscop\w*|cystourethroscop\w*|ureteroscop\w*|laryngoscop\w*|ecg|ekg|electrocardiogra\w*|holter|injection|infusion|aspiration|excision|drainage|vaccin\w*|administration|spirometry|pulmonary function|stress test|eeg|emg|nerve conduction|audiometr\w*|tympanometr\w*|therapeutic phlebotomy|physical therapy|occupational therapy|counsel\w*|polysomnogra\w*|sleep study|monitor|resection|surgery|surgical|\w+ectomy|\w+plasty|repair|fixation|ablation|transplant\w*|implant\w*|catheteri[sz]ation|turp|slit-lamp|skin snips?)\b/i],
  ['Imaging', /\b(x-?ray|xr|radiograph\w*|ct|cta|mri?|mra|ultrasound|us|sonograph\w*|echocardiogra\w*|echo|doppler|mammogra\w*|dexa|dxa|pet|angiogra\w*|fluoroscop\w*|imaging|scintigraph\w*|venogra\w*|urethrogra\w*|cystogra\w*|elastograph\w*|fibroscan|skeletal survey|bone scan)\b/i]];
export const orderKind = (t) => (/^Medication:/.test(t) ? 'Medications'
  : ORDER_KINDS.find(([, re]) => re.test(String(t).replace(/^(Medication|Test or referral|Visit):\s*/, '')))?.[0] || 'Laboratory');
