// A short guided tour of the review screen: the page is dimmed except the parts a step describes, and a small popover sits beside them
// (never over them) with Back, Next and Skip tour. The tour only scrolls and highlights. It never clicks anything, so no answer and no
// view record changes. Esc closes it, the arrow keys step through it and Tab stays inside the popover.
import { h } from './ui.js?v=bda075cdd4';

const INSET = 3; // a highlight sits just inside its part, so two parts that touch never share or overlap an outline
const PAD = 0;
const GAP = 14;  // between the highlighted part and the popover
const EDGE = 8;  // kept free at the window edges
const SVG = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
const shown = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
// the part of an element its scrolling panels actually show (a message scrolled under the tab bar, a column cut by the window)
const visible = (e) => {
  const r = e.getBoundingClientRect(); let b = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
    if (!/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY + getComputedStyle(p).overflowX)) continue;
    const q = p.getBoundingClientRect(); b = { left: Math.max(b.left, q.left), top: Math.max(b.top, q.top), right: Math.min(b.right, q.right), bottom: Math.min(b.bottom, q.bottom) };
  }
  return b.right - b.left > 8 && b.bottom - b.top > 8 ? b : null;
};
const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

// steps: [{ title, text, targets: () => [elements], anchor: () => element, block: 'start'|'center'|'nearest', place: ['left', 'below', ...], union, pad, floor }]
export function startTour(steps, { onClose } = {}) {
  let i = 0; let frame = 0;
  const dim = svgEl('svg', { class: 'tour-dim', 'aria-hidden': 'true' });
  const counter = h('span', { class: 'tour-count' });
  const title = h('h2', { id: 'tour-title' });
  const text = h('p', { id: 'tour-text', 'aria-live': 'polite' });
  const back = h('button', { type: 'button', class: 'small', onclick: () => go(i - 1) }, 'Back');
  const next = h('button', { type: 'button', class: 'small primary', onclick: () => (i === steps.length - 1 ? close('done') : go(i + 1)) });
  const skip = h('button', { type: 'button', class: 'linkish small', onclick: () => close('skip') }, 'Skip tour');
  const pop = h('div', { class: 'tour-pop', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tour-title', 'aria-describedby': 'tour-text' },
    h('div', { class: 'tour-head' }, counter, skip), title, text, h('div', { class: 'tour-actions' }, back, next));
  const root = h('div', { class: 'tour' }, dim, pop);
  const before = document.activeElement;

  const place = () => {
    const s = steps[i]; const W = innerWidth; const H = innerHeight;
    let rects = s.targets().filter(shown).map(visible).filter(Boolean);
    // a stack of parts in one column (the questions) is one highlight: their bounding box
    if (s.union && rects.length) rects = [{ left: Math.min(...rects.map((r) => r.left)), top: Math.min(...rects.map((r) => r.top)), right: Math.max(...rects.map((r) => r.right)), bottom: Math.max(...rects.map((r) => r.bottom)) }];
    // inset, then clipped to the window with a margin so every rounded corner stays in view
    const floor = s.floor?.() ?? H;  // a bar pinned over the bottom of the panel (the submit bar) ends the highlight
    rects = rects.map((r) => ({ ...r, bottom: Math.min(r.bottom, floor) })).filter((r) => r.bottom - r.top > 8);
    const d = s.pad ?? -INSET;  // a step whose parts have no border of their own (the questions) is padded outward instead
    const holes = rects.map((r) => ({ left: Math.max(r.left - d, EDGE / 2), top: Math.max(r.top - d, EDGE / 2), right: Math.min(r.right + d, W - EDGE / 2), bottom: Math.min(r.bottom + d, H - EDGE / 2) }))
      .filter((r) => r.right - r.left > 8 && r.bottom - r.top > 8);
    dim.setAttribute('viewBox', `0 0 ${W} ${H}`); dim.setAttribute('width', W); dim.setAttribute('height', H);
    const mask = svgEl('mask', { id: 'tour-mask' }); mask.append(svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: 'white' }));
    const rings = holes.map((r) => { const a = { x: r.left, y: r.top, width: r.right - r.left, height: r.bottom - r.top, rx: 6 }; mask.append(svgEl('rect', { ...a, fill: 'black' })); return svgEl('rect', { ...a, class: 'tour-ring' }); });
    dim.replaceChildren(mask, svgEl('rect', { x: 0, y: 0, width: W, height: H, class: 'tour-shade', mask: 'url(#tour-mask)' }), ...rings);
    // the first side (in the step's order) where the popover fits without covering a highlighted part; otherwise the least covering one
    const a = s.anchor()?.getBoundingClientRect() || holes[0] || { left: W / 2, right: W / 2, top: H / 2, bottom: H / 2 };
    const w = pop.offsetWidth; const ht = pop.offsetHeight;
    const clampX = (x) => Math.min(Math.max(x, EDGE), W - w - EDGE); const clampY = (y) => Math.min(Math.max(y, EDGE), H - ht - EDGE);
    const at = { left: () => [a.left - PAD - GAP - w, a.top], right: () => [a.right + PAD + GAP, a.top], below: () => [a.left, a.bottom + PAD + GAP], above: () => [a.left, a.top - PAD - GAP - ht] };
    const tries = [...(s.place || []), 'below', 'right', 'left', 'above'].map((k) => { const [x0, y0] = at[k](); const x = clampX(x0); const y = clampY(y0);
      const box = { left: x, top: y, right: x + w, bottom: y + ht }; return { x, y, cover: holes.reduce((n, r) => n + overlap(box, r), 0) }; });
    const best = tries.find((t) => t.cover === 0) || tries.reduce((m, t) => (t.cover < m.cover ? t : m));
    pop.style.left = `${Math.round(best.x)}px`; pop.style.top = `${Math.round(best.y)}px`;
  };
  const later = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); };
  const go = (k) => {
    if (k < 0 || k >= steps.length) return;
    i = k; const s = steps[i];
    counter.textContent = `${i + 1} of ${steps.length}`; title.textContent = s.title; text.textContent = s.text;
    back.disabled = i === 0; next.textContent = i === steps.length - 1 ? 'Done' : 'Next';
    s.anchor()?.scrollIntoView({ block: s.block || 'nearest', inline: 'nearest' });
    place(); later(); next.focus();
  };
  const keys = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close('esc'); return; }
    if (e.key === 'ArrowRight' && !e.target.matches?.('input, textarea')) { e.preventDefault(); if (i < steps.length - 1) go(i + 1); return; }
    if (e.key === 'ArrowLeft' && !e.target.matches?.('input, textarea')) { e.preventDefault(); go(i - 1); return; }
    if (e.key === 'Tab') {  // keep focus inside the popover
      const f = [...pop.querySelectorAll('button:not([disabled])')]; const at = f.indexOf(document.activeElement);
      e.preventDefault(); f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  };
  function close(how) {
    cancelAnimationFrame(frame); root.remove();
    document.removeEventListener('keydown', keys, true); removeEventListener('resize', later); removeEventListener('scroll', later, true);
    before?.focus?.(); onClose?.(how);
  }
  document.body.append(root);
  document.addEventListener('keydown', keys, true); addEventListener('resize', later); addEventListener('scroll', later, true);
  go(0);
  return { close };
}
