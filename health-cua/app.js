// Coverflow, menu, video modal, BibTeX copy, leaderboard, findings, grader and task charts. Numbers come from data/results.json.
const q = (s, r = document) => r.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fx = (v) => v.toFixed(1);
const sgn = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const neg = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOGO = { Anthropic: 'anthropic', Google: 'google', OpenAI: 'openai', Alibaba: 'alibaba', 'XLANG Lab': 'xlang' };
const FAM = { Anthropic: '#d97757', Google: '#4285f4', OpenAI: '#10a37f', Alibaba: '#615ced', 'XLANG Lab': '#5f6368' };  // ring colour of each family on the Pareto frontier
const logoOf = (m) => (/^Claude/.test(m) ? 'anthropic' : /^(Gemini|MedGemma)/.test(m) ? 'google' : /^(GPT|gpt)/.test(m) ? 'openai' : /^Qwen/.test(m) ? 'alibaba' : /^OpenCUA/.test(m) ? 'xlang' : '');
const named = (m) => (logoOf(m) ? `<img class="lg" src="assets/logos/${logoOf(m)}.png" alt="" width="16" height="16">` : '') + m;

document.querySelectorAll('[data-copy]').forEach((b) => {
  const label = b.textContent;
  b.onclick = () => {
    const text = q('#' + b.dataset.copy).textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      () => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = label; }, 1500); },
      () => { const r = document.createRange(); r.selectNodeContents(q('#' + b.dataset.copy)); getSelection().removeAllRanges(); getSelection().addRange(r); });
  };
});

// Video loads only when the modal opens.
(() => {
  const dlg = q('#video-modal'), v = q('#video');
  q('#watch').onclick = () => { if (!v.src) v.src = v.dataset.src; dlg.showModal(); v.play().catch(() => {}); };
  q('.close', dlg).onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => v.pause());
})();


// ------------------------------------------------------------------ coverflow
// Each card says which interface it shows and what the agent does there. The card in front replays the recorded actions of
// Claude Sonnet 5.5 on task sr259 (pointer, clicks, typing); the API card types its tool call; a still screen zooms to the part
// that matters (focus: centre and size of the ring, in % of the card). The fan moves on when the card in front has finished.
(() => {
  const S = 'assets/demo/sr259/', C = 'assets/cover/', UI = { gui: 'GUI', openmrs: 'OpenMRS', api: 'API' };
  const items = [
    { ui: 'gui', what: 'Ordering amoxicillin', img: S + 'gui/26072ffcd16d0fed.webp', clip: ['gui', 12, 16] },
    { ui: 'openmrs', what: 'The same order in OpenMRS', img: S + 'openmrs/1c0ccbf0d226998b.webp', clip: ['openmrs', 30, 34] },
    { ui: 'api', what: 'The same order as one tool call' },
    { ui: 'gui', what: 'Reading a scanned lab report', img: C + 'sr153_gui_step17.webp', focus: [71.5, 90, 32, 6] },
    { ui: 'gui', what: 'Checking an order before signing', img: C + 'sr153_gui_step72.webp', focus: [47.8, 75, 10, 7] },
    { ui: 'gui', what: 'Writing and signing the note', img: S + 'gui/e805453b35c908db.webp', clip: ['gui', 30, 35] },
    { ui: 'openmrs', what: 'Writing the visit note', img: S + 'openmrs/b5f5b2d0614eaf6b.webp', clip: ['openmrs', 51, 55] },
    { ui: 'gui', what: 'Scheduling a follow up test', img: C + 'sr153_gui_step80.webp', focus: [22, 62, 15, 7] },
  ];
  const CODE = '<b>fhir_medication_request_create</b>(\n  patient_reference = "Patient/sr-259",\n  medication_display = "Amoxicillin 500 MG Oral Capsule",\n'
    + '  dose_value = 500, dose_unit = "mg",\n  frequency_text = "Three times daily (every 8 hours)",\n  duration_value = 14, duration_unit = "d"\n)';
  const stage = q('#cover-stage');
  const els = items.map((it, k) => {
    const b = h('button', 'cv');
    b.type = 'button'; b.setAttribute('aria-label', `${UI[it.ui]}, ${it.what}`);
    if (it.ui === 'api') {
      b.classList.add('api-card');
      b.innerHTML = `<span class="api-top"><i></i><i></i><i></i>FHIR tool call</span><code>${CODE}</code><span class="api-res">→ MedicationRequest created, authored 2024-06-03</span>`;
    } else {
      b.innerHTML = `<img src="${it.img}" alt="" loading="${k < 3 ? 'eager' : 'lazy'}" width="1200" height="750">`;
      if (it.focus) { ['--fx', '--fy', '--fw', '--fh'].forEach((v, j) => b.style.setProperty(v, it.focus[j] + '%')); b.insertAdjacentHTML('beforeend', '<span class="spot"></span>'); }
    }
    b.insertAdjacentHTML('beforeend', `<span class="cv-tag"><i class="dot ${it.ui}"></i><b>${UI[it.ui]}</b>${it.what}</span>`);
    b.onclick = () => { go(k); };
    stage.append(b);
    return b;
  });
  let cur = 0, run = 0, hold = false, F = null;
  fetch(S + 'episode.json?v=202611220300').then((r) => r.json()).then((d) => { F = d.interfaces; }).catch(() => {});
  const wait = (ms, alive) => new Promise((res, rej) => setTimeout(() => (alive() ? res() : rej(new Error('stopped'))), ms));
  function go(k) {
    cur = (k + items.length) % items.length;
    els.forEach((e, j) => {
      let o = j - cur;
      if (o > items.length / 2) o -= items.length;
      if (o < -items.length / 2) o += items.length;
      const a = Math.abs(o);
      e.style.transform = `translateX(${o * 44}%) translateZ(${-a * 140}px) rotateY(${-o * 24}deg) scale(${1 - a * 0.06})`;
      e.style.opacity = a > 2 ? 0 : 1;  // side cards stay opaque so they never show through each other; a veil dims them
      e.style.setProperty('--dim', Math.min(a * 0.32, 0.7));
      e.style.zIndex = 10 - a;
      e.tabIndex = o === 0 ? 0 : -1;
      e.classList.toggle('on', o === 0);
    });
    start();
  }
  // a card back at rest: its first screen, no pointer, code shown in full
  function rest(k) {
    const it = items[k], e = els[k];
    e.classList.remove('zoom', 'typing');
    if (it.st && F) it.st.show(F[it.clip[0]].frames[it.clip[1]]);
    if (it.ui === 'api') { q('code', e).innerHTML = CODE; }
  }
  async function play(k, alive) {
    const it = items[k], e = els[k];
    if (it.clip && F) {
      const [ui, a, z] = it.clip, fr = F[ui].frames;
      if (!it.st) it.st = makeStage(e, S);
      it.st.show(fr[a]);
      await wait(500, alive);
      for (let j = a; j < z; j++) {
        await it.st.act(fr[j], alive);
        await it.st.crossfade(fr[j + 1], alive);
        it.st.show(fr[j + 1], [fr[j + 2]], { keep: true });
        await wait(160, alive);
      }
      await wait(1400, alive);
    } else if (it.ui === 'api') {
      const code = q('code', e), text = code.textContent;
      e.classList.add('typing'); code.textContent = '';
      for (let c = 1; c <= text.length; c += 2) { code.textContent = text.slice(0, c); await wait(16, alive); }
      code.innerHTML = CODE; e.classList.remove('typing');
      await wait(2600, alive);
    } else if (it.focus) {
      e.classList.add('zoom');
      await wait(4600, alive);
    } else {
      await wait(3200, alive);  // the episode has not loaded yet
    }
  }
  function start() {
    const t = ++run, alive = () => t === run, k = cur;
    els.forEach((e, j) => { if (j !== k) rest(j); });
    const r = stage.getBoundingClientRect();
    if (reducedMotion || r.bottom < 0 || r.top > innerHeight) return;  // checked here too, as scroll events can reach the observer late
    play(k, alive).then(() => { if (alive() && !hold) go(cur + 1); }).catch(() => {});
  }
  const pause = () => { hold = true; }, resume = () => { if (hold) { hold = false; start(); } };
  stage.addEventListener('mouseenter', pause); stage.addEventListener('mouseleave', resume);
  stage.addEventListener('focusin', pause); stage.addEventListener('focusout', resume);
  stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
  let seen = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(([x]) => { if (x.isIntersecting && !seen) start(); if (!x.isIntersecting) run++; seen = x.isIntersecting; }).observe(stage);
  go(0);
})();

// ------------------------------------------------------------------ menu on narrow screens
(() => {
  const b = q('.menu-btn'), n = q('#nav');
  const set = (o) => { n.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); };
  b.onclick = (e) => { e.stopPropagation(); set(!n.classList.contains('open')); };
  n.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.top')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && n.classList.contains('open')) { set(false); b.focus(); } });
})();

fetch('data/results.json?v=202611271200').then((r) => r.json()).then((R) => {
  LBT = R.lb_tasks || [];
  board(R.leaderboard, R.categories);
  findings(R);
  grader(R.grader);
  if (R.physicians) physicians(R.physicians);
  donuts(R.tasks);
  failStats(R.fail_stats);
}).catch(() => { q('#lb').textContent = 'The results could not be loaded.'; });

let LBT = [];  // the 39 consultation tasks in drill-down order, by category
const HELDOUT = ['Claude Sonnet 5.5', 'Gemini 3.5 Flash-Lite', 'Claude Opus 5.5', 'Gemini 4 Argon', 'GPT-6 Astra'];  // models with held out episodes in the task browser

// Per task, how many attempts passed through each interface (39 cells per row, grouped by PhysicianBench category).
function taskGrid(r, g) {
  const box = h('div', 'tgrid');
  ['api', 'gui'].forEach((ui) => {
    const G = r.grid && r.grid[ui]; if (!G) return;
    const line = h('div', 'tg-line');
    line.append(h('span', 'tg-lab', ui === 'api' ? 'API' : 'GUI'));
    const cells = h('div', 'tg-cells');
    LBT.forEach((t, k) => {
      if (k && t.cat !== LBT[k - 1].cat) cells.append(h('i', 'tg-gap'));
      const p = +G[g][k], n = +G.n[k];
      const c = h('i', `tg ${ui} l${n ? Math.round(3 * p / n) : 0}`);
      c.title = `${t.id.replace(/_/g, ' ')} (${t.cat}): passed on ${p} of ${n} attempt${n === 1 ? '' : 's'}`;
      cells.append(c);
    });
    line.append(cells); box.append(line);
  });
  const cats = h('div', 'tg-cats'); cats.append(h('span', 'tg-lab', ''));
  const names = h('div', 'tg-cells'); let prev = null;
  LBT.forEach((t, k) => { if (k && t.cat !== prev) names.append(h('i', 'tg-gap')); names.append(h('b', t.cat !== prev ? 'tg-cat' : '', t.cat !== prev ? t.cat : '')); prev = t.cat; });
  cats.append(names); box.append(cats);
  return box;
}

// Success against cost per episode for one interface: each model a logo in a ring, the Pareto front ringed in its family colour and labelled.
let costUI = 'gui';
function costPlot(rows, key) {
  const el = q('#lb-cost'); if (!el) return;
  const ui = costUI, pts = rows.filter((r) => r.cost && r[ui] && r.cost[ui] > 0).map((r) => ({ r, x: r.cost[ui], y: r[ui][key].mean }));
  const W = Math.max(300, Math.round(el.clientWidth) || 720), wide = W >= 560, H = wide ? 380 : 300, L = 40, Rt = 12, T = 34, B = 42, R = wide ? 12 : 10;  // drawn at its own width, so text stays at 11px
  const lx = Math.log10, lo = lx(Math.min(...pts.map((p) => p.x)) / 1.6), hi = lx(Math.max(...pts.map((p) => p.x)) * 1.6);
  const X = (v) => L + R + (lx(v) - lo) / (hi - lo) * (W - L - Rt - 2 * R), Y = (v) => T + (100 - v) / 100 * (H - T - B);
  const front = []; let bestY = -1;  // Pareto front: no cheaper model succeeds as often
  [...pts].sort((a, b) => a.x - b.x || b.y - a.y).forEach((p) => { if (p.y > bestY) { front.push(p); bestY = p.y; } });
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Success against cost per episode through the ${ui.toUpperCase()}">`;
  [0, 20, 40, 60, 80, 100].forEach((v) => { s += `<line class="gl" x1="${L}" x2="${W - Rt}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tk" x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`; });
  for (let e = Math.floor(lo); e <= Math.ceil(hi); e++) (wide ? [1, 2, 5] : [1]).forEach((m) => {
    const v = m * 10 ** e; if (lx(v) < lo || lx(v) > hi) return;
    s += `<text class="tk" x="${X(v)}" y="${H - B + 18}" text-anchor="middle">$${v >= 1 ? v : v.toFixed(2)}</text>`;
  });
  s += `<text class="ax" x="${(L + W - Rt) / 2}" y="${H - 4}" text-anchor="middle">Cost per episode (USD)</text><text class="ax" transform="translate(11 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">${key.endsWith('all3') ? 'pass³' : 'pass@1'} (%)</text>`;
  s += `<polyline class="front" points="${front.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}"/>`;
  const dot = (p, on) => {
    const cx = X(p.x), cy = Y(p.y), k = Math.round(R * 1.2), lg = LOGO[p.r.maker];
    return `<g class="pt${on ? ' on' : ''}"><circle cx="${cx}" cy="${cy}" r="${R}"${on ? ` style="stroke:${FAM[p.r.maker]}"` : ''}/>`
      + `<image class="${lg}" href="assets/logos/${lg}.png" x="${cx - k / 2}" y="${cy - k / 2}" width="${k}" height="${k}"/>`
      + `<title>${p.r.model}, ${p.y.toFixed(1)}% at $${p.x.toFixed(2)} per episode</title></g>`;
  };
  pts.filter((p) => !front.includes(p)).forEach((p) => { s += dot(p, false); });
  front.forEach((p) => { s += dot(p, true); });
  // labels of the front, left to right: above, below, right or left of the ring, never over another ring or label, else left out
  const boxes = pts.map((p) => [X(p.x) - R, Y(p.y) - R, X(p.x) + R, Y(p.y) + R]), hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  front.forEach((p) => {
    const cx = X(p.x), cy = Y(p.y), w = p.r.model.length * (wide ? 6.4 : 5.8), fs = wide ? 12 : 11, g = 5, own = boxes[pts.indexOf(p)];
    const up = cy - R - g - fs, tries = [[cx - w / 2, up], [cx - w / 2, cy + R + g], [cx - R, up], [cx + R - w, up], [cx + R + g, cy - fs / 2], [cx - R - g - w, cy - fs / 2], [cx - w / 2, up - fs - 4], [cx - w / 2, cy + R + g + fs + 4]];
    const at = tries.map(([x, y]) => [x, y, x + w, y + fs]).find((b) => b[0] >= 2 && b[2] <= W - 2 && b[1] >= 2 && b[3] <= H - B && !boxes.some((o) => o !== own && hit(b, o)));
    if (!at) return;
    boxes.push(at);
    s += `<text class="lbl" x="${at[0]}" y="${at[3] - 2}">${p.r.model}</text>`;
  });
  el.innerHTML = s + '</svg>';
}

// One bar with its 95% whisker and value. v in percent.
const bar = (cls, v, ci, label) => {
  const b = h('div', 'bar ' + cls);
  b.innerHTML = `<span class="track"><i class="fill" style="width:${v}%"></i>${ci ? `<i class="ci" style="left:${ci[0]}%;width:${ci[1] - ci[0]}%"></i>` : ''}</span><span class="val">${label ?? Math.round(v) + '%'}</span>`;
  return b;
};

// How each model ran (paper, Section 4): provider route, reasoning effort where set, and memory in each interface.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

function setup(m) {
  const hist = 'the API agent keeps 200,000 characters of tool output, the GUI agent its full history';
  if (m.startsWith('Claude')) return 'Anthropic API, full history through both interfaces.';
  if (m.startsWith('Gemini')) return `Vertex AI, thinking level low, ${hist}.`;
  if (m === 'GPT-6 Astra' || m === 'GPT-6.2 Astra') return `OpenRouter with OpenAI as provider, medium reasoning effort, ${hist}.`;
  if (m.startsWith('GPT')) return `OpenAI API, low reasoning effort, ${hist}.`;
  if (m.startsWith('OpenCUA')) return 'Our servers, its own harness with the last three screenshots.';
  if (m.startsWith('Qwen')) return 'Our servers, the API agent keeps 200,000 characters of tool output, the GUI agent up to 200 screenshots within its 65,536 token window.';
  if (m.startsWith('MedGemma')) return 'Our servers, the API agent keeps 200,000 characters of tool output, the GUI agent up to 200 screenshots within its 131,072 token window.';
  return '';
}

// ------------------------------------------------------------------ leaderboard
function board(rows, cats) {
  const grade = 's2';  // the grader of the paper's Table 1 and Fig. 1b
  let measure = '', cat = 'Overall';
  const K = () => grade + measure;
  const box = q('#lb');
  const arms = (r) => (cat === 'Overall' ? { api: r.api, gui: r.gui } : r.cats[cat]);
  const best = (r) => { const a = arms(r), key = K(); return Math.max(a.gui[key].mean, a.api ? a.api[key].mean : -1); };
  const order = ['Overall', 'Workup', 'Prescribing', 'Treatment planning', 'Diagnosis'];
  q('#cats').innerHTML = order.map((c) => `<button type="button" role="tab" data-c="${c}" aria-selected="${c === cat}" title="${c === 'Overall' ? 39 : cats[c]} consultations">${c}</button>`).join('');
  q('#cats').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    cat = b.dataset.c;
    q('#cats').querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    draw();
  };
  function draw() {
    const key = K();
    box.innerHTML = `<div class="lb-row lb-headrow" aria-hidden="true"><div class="rank">#</div><div class="who">Model</div>`
      + `<div class="axis"><span class="ticks">${[0, 25, 50, 75, 100].map((v) => `<i style="left:${v}%">${v}</i>`).join('')}</span>`
      + `<span class="unit">${measure ? 'pass<sup>3</sup>, %' : 'pass@1, %'}</span></div><div class="cost">USD per episode</div></div>`;
    let rank = 0, last = null;
    [...rows].sort((a, b) => best(b) - best(a)).forEach((r, idx) => {  // stable: ties keep the order of Table 1, as in the paper
      const A = arms(r);
      const top = Math.round(10 * best(r)) / 10;
      if (top !== last) { rank = idx + 1; last = top; }  // equal best scores share a rank
      const row = h('div', 'lb-row');
      row.tabIndex = 0; row.setAttribute('role', 'button'); row.setAttribute('aria-expanded', 'false');
      const badge = r.source && r.source !== 'ours' ? `<em class="src">${r.source === 'reproduced' ? 'Submitted, reproduced by us' : 'Submitted'}</em>` : '';
      row.innerHTML = `<div class="rank">${rank}</div><div class="who"><img src="assets/logos/${LOGO[r.maker]}.png" alt="" width="22" height="22"><span>${r.model}</span>${r.open ? '<em>Open weights</em>' : ''}${badge}</div>`;
      const bars = h('div', 'bars');
      if (A.api) bars.append(bar('api', A.api[key].mean, A.api[key].ci, fx(A.api[key].mean)));
      bars.append(bar('gui', A.gui[key].mean, A.gui[key].ci, fx(A.gui[key].mean)));
      const cost = h('div', 'cost');
      const usd = (v) => { const e = h('span', null, v == null ? '–' : `$${v.toFixed(2)}`); if (v == null) e.title = 'Open weights, run on our servers'; return e; };
      if (A.api) cost.append(usd(r.cost && r.cost.api));
      cost.append(usd(r.cost && r.cost.gui));
      row.append(bars, cost);
      const d = cat === 'Overall' && r.delta && r.delta[key];
      const gap = !d ? '' : Math.abs(d.mean) < 0.05 ? 'No gap between the two. ' : `${d.mean > 0 ? 'API' : 'GUI'} ahead by ${fx(Math.abs(d.mean))} points (95% CI ${d.mean > 0 ? `${neg(d.ci[0])} to ${neg(d.ci[1])}` : `${neg(-d.ci[1])} to ${neg(-d.ci[0])}`}, not adjusted for the number of models). `;
      // cost per task solved: the cost of one attempt divided by the share solved
      const per = (c, s) => (s.mean > 0 ? `$${(c / (s.mean / 100)).toFixed(2)}` : 'none solved');
      const more = r.api ? gap + (r.cost ? `One episode costs $${r.cost.api.toFixed(2)} through the API and $${r.cost.gui.toFixed(2)} on screen, at list prices with cached input at its cache rate. Per task solved, that is ${per(r.cost.api, r.api.s2)} and ${per(r.cost.gui, r.gui.s2)}.` : '')
        : 'Tested on screen only.';
      const det = h('div', 'more');
      const att = !r.attempts ? '' : r.attempts.api == null ? `${r.attempts.gui} attempts on screen`
        : r.attempts.api === r.attempts.gui ? `${r.attempts.gui} attempts through each interface` : `${r.attempts.api} attempts through the API and ${r.attempts.gui} on screen`;
      const when = r.evaluated ? `Run ${day(r.evaluated[0])}${r.evaluated[1] !== r.evaluated[0] ? ' to ' + day(r.evaluated[1]) : ''}, ${att} on 39 tasks. ` : '';
      det.append(h('p', null, more || `${A.api ? 'API ' + fx(A.api[key].mean) + ', ' : ''}GUI ${fx(A.gui[key].mean)}`), h('p', 'setup', when + 'Setup: ' + setup(r.model)));
      if (HELDOUT.includes(r.model)) {
        const go = h('button', 'linkish', 'Its held out tasks, with each attempt and what it left in the record →');
        go.type = 'button'; go.onclick = (e) => { e.stopPropagation(); if (window.showModelTasks) window.showModelTasks(r.model); };
        det.append(go);
      }
      if (LBT.length && r.grid) det.append(h('p', 'tg-head', 'Each consultation task, attempts passed (darker is more)'), taskGrid(r, grade));
      row.append(det);
      const toggle = () => { const open = row.classList.toggle('open'); row.setAttribute('aria-expanded', String(open)); };
      row.onclick = toggle;
      row.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
      box.append(row);
    });
    costPlot(rows, grade + measure);
  }
  let rs; window.addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => costPlot(rows, grade + measure), 200); });
  const seg = (id, set, after = draw) => document.querySelectorAll(`#${id} button`).forEach((b) => b.onclick = () => {
    set(b.dataset);
    document.querySelectorAll(`#${id} button`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    after();
  });
  seg('measure-seg', (d) => { measure = d.v; });
  seg('cost-seg', (d) => { costUI = d.v; }, () => costPlot(rows, grade + measure));
  draw();
}

// ------------------------------------------------------------------ findings and grader
function pair(el, groups) {
  groups.forEach(([name, rows]) => {
    const g = h('div', 'pair');
    g.append(h('p', 'pname', name));
    rows.forEach(([cls, lab, v, ci, text]) => { const b = bar(cls, v, ci, text); b.prepend(h('span', 'blab', lab)); g.append(b); });
    el.append(g);
  });
}

function findings(R) {
  const c = R.confirmation, m = R.memory;
  q('#c-mem').innerHTML = `<span>${Math.round(m['S-GUI-last3'].mean)}%</span><i>→</i><span>${Math.round(m['S-GUI-full'].mean)}%</span>`;
  pair(q('#c-equiv'), R.confirm_frontier.map((r) => [named(r.model), [['api', 'API', r.api], ['gui', 'GUI', r.gui]]]));
  const per = (v) => ({ v: 25 * v, label: `${v.toFixed(1)}` });  // bars on a 0 to 4 scale
  pair(q('#c-extra'), R.extra_orders.map((r) => [named(r.model), [['api', 'API', per(r.api).v, null, per(r.api).label], ['gui', 'GUI', per(r.gui).v, null, per(r.gui).label]]]));
  pair(q('#c-openmrs'), R.openmrs.slice(0, 3).map((r) => [named(r.model), [['gui', 'GUI', r.our_gui.mean, r.our_gui.ci], ['openmrs', 'OpenMRS', r.gui_b_v2.mean, r.gui_b_v2.ci]]]));
  // notes against the record: of the notes the judge passed, how many sat on a failed record, and the reverse
  const n = R.note_record;
  pair(q('#c-notes'), [
    [`Of ${n.note_pass.toLocaleString('en-US')} notes the judge passed, the record`, [['rev', 'Passed', 100 - n.share_note_pass_record_fail], ['miss', 'Failed', n.share_note_pass_record_fail]]],
    [`Of ${n.record_pass.toLocaleString('en-US')} records that passed, the note`, [['rev', 'Passed', 100 - n.share_record_pass_note_fail], ['miss', 'Failed', n.share_record_pass_note_fail]]]]);
  // kinds of required orders, least often placed first
  const kind = (t) => t[0].toUpperCase() + t.slice(1);
  pair(q('#c-orders'), [...R.order_types].sort((a, b) => a.api + a.gui - b.api - b.gui)
    .map((r) => [`${kind(r.type)}, ${r.checkpoints} checks`, [['api', 'API', r.api], ['gui', 'GUI', r.gui]]]));
}

function grader(rows) {
  const el = q('#c-grader');
  el.innerHTML = '<p class="key"><i class="sw orig"></i>PhysicianBench\'s checks <i class="sw rev"></i>Our grader</p>';
  const label = { 'Equivalent order rejected': 'Correct alternatives rejected', 'Tenfold dose credited': 'Tenfold doses credited',
    'Script ordering everything passed': 'A script ordering everything passed', 'Same 15 tests on every task passed': 'The same 15 tests on every task passed' };
  rows.filter((r) => label[r.label]).forEach((r) => {
    const g = h('div', 'pair');
    g.append(h('p', 'pname', label[r.label]));
    g.append(bar('orig', 100 * r.original[0] / r.original[1], null, `${r.original[0]} of ${r.original[1]}`));
    g.append(bar('rev', 100 * r.revised[0] / r.revised[1], null, `${r.revised[0]} of ${r.revised[1]}`));
    el.append(g);
  });
}

// physicians who saw neither the interface nor the grade, on held out episodes (paper Section 4.8)
function physicians(P) {
  const acc = (100 - P.material_pass).toFixed(0);
  q('#phys-title').textContent = `Physicians would accept ${acc}% of the episodes our grader passed`;
  q('#phys-sub').innerHTML = `${P.physicians} physicians · ${P.ratings} ratings of ${P.episodes} held out episodes of ${named('Claude Sonnet 5.5')} · interface, model and grade hidden`;
  const el = q('#c-phys');
  el.innerHTML = '<p class="key"><i class="sw rev"></i>Accepted as recorded or after minor edits <i class="sw miss"></i>Material correction needed</p>';
  const left = h('div', 'phys-col'), right = h('div', 'phys-col');
  pair(left, [
    [`Of ${P.pass_ratings} ratings of episodes our grader passed`, [['rev', 'Accepted', 100 - P.material_pass], ['miss', 'Correction', P.material_pass, P.material_pass_ci]]],
    [`Of ${P.fail_ratings} ratings of episodes our grader failed`, [['rev', 'Accepted', P.accept_fail, P.accept_fail_ci], ['miss', 'Correction', 100 - P.accept_fail]]]]);
  const total = P.causes.reduce((a, c) => a + c.n, 0), g = h('div', 'pair');
  g.append(h('p', 'pname', `What the ${total} corrections of passed episodes asked for`));
  P.causes.forEach((c) => { const b = bar('miss', 100 * c.n / total, null, `${c.n} of ${total}`); b.prepend(h('span', 'blab', c.label)); g.append(b); });
  right.append(g);
  el.append(left, right);
  q('#phys-cap').textContent = (Math.round(P.gui) === Math.round(P.api) ? `The share of passed episodes needing a material correction was ${Math.round(P.gui)}% through both the GUI and the API` : `The share of passed episodes needing a material correction was ${Math.round(P.gui)}% through the GUI and ${Math.round(P.api)}% through the API`) + `, and ${P.severe} corrections rated the possible harm as severe. `
    + `Every correction asked for care that the answer key does not check. Physicians often disagreed with each other (Fleiss' κ ${P.kappa.toFixed(2)}). Lines on the bars show 95% intervals over charts and physicians.`;
}

// ------------------------------------------------------------------ task donuts
const ICON = {
  official: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>',
  standard: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  hard: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>',
  expert: '<circle cx="9" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M11 20c0-3 2.5-5 5-5s5 2 5 5"/>',
  workflow: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  confirm: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
};
const SETS = { official: ['Real consultations', 'Specialist consultations on deidentified records, not public'],
  dev: ['Development', 'Synthetic patients, written while we built the benchmark: 94 basic tasks, 38 tricky charts, 14 lookalike pairs and 20 long visits'],
  heldout: ['Held out', 'Synthetic patients, written after development ended and run once to confirm the results, public with answers'] };

const SET_COLOR = { official: '#1a73e8', dev: '#188038', heldout: '#9aa0a6', standard: '#188038', hard: '#34a853', expert: '#81c995', workflow: '#f9ab00' };  // the task browser's kinds too

function donuts(T) {
  // a source in the legend also filters the task browser below; the consultations are not public
  const n = (k) => T.sets.filter((s) => (k === 'dev' ? !['official', 'confirm'].includes(s.key) : s.key === (k === 'heldout' ? 'confirm' : k))).reduce((a, s) => a + s.n, 0);
  donut(q('#d-sets'), 'By source', ['official', 'dev', 'heldout'].map((k) => ({ n: n(k), label: SETS[k][0], detail: SETS[k][1], color: SET_COLOR[k], icon: ICON[k === 'heldout' ? 'confirm' : k === 'dev' ? 'standard' : k],
    pick: k === 'official' ? null : () => window.filterTasks && window.filterTasks(k) })));
  const blues = T.fields.map((_, k) => `hsl(217 ${80 - k * 3}% ${38 + k * 4.4}%)`);
  donut(q('#d-fields'), 'By field', T.fields.map((f, k) => {
    const long = f.field.split(' ').length > 3;  // the centre holds at most three words
    return { n: f.n, label: f.field, short: long ? f.field.split(',')[0] : null, color: blues[k],
      detail: `${long ? f.field + ', ' : ''}${Math.round(100 * f.n / 355)}% of all tasks` };
  }));
}

function donut(fig, title, segs, unit = 'tasks') {
  const total = segs.reduce((s, x) => s + x.n, 0);
  let off = 0;
  const arcs = segs.map((s, k) => {
    s.mid = (off + s.n / 2) / total;  // midpoint of the arc, as a fraction of the ring from 12 o'clock
    const a = `<circle class="arc" data-k="${k}" cx="100" cy="100" r="78" pathLength="${total}" stroke="${s.color}" stroke-dasharray="${s.n - 0.6} ${total - s.n + 0.6}" stroke-dashoffset="${-off}" tabindex="0" aria-label="${s.label}, ${s.n} ${unit}"/>`;
    off += s.n; return a;
  }).join('');
  fig.innerHTML = `<div class="donut"><svg viewBox="0 0 200 200" role="img" aria-label="${title}">${arcs}</svg>`
    + `<div class="center"><b>${total}</b><span>${title}</span></div></div>`
    + `<ul class="legend">${segs.map((s, k) => `<li data-k="${k}" tabindex="-1">${s.icon ? `<svg class="ic" viewBox="0 0 24 24" style="color:${s.color}">${s.icon}</svg>` : `<i style="background:${s.color}"></i>`}<span>${s.label}</span><b>${s.n}</b></li>`).join('')}</ul>`
    + '<div class="tip" role="tooltip" hidden></div>';
  const center = q('.center', fig), tip = q('.tip', fig);
  const set = (k, from) => {
    fig.querySelectorAll('.arc').forEach((a) => a.classList.toggle('dim', k != null && +a.dataset.k !== k));
    fig.querySelectorAll('.legend li').forEach((l) => l.classList.toggle('on', +l.dataset.k === k));
    if (k == null) { center.innerHTML = `<b>${total}</b><span>${title}</span>`; tip.hidden = true; return; }
    const s = segs[k];
    center.innerHTML = `<b>${s.n}</b><span>${s.short || s.label}</span>`;
    tip.textContent = s.detail; tip.hidden = false;
    // place the card next to the legend row, or just outside the ring at the arc's midpoint
    const box = fig.getBoundingClientRect();
    let x, y;
    if (from && from.tagName === 'LI') { const r = from.getBoundingClientRect(); x = r.left - box.left; y = r.top - box.top - tip.offsetHeight - 6; }
    else { const d = q('.donut', fig).getBoundingClientRect(), a = 2 * Math.PI * s.mid, R = d.width / 2 + 6;
      x = d.left - box.left + d.width / 2 + Math.sin(a) * R; y = d.top - box.top + d.height / 2 - Math.cos(a) * R - tip.offsetHeight / 2; }
    tip.style.left = Math.max(8, Math.min(box.width - tip.offsetWidth - 8, x)) + 'px';
    tip.style.top = Math.max(8, y) + 'px';
  };
  fig.querySelectorAll('.arc, .legend li').forEach((e) => {
    const k = +e.dataset.k;
    e.addEventListener('mouseenter', () => set(k, e)); e.addEventListener('focus', () => set(k, e));
    e.addEventListener('click', () => { set(k, e); if (segs[k].pick) segs[k].pick(); });
  });
  fig.addEventListener('mouseleave', () => set(null));
}


// One-shot bar growth: each chart animates fully once it is a fifth in view.
(() => {
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('anim-bars');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold: 0.2});
  const watch = () => document.querySelectorAll('.bars:not(.in), .viz:not(.in)').forEach(el => io.observe(el));
  watch(); ['#lb', '#findings', '#grader'].forEach(sel => { const el = document.querySelector(sel); if (el) new MutationObserver(watch).observe(el, {childList: true, subtree: true}); });
})();

// ------------------------------------------------------------------ failure clips
// Short stretches of synthetic-task episodes, loaded when the block first comes into view and played only while it is visible.
(() => {
  const root = q('#fails');
  if (!root) return;
  const BASEF = 'assets/fails/';
  let clips, cur = 0, run = 0, stage, visible = false, want = 0;
  window.showFail = (k) => { want = k; if (clips) select(k); };  // the failure donuts open the matching clip
  const shot = q('#clip-shot'), calls = q('#clip-calls'), chip = q('#skipchip');
  const say = (id, t) => { q(id).textContent = t; };
  function select(k) {
    cur = k; run++;
    q('#fail-tabs').querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', String(j === k)));
    const c = clips[k];
    q('#clip-model').innerHTML = `${named(c.model)} · ${c.interface}`; say('#clip-cap', c.caption); say('#clip-check', c.check);
    const api = !c.frames;
    shot.hidden = api; calls.hidden = !api; chip.classList.remove('on');
    if (api) { calls.innerHTML = ''; say('#clip-count', `${c.calls.length} tool calls`); }
    else { stage.show(c.frames[0]); say('#clip-count', `Action ${c.frames[0].n} of ${c.actions}`); }
    if (visible && !reducedMotion) play(run).catch(() => {});
  }
  async function play(t) {
    const alive = () => t === run, wait = (ms) => stage.wait(ms, alive), c = clips[cur];
    for (;;) {
      if (!c.frames) {  // API clip: each call types in as it fires, orders in bold
        calls.innerHTML = ''; let orders = 0;
        for (const x of c.calls) {
          const li = h('li', x.create ? 'create' : '');
          li.innerHTML = `<span class="n">${x.n}</span><code></code>${x.what ? `<small>${x.what}</small>` : ''}`;
          calls.append(li); calls.scrollTop = calls.scrollHeight;
          const code = q('code', li);
          for (let j = 1; j <= x.tool.length; j += 3) { code.textContent = x.tool.slice(0, j); await wait(14); }
          code.textContent = x.tool;
          if (x.create) orders++;
          say('#clip-count', `${orders} order${orders === 1 ? '' : 's'} placed`);
          await wait(x.create ? 650 : 380);
        }
        await wait(3200); continue;
      }
      const F = c.frames;
      stage.show(F[0]);
      if (c.skipped_before) { chip.textContent = `${c.skipped_before} earlier actions skipped`; chip.classList.add('on'); await wait(1400); chip.classList.remove('on'); }
      for (let j = 0; j < F.length - 1; j++) {
        const f = F[j]; if (f.skip) continue;
        say('#clip-count', `Action ${f.n} of ${c.actions}`);
        await stage.act(f, alive);
        let next = F[j + 1];
        if (next.skip) { chip.textContent = `${next.skip} actions later`; chip.classList.add('on'); next = F[j + 2]; j++; }
        await stage.crossfade(next, alive);
        stage.show(next, [F[j + 2]], { keep: true });
        if (chip.classList.contains('on')) { await wait(900); chip.classList.remove('on'); }
        await wait(160);
      }
      say('#clip-count', `Ended after ${c.actions} actions`);
      await wait(2600);
    }
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible) { run++; return; }
    if (!clips) {
      fetch(BASEF + 'clips.json?v=202611081800').then((r) => r.json()).then((d) => {
        clips = d;
        stage = makeStage(shot, BASEF);
        q('#fail-tabs').innerHTML = d.map((c, k) => `<button type="button" role="tab" aria-selected="${k === 0}">${c.tab}</button>`).join('');
        q('#fail-tabs').onclick = (ev) => { const b = ev.target.closest('button'); if (b) select([...b.parentNode.children].indexOf(b)); };
        select(want);
      });
    } else select(cur);
  }, { threshold: 0.3 }).observe(root);
})();

// How failed episodes ended, frontier and smaller models, API and GUI pooled (the paper's failure figure, consultation tasks).
function failStats(G) {
  const cats = [['other', 'Placed every required order, failed another check', 'Other check', 'Placed every required order but failed another check, mostly the limit on extra orders', '#F6C978', 3],
    ['signed', 'Signed orders but missed or got one wrong', 'Signed, but wrong', 'Signed its orders, but a required one was missing or wrong', '#F2B3AE', 0],
    ['unsigned', 'Left orders unsigned', 'Unsigned', 'Drafted an order and never signed it', '#D64541', null],
    ['stopped', 'Stopped without ordering', 'Stopped', 'Ended the task as done without placing any order', '#9AA0A8', 1],
    ['timeout', 'Ran out of actions', 'Out of actions', 'Used up its action budget before placing any order', '#C9CDD3', 2],
    ['unable', 'Said it could not be done', 'Said impossible', 'Said the task could not be done, without placing any order', '#6B6B70', null]];
  G.forEach((g, j) => {
    const fig = q('#fs' + j);
    donut(fig, g.group, cats.map(([k, label, short, detail, color, tab]) => ({
      n: g[k], label, short, color, detail: `${detail}. ${g[k]} of ${g.failed} failed episodes.`,
      pick: tab == null ? null : () => window.showFail && window.showFail(tab) })), 'failed episodes');
  });
}
