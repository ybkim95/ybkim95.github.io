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
    if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) { flush(); if (list !== 'ol') { close(); out.push(`<ol start="${Number(m[1])}">`); list = 'ol'; } out.push(`<li>${inline(m[2])}</li>`); continue; }
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
