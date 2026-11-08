// Coverflow, video modal, BibTeX copy, leaderboard, findings, grader and task charts. Numbers come from data/results.json.
const q = (s, r = document) => r.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fx = (v) => v.toFixed(1);
const sgn = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const neg = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOGO = { Anthropic: 'anthropic', Google: 'google', OpenAI: 'openai', Alibaba: 'alibaba', 'XLANG Lab': 'xlang' };

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
(() => {
  const S = 'assets/demo/sr259/', C = 'assets/cover/';
  const items = [
    { img: S + 'gui/26072ffcd16d0fed.webp', cap: 'Our GUI, ordering amoxicillin' },
    { img: S + 'openmrs/1c0ccbf0d226998b.webp', cap: 'OpenMRS, the same order' },
    { api: true, cap: 'API, the same order as one tool call' },
    { img: C + 'sr153_gui_step17.webp', cap: 'Our GUI, a scanned lab report' },
    { img: C + 'sr153_gui_step72.webp', cap: 'Our GUI, reviewing an order before signing' },
    { img: S + 'gui/e805453b35c908db.webp', cap: 'Our GUI, writing the note' },
    { img: S + 'openmrs/b5f5b2d0614eaf6b.webp', cap: 'OpenMRS, the visit note' },
    { img: C + 'sr153_gui_step80.webp', cap: 'Our GUI, scheduling a follow up test' },
  ];
  const stage = q('#cover-stage'), cap = q('#cover-cap');
  const els = items.map((it, k) => {
    const b = h('button', 'cv');
    b.type = 'button'; b.setAttribute('aria-label', it.cap);
    if (it.api) {
      b.classList.add('api-card');
      b.innerHTML = '<span class="api-top"><i></i><i></i><i></i>FHIR tool call</span><code><b>fhir_medication_request_create</b>(\n'
        + '  patient_reference = "Patient/sr-259",\n  medication_display = "Amoxicillin 500 MG Oral Capsule",\n'
        + '  dose_value = 500, dose_unit = "mg",\n  frequency_text = "Three times daily (every 8 hours)",\n  duration_value = 14, duration_unit = "d"\n)</code>'
        + '<span class="api-res">→ MedicationRequest created, authored 2024-06-03</span>';
    } else {
      b.innerHTML = `<img src="${it.img}" alt="" loading="${k < 3 ? 'eager' : 'lazy'}" width="1200" height="750">`;
    }
    b.onclick = () => { go(k); };
    stage.append(b);
    return b;
  });
  let cur = 0, timer = null;
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
    cap.textContent = items[cur].cap;
  }
  const play = () => { if (!reducedMotion && !timer) timer = setInterval(() => go(cur + 1), 3200); };
  const pause = () => { clearInterval(timer); timer = null; };
  stage.addEventListener('mouseenter', pause); stage.addEventListener('mouseleave', play);
  stage.addEventListener('focusin', pause); stage.addEventListener('focusout', play);
  stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
  go(0); play();
})();

fetch('data/results.json').then((r) => r.json()).then((R) => {
  board(R.leaderboard, R.categories);
  findings(R);
  grader(R.grader);
  donuts(R.tasks);
}).catch(() => { q('#lb').textContent = 'The results could not be loaded.'; });

// One bar with its 95% whisker and value. v in percent.
const bar = (cls, v, ci, label) => {
  const b = h('div', 'bar ' + cls);
  b.innerHTML = `<span class="track"><i class="fill" style="width:${v}%"></i>${ci ? `<i class="ci" style="left:${ci[0]}%;width:${ci[1] - ci[0]}%"></i>` : ''}</span><span class="val">${label ?? Math.round(v) + '%'}</span>`;
  return b;
};

// ------------------------------------------------------------------ leaderboard
function board(rows, cats) {
  let key = 'p1', cat = 'Overall';
  const box = q('#lb');
  const arms = (r) => (cat === 'Overall' ? { api: r.api, gui: r.gui } : r.cats[cat]);
  const best = (r) => { const a = arms(r); return Math.max(a.gui[key].mean, a.api ? a.api[key].mean : -1); };
  const order = ['Overall', 'Workup', 'Prescribing', 'Treatment planning', 'Diagnosis'];
  q('#cats').innerHTML = order.map((c) => `<button type="button" role="tab" data-c="${c}" aria-selected="${c === cat}">${c}${c === 'Overall' ? '' : ` <span>${cats[c]}</span>`}</button>`).join('');
  q('#cats').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    cat = b.dataset.c;
    q('#cats').querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    draw();
  };
  function draw() {
    box.innerHTML = '';
    [...rows].sort((a, b) => best(b) - best(a)).forEach((r) => {
      const A = arms(r);
      const row = h('div', 'lb-row');
      row.tabIndex = 0; row.setAttribute('role', 'button'); row.setAttribute('aria-expanded', 'false');
      row.innerHTML = `<div class="who"><img src="assets/logos/${LOGO[r.maker]}.png" alt="" width="22" height="22"><span>${r.model}</span>${r.open ? '<em>Open weights</em>' : ''}</div>`;
      const bars = h('div', 'bars');
      if (A.api) bars.append(bar('api', A.api[key].mean, A.api[key].ci, fx(A.api[key].mean)));
      bars.append(bar('gui', A.gui[key].mean, A.gui[key].ci, fx(A.gui[key].mean)));
      row.append(bars);
      const d = cat === 'Overall' && r.delta && r.delta[key];
      const gap = !d ? '' : Math.abs(d.mean) < 0.05 ? 'No gap between the two. ' : `${d.mean > 0 ? 'API' : 'GUI'} ahead by ${fx(Math.abs(d.mean))} points (95% CI ${neg(d.ci[0])} to ${neg(d.ci[1])}). `;
      const more = r.api ? gap + (r.cost ? `One episode costs $${r.cost.api.toFixed(2)} through the API and $${r.cost.gui.toFixed(2)} on screen.` : '')
        : 'Tested on screen only.';
      row.append(h('p', 'more', more || `${A.api ? 'API ' + fx(A.api[key].mean) + ', ' : ''}GUI ${fx(A.gui[key].mean)}`));
      const toggle = () => { const open = row.classList.toggle('open'); row.setAttribute('aria-expanded', String(open)); };
      row.onclick = toggle;
      row.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
      box.append(row);
    });
  }
  document.querySelectorAll('.lb-head .seg button').forEach((b) => b.onclick = () => {
    key = b.dataset.v;
    document.querySelectorAll('.lb-head .seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  });
  draw();
}

// ------------------------------------------------------------------ findings and grader
function pair(el, groups) {
  groups.forEach(([name, rows]) => {
    const g = h('div', 'pair');
    g.append(h('p', 'pname', name));
    rows.forEach(([cls, lab, v, ci]) => { const b = bar(cls, v, ci); b.prepend(h('span', 'blab', lab)); g.append(b); });
    el.append(g);
  });
}

function findings(R) {
  const c = R.confirmation;
  pair(q('#c-equiv'), [['Claude Sonnet 5.5', [['api', 'API', c.sonnet.api], ['gui', 'GUI', c.sonnet.gui]]],
    ['Gemini 3.5 Flash-Lite', [['api', 'API', c.flashlite.api], ['gui', 'GUI', c.flashlite.gui]]]]);
  pair(q('#c-openmrs'), R.openmrs.slice(0, 3).map((r) => [r.model, [['gui', 'Our GUI', r.our_gui.mean, r.our_gui.ci], ['openmrs', 'OpenMRS', r.gui_b_v2.mean, r.gui_b_v2.ci]]]));
  q('#astra-api').textContent = Math.round(R.astra_confirm.api) + '%';
  q('#astra-gui').textContent = Math.round(R.astra_confirm.gui) + '%';
}

function grader(rows) {
  const el = q('#c-grader');
  el.innerHTML = '<p class="key"><i class="sw orig"></i>Benchmark\'s own checks <i class="sw rev"></i>Our revised checks</p>';
  const label = { 'Equivalent order rejected': 'Correct alternatives rejected', 'Tenfold dose accepted': 'Tenfold doses accepted',
    'Script ordering everything passed': 'A script ordering everything passed', 'Same 15 tests on every task passed': 'The same 15 tests on every task passed' };
  rows.filter((r) => label[r.label]).forEach((r) => {
    const g = h('div', 'pair');
    g.append(h('p', 'pname', label[r.label]));
    g.append(bar('orig', 100 * r.original[0] / r.original[1], null, `${r.original[0]} of ${r.original[1]}`));
    g.append(bar('rev', 100 * r.revised[0] / r.revised[1], null, `${r.revised[0]} of ${r.revised[1]}`));
    el.append(g);
  });
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
const SETS = { official: ['Consultations', 'Real specialist consultations on deidentified records'], standard: ['Standard', 'Synthetic patients, same kinds of task as the consultations'],
  hard: ['Hard', 'A key fact is hidden, corrected later or needs a calculation'], expert: ['Expert twins', 'Pairs that differ in one fact that changes the right orders'],
  workflow: ['Workflow', 'Long visits with several problems and orders'], confirm: ['Held out', 'Written last and used only to confirm the results'] };

function donuts(T) {
  const setColors = ['#1a73e8', '#188038', '#34a853', '#81c995', '#f9ab00', '#9aa0a6'];
  donut(q('#d-sets'), 'By source', T.sets.map((s, k) => ({ n: s.n, label: SETS[s.key][0], detail: SETS[s.key][1], color: setColors[k], icon: ICON[s.key] })));
  const blues = T.fields.map((_, k) => `hsl(217 ${80 - k * 3}% ${38 + k * 4.4}%)`);
  donut(q('#d-fields'), 'By field', T.fields.map((f, k) => ({ n: f.n, label: f.field, color: blues[k] })));
}

function donut(fig, title, segs) {
  const total = segs.reduce((s, x) => s + x.n, 0);
  let off = 0;
  const arcs = segs.map((s, k) => {
    const a = `<circle class="arc" data-k="${k}" cx="100" cy="100" r="78" pathLength="${total}" stroke="${s.color}" stroke-dasharray="${s.n - 0.6} ${total - s.n + 0.6}" stroke-dashoffset="${-off}" tabindex="0" aria-label="${s.label}, ${s.n} tasks"/>`;
    off += s.n; return a;
  }).join('');
  fig.innerHTML = `<div class="donut"><svg viewBox="0 0 200 200" role="img" aria-label="${title}">${arcs}</svg>`
    + `<div class="center"><b>${total}</b><span>${title}</span></div></div>`
    + `<ul class="legend">${segs.map((s, k) => `<li data-k="${k}" tabindex="-1">${s.icon ? `<svg class="ic" viewBox="0 0 24 24" style="color:${s.color}">${s.icon}</svg>` : `<i style="background:${s.color}"></i>`}<span>${s.label}</span><b>${s.n}</b></li>`).join('')}</ul>`;
  const center = q('.center', fig);
  const set = (k) => {
    fig.querySelectorAll('.arc').forEach((a) => a.classList.toggle('dim', k != null && +a.dataset.k !== k));
    fig.querySelectorAll('.legend li').forEach((l) => l.classList.toggle('on', +l.dataset.k === k));
    center.innerHTML = k == null ? `<b>${total}</b><span>${title}</span>` : `<b>${segs[k].n}</b><span>${segs[k].label}</span>${segs[k].detail ? `<small>${segs[k].detail}</small>` : ''}`;
  };
  fig.querySelectorAll('.arc, .legend li').forEach((e) => {
    const k = +e.dataset.k;
    e.addEventListener('mouseenter', () => set(k)); e.addEventListener('focus', () => set(k)); e.addEventListener('click', () => set(k));
  });
  fig.addEventListener('mouseleave', () => set(null));
}
