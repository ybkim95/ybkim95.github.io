// Theme, BibTeX copy, the leaderboard and the finding charts. Every number comes from data/results.json (site_build_data.py).
const q = (s, r = document) => r.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const pct = (v) => (v == null ? '–' : v.toFixed(1));
const signed = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const neg = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);

// Theme toggle. Storage can be unavailable, so the page works without it.
q('#theme').onclick = () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* no storage */ }
};

document.querySelectorAll('[data-copy]').forEach((b) => {
  const label = b.textContent;
  b.onclick = () => {
    const text = q('#' + b.dataset.copy).textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      () => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = label; }, 1500); },
      () => { const r = document.createRange(); r.selectNodeContents(q('#' + b.dataset.copy)); getSelection().removeAllRanges(); getSelection().addRange(r); });
  };
});

fetch('data/results.json').then((r) => r.json()).then((R) => {
  board(R.leaderboard);
  findings(R);
}).catch(() => { q('#board tbody').innerHTML = '<tr><td colspan="7">The results could not be loaded.</td></tr>'; });

// ------------------------------------------------------------------ leaderboard
function board(rows) {
  const st = { metric: 'p1', grader: 'orig', sort: 'best', dir: -1 };
  const key = () => (st.grader === 'orig' ? 'p1' : 's2') + (st.metric === 'all3' ? '_all3' : '');
  const val = (r, col) => {
    const k = key();
    if (col === 'api') return r.api ? r.api[k].mean : null;
    if (col === 'gui') return r.gui[k].mean;
    if (col === 'delta') return r.delta ? r.delta[k].mean : null;
    if (col === 'cost') return r.cost ? (r.cost.api + r.cost.gui) / 2 : null;
    if (col === 'model') return r.model;
    return Math.max(r.gui[k].mean, r.api ? r.api[k].mean : -1);
  };
  document.querySelectorAll('.seg').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    st[g.dataset.key] = b.dataset.v;
    g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  }));
  document.querySelectorAll('#board th[data-sort]').forEach((th) => {
    th.tabIndex = 0;
    const go = () => { const c = th.dataset.sort; st.dir = st.sort === c ? -st.dir : c === 'model' || c === 'cost' ? 1 : -1; st.sort = c; draw(); };
    th.onclick = go; th.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
  });

  function draw() {
    const k = key();
    const sorted = [...rows].sort((a, b) => {
      const x = val(a, st.sort), y = val(b, st.sort);
      if (x == null) return 1; if (y == null) return -1;
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * st.dir;
    });
    const best = (col) => Math.max(...rows.map((r) => val(r, col) ?? -1));
    const bApi = best('api'), bGui = best('gui');
    const tb = q('#board tbody'); tb.innerHTML = '';
    sorted.forEach((r, i) => {
      const a = val(r, 'api'), g = val(r, 'gui'), d = r.delta && r.delta[k];
      const tr = h('tr');
      tr.append(h('td', 'rank', String(i + 1)));
      tr.append(h('td', 'model', `<b>${r.model}</b><small>${r.maker}${r.open ? ' <span class="badge">Open weights</span>' : ''}</small>`));
      tr.append(h('td', 'num api' + (a === bApi ? ' best' : ''), pct(a)));
      tr.append(h('td', 'num gui' + (g === bGui ? ' best' : ''), pct(g)));
      const lo = a == null ? g : Math.min(a, g), hi = a == null ? g : Math.max(a, g);
      tr.append(h('td', 'chart', `<span class="db"><i class="ln" style="left:${lo}%;width:${hi - lo}%"></i>`
        + (a == null ? '' : `<i class="pt api" style="left:${a}%" title="API ${pct(a)}"></i>`) + `<i class="pt gui" style="left:${g}%" title="GUI ${pct(g)}"></i></span>`));
      tr.append(h('td', 'num delta' + (d && (d.ci[0] > 0 || d.ci[1] < 0) ? ' sig' : ''),
        d ? `${signed(d.mean)}<small>${neg(d.ci[0])} to ${neg(d.ci[1])}</small>` : '<span class="na">GUI only</span>'));
      tr.append(h('td', 'num cost', r.cost ? `$${r.cost.api.toFixed(2)}<small>$${r.cost.gui.toFixed(2)} GUI</small>` : '–'));
      tb.append(tr);
    });
    document.querySelectorAll('#board th[data-sort]').forEach((th) => th.setAttribute('aria-sort',
      th.dataset.sort === st.sort ? (st.dir > 0 ? 'ascending' : 'descending') : 'none'));
    q('#board-foot').textContent = (st.metric === 'p1' ? 'pass@1, the expected success of one attempt, ' : 'pass³, the share of tasks solved on all three attempts, ')
      + 'in percent over 39 tasks under the ' + (st.grader === 'orig' ? 'original grader of PhysicianBench, the preregistered primary outcome. ' : 'revised grader. ')
      + 'API minus GUI is the paired difference in points with its 95% interval, in green when the interval excludes zero. '
      + 'Cost per episode is at list prices on the day of each study, API above and GUI below. Models are ranked by the better of the two interfaces.';
  }
  draw();
}

// ------------------------------------------------------------------ charts
// One horizontal bar chart in HTML so text stays readable at every width. rows: {label, sub, segs: [{v, c, t}], ci, text}
function bars(el, rows, { legend, max = 100, label } = {}) {
  el.setAttribute('aria-label', label || '');
  const box = h('div', 'bars');
  let grp = h('div', 'bgroup'); box.append(grp);
  rows.forEach((r) => {
    if (r.head) { if (grp.childNodes.length) { grp = h('div', 'bgroup'); box.append(grp); } grp.append(h('div', 'bhead', r.head)); return; }
    const row = h('div', 'brow');
    row.append(h('span', 'blab', r.label + (r.sub ? `<small>${r.sub}</small>` : '')));
    const tr = h('span', 'btrack');
    let x = 0;
    r.segs.forEach((s) => {
      const w = 100 * s.v / max;
      const seg = h('i', 'seg-' + s.c, w >= 9 && r.segs.length > 1 ? Math.round(s.v) : '');
      seg.style.left = x + '%'; seg.style.width = w + '%'; seg.title = s.t || '';
      tr.append(seg); x += w;
    });
    if (r.ci) { const c = h('b', 'ci'); c.style.left = 100 * r.ci[0] / max + '%'; c.style.width = 100 * (r.ci[1] - r.ci[0]) / max + '%'; tr.append(c); }
    row.append(tr, h('span', 'bval', r.text ?? ''));
    grp.append(row);
  });
  if (legend) {
    const lg = h('div', 'legend');
    legend.forEach(([c, t]) => lg.append(h('span', null, `<i class="seg-${c}"></i>${t}`)));
    el.append(lg);
  }
  el.append(box);
}
const one = (label, v, c, ci, sub) => ({ label, sub, segs: [{ v, c }], ci, text: v.toFixed(0) + '%' });

function findings(R) {
  const c = R.confirmation;
  q('#f-equiv').textContent = `On 150 held out synthetic tasks it succeeded on ${c.sonnet.api.toFixed(0)}% of attempts through the API and ${c.sonnet.gui.toFixed(0)}% through the GUI. `
    + `The difference of ${c.sonnet.gui_minus_api.toFixed(0)} points (90% CI ${c.sonnet.ci90[0]} to ${c.sonnet.ci90[1]}) lies inside the preregistered margin of 10 points. `
    + `Gemini 3.5 Flash-Lite fell from ${c.flashlite.api.toFixed(0)}% to ${c.flashlite.gui.toFixed(0)}% through the GUI.`;
  bars(q('#c-equiv'), [
    { head: 'Claude Sonnet 5.5' }, one('API', c.sonnet.api, 'api'), one('GUI', c.sonnet.gui, 'gui'),
    { head: 'Gemini 3.5 Flash-Lite' }, one('API', c.flashlite.api, 'api'), one('GUI', c.flashlite.gui, 'gui'),
  ], { label: 'Success on the confirmation set through each interface' });

  const m = R.memory;
  bars(q('#c-memory'), [
    one('GUI', m['S-GUI-last3'].mean, 'gui', m['S-GUI-last3'].ci, 'last 3 screenshots'),
    one('GUI', m['S-GUI-last3-notes'].mean, 'gui', m['S-GUI-last3-notes'].ci, 'last 3 screenshots and notes'),
    one('GUI', m['S-GUI-full'].mean, 'gui', m['S-GUI-full'].ci, 'full history'),
    one('API', m['S-FHIR-full'].mean, 'api', m['S-FHIR-full'].ci, 'full history'),
  ], { label: 'Success of Claude Sonnet 5.5 on the consultation tasks under each memory setting, with 95% intervals' });

  const om = [];
  R.openmrs.forEach((r) => {
    om.push({ head: r.model });
    om.push(one('API', r.api.mean, 'api', r.api.ci), one('Our GUI', r.our_gui.mean, 'gui', r.our_gui.ci), one('OpenMRS', r.gui_b_v2.mean, 'openmrs', r.gui_b_v2.ci));
  });
  bars(q('#c-openmrs'), om, { legend: [['api', 'API'], ['gui', 'Our GUI'], ['openmrs', 'OpenMRS']], label: 'Success on the first attempt at 106 held out tasks through the API, our GUI and OpenMRS, with 95% intervals' });
  q('#c-openmrs').classList.add('cols');

  const fm = [];
  ['Claude Opus 5.5', 'Claude Sonnet 5.5', 'Gemini 4 Argon', 'GPT-6.1 Sol', 'GPT-6 Luna', 'Gemini 3.5 Flash-Lite'].forEach((name) => {
    fm.push({ head: name });
    ['API', 'GUI'].forEach((ui) => {
      const f = R.failures[`${name}, ${ui}`];
      fm.push({ label: ui, segs: [{ v: f.p1, c: 'ok', t: 'Success' }, { v: f.missing, c: 'signed', t: 'Signed, incomplete or wrong' },
        { v: f.uncommitted, c: 'draft', t: 'Drafted, not signed' }, { v: f.none, c: 'none', t: 'No order' }] });
    });
  });
  bars(q('#c-fail'), fm, { legend: [['ok', 'Success'], ['signed', 'Signed, incomplete or wrong'], ['draft', 'Drafted, not signed'], ['none', 'No order']],
    label: 'How every episode ended on the consultation tasks, by model and interface, in percent of 117 episodes' });
  q('#c-fail').classList.add('cols');

  const rl = [], ct = R.reliability.consultation_tasks;
  ['Claude Opus 5.5', 'Claude Sonnet 5.5', 'Gemini 4 Argon', 'Gemini 3.5 Flash-Lite'].forEach((name) => {
    rl.push({ head: name });
    ['API', 'GUI'].forEach((ui) => {
      const v = ct[`${name}, ${ui}`], n = v.tasks;
      rl.push({ label: ui, segs: [{ v: 100 * v['3'] / n, c: 'ok', t: 'All three attempts' }, { v: 100 * v['12'] / n, c: 'signed', t: 'One or two' },
        { v: 100 * v['0'] / n, c: 'none', t: 'None' }] });
    });
  });
  bars(q('#c-rel'), rl, { legend: [['ok', 'Solved on all three attempts'], ['signed', 'On one or two'], ['none', 'On none']],
    label: 'Share of the 39 consultation tasks solved on all three attempts, on one or two, or on none' });
  q('#c-rel').classList.add('cols');

  const gr = [];
  R.grader.forEach((g) => {
    gr.push({ head: g.label });
    gr.push({ label: 'Original', segs: [{ v: 100 * g.original[0] / g.original[1], c: 'orig' }], text: `${g.original[0]}/${g.original[1]}` });
    gr.push({ label: 'Revised', segs: [{ v: 100 * g.revised[0] / g.revised[1], c: 'rev' }], text: `${g.revised[0]}/${g.revised[1]}` });
  });
  bars(q('#c-grader'), gr, { label: 'Error rates of the original and the revised grader on scripted controls without a model' });
}

