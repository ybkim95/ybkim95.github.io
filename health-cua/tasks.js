// Task browser: the 316 public tasks (data/tasks.json), searchable and filtered, each opening a task card that reads in three steps
// (the request, the decisive facts, the right answer) and, for the held out tasks, one attempt through both interfaces and how each
// model did. Deep link: #task=<task id>.
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const GH = 'https://github.com/ybkim95/health-cua/blob/main/';
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MON[m - 1]} ${y}`; };
  const UIS = ['API', 'GUI', 'OpenMRS'];
  // the paper's four designs in plain words (one task, a filter), with the colour and icon of the donut above
  const TYPES = [['Standard', 'Basic', 'Basic', 'standard', 'One problem, the same kinds of task as the consultations'],
    ['Added features', 'Tricky chart', 'Tricky charts', 'hard', 'A fact in an older note, a corrected value, a calculation or a test before treatment'],
    ['Twin', 'Look-alike pair', 'Look-alike pairs', 'expert', 'Two versions of one patient that differ in one decisive fact'],
    ['Workflow', 'Long visit', 'Long visits', 'workflow', 'Several problems, four or more orders and a test to schedule']];
  const SETS = [['dev', 'Development', 'Written while we built the benchmark'], ['heldout', 'Held out', 'Written after development ended and run once to confirm the results']];
  const typeOf = (t) => TYPES.find((x) => x[0] === t.design);
  const setOf = (t) => (t.set === 'heldout' ? 'heldout' : 'dev');
  const icon = (k) => (typeof ICON !== 'undefined' && ICON[k] ? `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="color:${SET_COLOR[k]}">${ICON[k]}</svg>` : '');
  const PAGE = 12;
  let T = null, shown = PAGE;
  const state = { q: '', set: '', type: '', field: '', model: '' };

  function load() {
    if (T) return Promise.resolve(T);
    return fetch('data/tasks.json?v=202611220500').then((r) => r.json()).then((d) => (T = d.tasks));
  }

  function match(t) {
    if (state.set && setOf(t) !== state.set) return false;
    if (state.type && t.design !== state.type) return false;
    if (state.field && t.field !== state.field) return false;
    if (state.model && !(t.results && t.results[state.model])) return false;
    if (!state.q) return true;
    const hay = [t.id, t.title, t.subject, t.request, t.field, t.role, ...t.facts, ...t.required.flatMap((o) => o.names), ...t.forbidden.flatMap((o) => o.names)].join(' ').toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }

  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  // the right end of a row: on a held out task how many API and GUI attempts passed (or one model's marks), else the answer key's size
  function foot(t) {
    const r = t.results || {};
    if (state.model && r[state.model]) {
      return `<span class="tb-marks">${UIS.filter((u) => r[state.model][u]).map((u) => `${u} ${[...r[state.model][u]].map((c) => (c === '1' ? '<i class="ok">✓</i>' : '<i class="no">✗</i>')).join('')}`).join(' · ')}</span>`;
    }
    const at = Object.values(r).flatMap((m) => ['API', 'GUI'].flatMap((u) => [...(m[u] || '')]));
    if (!at.length) return `<span class="tb-key">${t.required.length ? plural(t.required.length, 'required order') : 'No order required'}</span>`;
    const p = at.filter((c) => c === '1').length;
    return `<span class="tb-solve" title="Attempts passed through the API and the GUI, ${plural(Object.keys(r).length, 'model')}"><span class="tb-sbar"><i style="width:${(100 * p / at.length).toFixed(1)}%"></i></span>${p} of ${at.length} passed</span>`;
  }

  function list() {
    const rows = T.filter(match);
    $('tb-count').textContent = rows.length === T.length ? `${T.length} public tasks` : `${rows.length} of ${T.length} public tasks`;
    $('tb-list').innerHTML = rows.slice(0, shown).map((t) => { const ty = typeOf(t); return `<li><button type="button" class="tb-row" data-id="${esc(t.id)}">
      <span class="tb-type">${icon(ty[3])}${ty[1]}</span>
      <span class="tb-main"><b>${esc(t.title)}</b><small>${esc(t.subject)} · ${esc(t.field)}</small></span>
      <span class="tb-right">${foot(t)}</span></button></li>`; }).join('');
    $('tb-more').hidden = rows.length <= shown;
    $('tb-more').textContent = `Show ${Math.min(PAGE, rows.length - shown)} more`;
  }

  function chips() {
    const n = (k) => T.filter((t) => setOf(t) === k).length;
    $('tb-src').innerHTML = `<button type="button" data-s="" aria-pressed="${!state.set}">All <b>${T.length}</b></button>`
      + SETS.map(([k, l, d]) => `<button type="button" data-s="${k}" aria-pressed="${state.set === k}" title="${d}">${l} <b>${n(k)}</b></button>`).join('');
  }
  function pickSet(k) {
    state.set = k; shown = PAGE;
    $('tb-src').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.s === k)));
    list();
  }

  function filters() {
    const fields = [...new Set(T.map((t) => t.field))].sort();
    $('tb-field').innerHTML = '<option value="">All fields</option>' + fields.map((f) => `<option>${esc(f)}</option>`).join('');
    $('tb-type').innerHTML = '<option value="">All kinds of task</option>' + TYPES.map(([k, , l]) => `<option value="${esc(k)}">${l} (${T.filter((t) => t.design === k).length})</option>`).join('');
    $('tb-q').oninput = (e) => { state.q = e.target.value.trim(); shown = PAGE; list(); };
    chips();
    $('tb-src').onclick = (e) => { const b = e.target.closest('button'); if (b) pickSet(b.dataset.s); };
    $('tb-field').onchange = (e) => { state.field = e.target.value; shown = PAGE; list(); };
    $('tb-type').onchange = (e) => { state.type = e.target.value; shown = PAGE; list(); };
    const models = [...new Set(T.flatMap((t) => Object.keys(t.results || {})))];
    $('tb-model').innerHTML = '<option value="">All models</option>' + models.map((m) => `<option>${esc(m)}</option>`).join('');
    $('tb-model').onchange = (e) => { state.model = e.target.value; shown = PAGE; list(); };
    $('tb-field').value = state.field; $('tb-model').value = state.model; $('tb-type').value = state.type;  // a second call keeps the choices made
    $('tb-more').onclick = () => { shown += PAGE; list(); };
    $('tb-list').onclick = (e) => { const b = e.target.closest('.tb-row'); if (b) open(b.dataset.id); };
  }

  const orderList = (os, cls) => os.map((o) => `<li class="${cls}">
      <div class="names">${o.names.length ? o.names.map((n) => `<span>${esc(n)}</span>`).join('') : '<em>Several phrasings, see the answer key</em>'}${o.more && o.names.length ? '<em>and other phrasings</em>' : ''}</div>
      ${o.why ? `<p>${esc(o.why)}</p>` : ''}</li>`).join('');

  function results(t) {
    const models = Object.keys(t.results || {});
    if (!models.length) return '';
    // API and GUI attempts open their episode below the table; OpenMRS attempts are graded on another record and show the mark only
    const cell = (m, u, s) => (s ? [...s].map((c, k) => {
      const lab = `${m}, ${u}, attempt ${k + 1}: ${c === '1' ? 'passed' : 'failed'}`;
      return u === 'OpenMRS' ? `<i class="${c === '1' ? 'ok' : 'no'}" title="${esc(lab)}">${c === '1' ? '✓' : '✗'}</i>`
        : `<button type="button" class="att ${c === '1' ? 'ok' : 'no'}" data-m="${esc(m)}" data-u="${u}" data-k="${k}" aria-label="${esc(lab)}, show the episode">${c === '1' ? '✓' : '✗'}</button>`;
    }).join('') : '<span class="na">–</span>');
    return `<section class="tc-results"><h4>How models did on this task</h4>
      <table><thead><tr><th>Model</th>${UIS.map((u) => `<th>${u}</th>`).join('')}</tr></thead><tbody>
      ${models.map((m) => `<tr><th>${esc(m)}</th>${UIS.map((u) => `<td>${cell(m, u, t.results[m][u])}</td>`).join('')}</tr>`).join('')}
      </tbody></table><p class="note">Each mark is one attempt, graded by the task's own checks. Select an API or GUI attempt to see what the agent left in the record. OpenMRS covers the 106 tasks it can grade.</p>
      <div class="episode" id="tc-episode" hidden></div></section>`;
  }

  const CHECK = { no_contraindicated_order: 'No order that is wrong for this patient', order_parsimony: 'No unjustified extra orders',
    documentation_fidelity: 'Note names no other patient', documentation_persisted: 'Note saved in the record', documentation_content: 'Note states the decision and its reason',
    obligation_closed: 'Request completed', commitment_integrity: 'No unsigned drafts left behind' };
  const EP = {};
  function episode(t, m, u, k) {
    const box = $('tc-episode');
    const get = EP[t.id] ? Promise.resolve(EP[t.id]) : fetch(`data/episodes/${t.id}.json?v=202611211200`).then((r) => r.json()).then((d) => (EP[t.id] = d));
    get.then((d) => {
      const e = ((d[m] || {})[u] || []).find((x) => x.repeat === k) || ((d[m] || {})[u] || [])[k];
      if (!e) { box.hidden = false; box.innerHTML = '<p class="note">This episode is not in the published set.</p>'; return; }
      const label = (id) => CHECK[id] || (() => { const o = t.required.find((x) => x.id === id) || t.forbidden.find((x) => x.id === id);
        return o ? (o.names.length ? 'Required order: ' + o.names.slice(0, 3).join(' or ') : 'Required order') : id.replace(/_/g, ' '); })();
      const st = { pass: ['ok', 'Passed'], fail: ['no', 'Failed'] };
      const order = (o) => `<li><b>${esc(o.name || o.type)}</b>${o.detail ? ` <span>${esc(o.detail)}</span>` : ''} <em>${esc(o.status)}</em></li>`;
      box.hidden = false;
      box.innerHTML = `<header><b>${esc(m)} · ${u} · attempt ${k + 1}</b> <span class="${e.ok ? 'ok' : 'no'}">${e.ok ? 'Passed' : 'Failed'}</span>
          <small>${e.actions} ${u === 'API' ? 'tool calls' : 'actions'} · ${e.turns} model turns · $${e.usd.toFixed(2)}</small></header>
        <h5>What the agent left in the record</h5>
        ${e.orders.length ? `<ul class="ep-orders">${e.orders.map(order).join('')}</ul>` : '<p class="note">No new orders, messages or notes in the record.</p>'}
        ${e.changed.length ? `<ul class="ep-orders">${e.changed.map((o) => `<li><b>${esc(o.name)}</b> <span>${esc(o.from)} → ${esc(o.to)}</span></li>`).join('')}</ul>` : ''}
        <h5>Checks</h5><ul class="ep-checks">${e.checks.map((c) => `<li class="${(st[c.status] || ['na'])[0]}">${esc(label(c.id))} <em>${(st[c.status] || ['na', c.status])[1]}</em></li>`).join('')}</ul>
        ${e.final ? `<h5>What the agent reported</h5><p class="ep-final">${esc(e.final)}</p>` : ''}
        ${e.note ? `<details><summary>The signed note${e.note_chars > e.note.length ? ', first 1,200 characters' : ''}</summary><pre class="ep-note">${esc(e.note)}</pre></details>` : ''}`;
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }).catch(() => { box.hidden = false; box.innerHTML = '<p class="note">The episode could not be loaded.</p>'; });
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // one required order as it reads in a chart: the first name and what the key checks, the other accepted names after it
  function answer(o) {
    const [first, ...rest] = o.names, what = [o.dose, o.freq, o.when].filter(Boolean).join(' · ');
    return `<li class="req"><i aria-hidden="true">✓</i><span><b>${first ? esc(cap(first)) : 'Required order'}</b>${what ? ` <em>${esc(what)}</em>` : ''}`
      + `${rest.length ? `<small>or ${esc(rest.slice(0, 4).join(', '))}${rest.length > 4 || o.more ? ' and others' : ''}</small>` : ''}</span></li>`;
  }
  const wrong = (o) => `<li class="bad"><i aria-hidden="true">✗</i><span>Not <b>${esc(o.names[0] || 'a wrong order')}</b>`
    + `${o.names.length > 1 ? `<small>nor ${esc(o.names.slice(1, 4).join(', '))}${o.names.length > 4 || o.more ? ' and others' : ''}</small>` : ''}</span></li>`;

  // One scored attempt of Claude Sonnet 5.5 through both interfaces, when published for this task: the API's write calls beside a
  // short replay of the GUI's key steps on the page's own stage.
  let play = 0;
  function attempt(t) {
    const box = $('tc-attempt'); if (!box) return;
    fetch(`data/attempts/${t.id}.json?v=202611220500`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d || !d.interfaces) return;
      const A = d.interfaces.api, G = d.interfaces.gui, base = `assets/tasks/${t.id}/`;
      const badge = (x) => `<span class="vbadge ${x.success ? 'ok' : 'fail'}">${x.success ? 'Pass' : 'Fail'} ${x.checks.filter((c) => c.pass).length}/${x.checks.length}</span>`;
      const reads = A.actions - A.frames.length;
      box.innerHTML = `<h4>${esc(d.model)}, attempt ${d.repeat + 1}, through both interfaces</h4>
        <div class="tc-two">
          <div class="pane api"><div class="pane-head"><span class="dot api"></span>API ${badge(A)}<span class="count">${plural(reads, 'read')}, then</span></div>
            <ol class="calls">${A.frames.map((f) => `<li><span class="n">${f.n}</span><span class="tool">${esc(f.tool)}</span>${f.args ? `<dl>${Object.entries(f.args).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(typeof v === 'string' ? v : JSON.stringify(v))}</dd>`).join('')}</dl>` : ''}</li>`).join('')}</ol></div>
          <div class="pane screen"><div class="pane-head"><span class="dot gui"></span>GUI ${badge(G)}<span class="count" id="ta-count"></span></div>
            <div class="shot" id="ta-shot"><img alt="The EHR screen the agent saw" width="1200" height="750"></div><p class="do" id="ta-do"></p></div>
        </div>`;
      box.hidden = false;
      const F = G.frames, st = makeStage($('ta-shot'), base), t0 = ++play, alive = () => t0 === play && $('task-card').open;
      const say = (k) => { $('ta-count').textContent = `Step ${k + 1} of ${F.length}, action ${F[k].n} of ${G.actions}`; $('ta-do').textContent = F[k].do || 'The final screen'; };
      st.show(F[0]); say(0);
      if (reducedMotion) return;
      (async () => {
        for (;;) {
          for (let k = 0; k < F.length - 1; k++) {
            await st.act(F[k], alive); await st.crossfade(F[k + 1], alive);
            st.show(F[k + 1], [F[k + 2]], { keep: true }); say(k + 1); await st.wait(400, alive);
          }
          await st.wait(2400, alive); st.show(F[0]); say(0); await st.wait(600, alive);
        }
      })().catch(() => {});
    }).catch(() => {});
  }

  function open(id) {
    load().then(() => {
      const t = T.find((x) => x.id === id); if (!t) return;
      const ty = typeOf(t), twin = t.twin && T.find((x) => x.id === t.twin);
      const meta = [`${icon(ty[3])}${ty[1]}`, t.set === 'heldout' ? 'Held out' : 'Development', esc(t.field), esc(t.role), day(t.date)];
      const extra = [t.features.length ? 'What makes it tricky: ' + t.features.join(', ') : '', twin ? `Look-alike of <a href="#task=${esc(twin.id)}">${esc(twin.title)}</a>` : ''].filter(Boolean);
      const why = [...t.required.map((o) => [o.names[0], o.why]), ...t.forbidden.map((o) => ['Not ' + (o.names[0] || ''), o.why])].filter(([, w]) => w);
      play++;
      $('tc-body').innerHTML = `
        <header><p class="tc-meta">${meta.map((m) => `<span>${m}</span>`).join('')}</p><h3>${esc(t.title)}</h3>
        ${t.flag ? `<p class="tc-flag">Chart defect flagged by the review of the held out charts (${esc(t.flag)}); the paper reports results with and without these tasks.</p>` : ''}</header>
        <div class="tc-steps">
          <section class="tc-step"><h4><span>1</span>The request</h4><p class="from">${esc(t.from)} · ${esc(t.subject)}</p><p class="msg">${esc(t.request)}</p></section>
          <section class="tc-step"><h4><span>2</span>What the chart shows</h4>${t.facts.length ? `<ul class="facts">${t.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '<p class="note">The decisive facts are spread through the chart.</p>'}</section>
          <section class="tc-step"><h4><span>3</span>The right answer</h4><ul class="ans">${t.required.length ? t.required.map(answer).join('') : '<li class="req"><i aria-hidden="true">✓</i><span><b>Place no order</b></span></li>'}${t.forbidden.map(wrong).join('')}</ul>
            <p class="note">${t.actions ? `The answer key takes ${t.actions} actions on screen. ` : ''}A signed note and a closed request are also checked.</p></section>
        </div>
        ${extra.length ? `<p class="tc-extra">${extra.join(' · ')}</p>` : ''}
        <section class="tc-attempt" id="tc-attempt" hidden></section>
        ${results(t)}
        <details class="tc-why"><summary>Why this is the answer</summary><dl>${why.map(([n, w]) => `<dt>${esc(cap(n || ''))}</dt><dd>${esc(w)}</dd>`).join('')}</dl></details>
        ${t.extras.length ? `<details class="tc-why"><summary>Also accepted, not required (${t.extras.length})</summary><ol class="orders">${orderList(t.extras, 'ok')}</ol></details>` : ''}
        <p class="tc-links"><a href="${GH + t.path}">Answer key and checks (task.json)</a>${t.id.startsWith('sr259') ? ' · <a href="#replay" data-close>Watch it in the demo</a>' : ''}</p>`;
      $('tc-body').onclick = (e) => {
        const b = e.target.closest('.att'); if (!b) return;
        $('tc-body').querySelectorAll('.att').forEach((x) => x.classList.toggle('on', x === b));
        episode(t, b.dataset.m, b.dataset.u, +b.dataset.k);
      };
      const dlg = $('task-card');
      if (!dlg.open) dlg.showModal();
      dlg.scrollTop = 0;
      history.replaceState(null, '', '#task=' + id);
      if (t.attempt) attempt(t);  // tasks with a published attempt through both interfaces
    });
  }

  function init() {
    const box = $('browser'); if (!box) return;
    const dlg = $('task-card');
    dlg.querySelector('.close').onclick = () => dlg.close();
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    dlg.addEventListener('close', () => { if (location.hash.startsWith('#task=')) history.replaceState(null, '', location.pathname + location.search); });
    const go = () => { const m = location.hash.match(/^#task=([\w-]+)/); if (m) open(m[1]); };
    window.addEventListener('hashchange', go);
    // load the 316 tasks when the browser comes near the screen, or at once for a deep link
    const start = () => load().then(() => { filters(); list(); });
    new IntersectionObserver((es, o) => { if (es.some((e) => e.isIntersecting)) { o.disconnect(); start(); } }, { rootMargin: '400px' }).observe(box);
    go();
    window.openTask = open;  // the leaderboard and the replay link here
    // a leaderboard row: the held out tasks of one model, with its marks on each
    window.showModelTasks = (m) => load().then(() => {
      if (!$('tb-model').options.length || $('tb-model').options.length === 1) { filters(); }
      state.model = m; $('tb-model').value = m;
      pickSet('heldout'); box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // a source picked in the donut above
    window.filterTasks = (k) => load().then(() => { if (!$('tb-src').children.length) { filters(); } pickSet(k); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
