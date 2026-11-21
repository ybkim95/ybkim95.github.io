// Task browser: the 316 public synthetic tasks (data/tasks.json), searchable and filtered, each opening a task card with its request,
// decisive facts, answer key and, for the held out tasks, how each model did. Deep link: #task=<task id>.
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const GH = 'https://github.com/ybkim95/health-cua/blob/main/';
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MON[m - 1]} ${y}`; };
  const SET = { synthetic: 'Synthetic', heldout: 'Held out' };
  const UIS = ['API', 'GUI', 'OpenMRS'];
  let T = null, shown = 24;
  const state = { q: '', set: '', design: '', field: '', model: '' };

  function load() {
    if (T) return Promise.resolve(T);
    return fetch('data/tasks.json?v=202611211200').then((r) => r.json()).then((d) => (T = d.tasks));
  }

  function match(t) {
    if (state.set && t.set !== state.set) return false;
    if (state.design && t.design !== state.design) return false;
    if (state.field && t.field !== state.field) return false;
    if (state.model && !(t.results && t.results[state.model])) return false;
    if (!state.q) return true;
    const hay = [t.id, t.title, t.subject, t.request, t.field, t.role, ...t.facts, ...t.required.flatMap((o) => o.names), ...t.forbidden.flatMap((o) => o.names)].join(' ').toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }

  // one line per model on a held out task: how many attempts passed through each interface
  const tally = (r) => UIS.filter((u) => r[u]).map((u) => `${u} ${[...r[u]].filter((c) => c === '1').length}/${r[u].length}`).join(' · ');

  function list() {
    const rows = T.filter(match);
    $('tb-count').textContent = `${rows.length} of ${T.length} tasks`;
    $('tb-list').innerHTML = rows.slice(0, shown).map((t) => `<li><button type="button" class="tb-item" data-id="${esc(t.id)}">
      <span class="tb-title">${esc(t.title)}</span>
      <span class="tb-meta">${SET[t.set]} · ${esc(t.design)} · ${esc(t.field)}</span>
      ${state.model && t.results && t.results[state.model] ? `<span class="tb-marks">${esc(state.model)}: ${UIS.filter((u) => t.results[state.model][u]).map((u) => `${u} ${[...t.results[state.model][u]].map((c) => (c === '1' ? '<i class="ok">✓</i>' : '<i class="no">✗</i>')).join('')}`).join(' · ')}</span>` : ''}
      <span class="tb-req">${esc(t.request)}</span></button></li>`).join('');
    $('tb-more').hidden = rows.length <= shown;
  }

  function filters() {
    const fields = [...new Set(T.map((t) => t.field))].sort();
    $('tb-field').innerHTML = '<option value="">All fields</option>' + fields.map((f) => `<option>${esc(f)}</option>`).join('');
    $('tb-q').oninput = (e) => { state.q = e.target.value.trim(); shown = 24; list(); };
    $('tb-design').onchange = (e) => { state.design = e.target.value; shown = 24; list(); };
    $('tb-field').onchange = (e) => { state.field = e.target.value; shown = 24; list(); };
    const models = [...new Set(T.flatMap((t) => Object.keys(t.results || {})))];
    $('tb-model').innerHTML = '<option value="">Results of a model</option>' + models.map((m) => `<option>${esc(m)}</option>`).join('');
    $('tb-model').onchange = (e) => { state.model = e.target.value; shown = 24; list(); };
    $('tb-field').value = state.field; $('tb-model').value = state.model;  // a second call keeps the choices made
    document.querySelectorAll('#tb-set button').forEach((b) => b.onclick = () => {
      state.set = b.dataset.s; shown = 24;
      document.querySelectorAll('#tb-set button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      list();
    });
    $('tb-more').onclick = () => { shown += 48; list(); };
    $('tb-list').onclick = (e) => { const b = e.target.closest('.tb-item'); if (b) open(b.dataset.id); };
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

  function open(id) {
    load().then(() => {
      const t = T.find((x) => x.id === id); if (!t) return;
      const twin = t.twin && T.find((x) => x.id === t.twin);
      const extra = [t.no_order ? 'The correct answer places no order' : '', t.features.length ? 'Features: ' + t.features.join(', ') : '',
        twin ? `Twin of <a href="#task=${esc(twin.id)}">${esc(twin.title)}</a>` : ''].filter(Boolean);
      $('tc-body').innerHTML = `
        <header><p class="tc-meta">${SET[t.set]} · ${esc(t.design)} · ${esc(t.field)} · ${esc(t.role)} · ${day(t.date)}</p>
        <h3>${esc(t.title)}</h3><p class="tc-id">${esc(t.id)}${t.actions ? ` · the gold script needs ${t.actions} GUI actions` : ''}</p>
        ${t.flag ? `<p class="tc-flag">Chart defect flagged by the review of the held out charts (${esc(t.flag)}); the paper reports results with and without these tasks.</p>` : ''}</header>
        <section class="tc-inbox"><h4>The request</h4><p class="from">${esc(t.from)} · ${esc(t.subject)}</p><p>${esc(t.request)}</p></section>
        ${t.facts.length ? `<section><h4>Facts in the chart that decide it</h4><ul class="facts">${t.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></section>` : ''}
        <section><h4>Orders the answer key requires</h4>${t.required.length ? `<ol class="orders">${orderList(t.required, 'req')}</ol>` : '<p>None: the correct answer places no order.</p>'}</section>
        ${t.forbidden.length ? `<section><h4>Orders that would be wrong for this patient</h4><ol class="orders">${orderList(t.forbidden, 'bad')}</ol></section>` : ''}
        ${t.extras.length ? `<details><summary>Also accepted (${t.extras.length})</summary><ol class="orders">${orderList(t.extras, 'ok')}</ol></details>` : ''}
        ${extra.length ? `<p class="tc-extra">${extra.join(' · ')}</p>` : ''}
        ${results(t)}
        <p class="tc-links"><a href="${GH + t.path}">Answer key and checks (task.json)</a>${t.id.startsWith('sr259') ? ' · <a href="#replay" data-close>Watch it in the replay</a>' : ''}</p>`;
      $('tc-body').onclick = (e) => {
        const b = e.target.closest('.att'); if (!b) return;
        $('tc-body').querySelectorAll('.att').forEach((x) => x.classList.toggle('on', x === b));
        episode(t, b.dataset.m, b.dataset.u, +b.dataset.k);
      };
      const dlg = $('task-card');
      if (!dlg.open) dlg.showModal();
      dlg.scrollTop = 0;
      history.replaceState(null, '', '#task=' + id);
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
      state.model = m; state.set = 'heldout'; shown = 24; $('tb-model').value = m;
      document.querySelectorAll('#tb-set button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.s === 'heldout')));
      list(); box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
