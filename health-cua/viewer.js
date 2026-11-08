// Episode viewer: one synthetic task through the API, our GUI and OpenMRS, stepped in sync by phase.
const PHASES = ['Read the chart', 'Place the order', 'Write the note', 'Finish'];
const NAMES = { api: 'API', gui: 'Our GUI', openmrs: 'OpenMRS' };
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

let D, ui = 'gui', i = 0, timer = null;

fetch('assets/demo/sr259/episode.json').then((r) => r.json()).then((d) => { D = d; init(); })
  .catch(() => { $('do').textContent = 'The episode could not be loaded.'; });

const frames = (name) => D.interfaces[name].frames;
const indicesOf = (list, phase, skipLast) => list.map((f, k) => (f.phase === phase && !(skipLast && k === list.length - 1) ? k : -1)).filter((k) => k >= 0);

// Position of the screen episode within its phase, as (phase, fraction), so the other panes can follow.
function where() {
  const m = frames(ui), f = m[i];
  if (i === m.length - 1) return { phase: f.phase, frac: 1, end: true };
  const ks = indicesOf(m, f.phase, true);
  return { phase: f.phase, frac: (i - ks[0]) / ks.length, end: false };
}
function locate(list, w, hasFinalFrame) {
  if (w.end) return hasFinalFrame ? list.length - 1 : list.length;
  const ks = indicesOf(list, w.phase, hasFinalFrame);
  return ks[Math.min(ks.length - 1, Math.floor(w.frac * ks.length))];
}

function init() {
  buildCalls();
  buildPhases();
  buildOutcome();
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => setUi(t.dataset.ui)));
  $('prev').onclick = () => go(i - 1);
  $('next').onclick = () => go(i + 1);
  $('play').onclick = toggle;
  $('scrub').oninput = (e) => go(+e.target.value, true);
  $('viewer').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
  });
  render();
}

function buildCalls() {
  const ol = $('calls');
  frames('api').forEach((f, k) => {
    const li = el('li');
    const head = el('div');
    head.append(el('span', 'n', String(f.n)), el('span', 'tool', f.tool));
    const det = el('div', 'detail');
    if (f.say) det.append(el('p', 'say', f.say));
    const dl = el('dl');
    Object.entries(f.args).forEach(([key, v]) => dl.append(el('dt', null, key), el('dd', null, v)));
    det.append(dl, el('p', 'result', f.result));
    li.append(head, det);
    li.onclick = () => { const m = frames(ui); const t = m.findIndex((x) => x.phase >= f.phase); if (t >= 0) go(t); };
    ol.append(li);
  });
  const fin = el('li', 'final-item');
  fin.append(el('div', 'tool', 'Done'), el('p', 'final', D.interfaces.api.final));
  ol.append(fin);
}

function buildPhases() {
  PHASES.forEach((p, k) => {
    const b = el('button', 'phase', p);
    b.type = 'button';
    b.onclick = () => go(frames(ui).findIndex((f) => f.phase === k));
    $('phases').append(b);
  });
}

function buildOutcome() {
  const grid = $('outcome-grid');
  ['api', 'gui', 'openmrs'].forEach((name) => {
    const col = el('div', 'ocol');
    const h = el('h4');
    h.append(el('span', 'dot ' + name), document.createTextNode(NAMES[name]));
    const v = D.interfaces[name];
    if (v.success) h.append(el('span', 'ok', 'Task success'));
    col.append(h, el('p', 'sub', v.actions + (name === 'api' ? ' tool calls' : ' screen actions')));
    const ul = el('ul');
    v.checks.forEach((c) => ul.append(el('li', c.pass ? '' : 'fail', c.label)));
    col.append(ul, el('p', 'final', v.final));
    grid.append(col);
  });
}

function setUi(name) {
  document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.ui === name)));
  const w = where();
  ui = name;
  i = locate(frames(ui), w, true);
  render();
}

function go(k, fromScrub) {
  const m = frames(ui);
  i = Math.max(0, Math.min(m.length - 1, k));
  if (!fromScrub && i === m.length - 1) stop();
  render();
}

function toggle() { timer ? stop() : start(); }
function start() {
  if (i === frames(ui).length - 1) i = 0;
  $('play').textContent = '❚❚'; $('play').setAttribute('aria-label', 'Pause');
  timer = setInterval(() => go(i + 1), 1500);
}
function stop() {
  clearInterval(timer); timer = null;
  $('play').textContent = '▶'; $('play').setAttribute('aria-label', 'Play');
}

function render() {
  const m = frames(ui), f = m[i], w = where();
  const img = $('shot-img');
  img.src = 'assets/demo/sr259/' + f.img;
  [m[i + 1], m[i + 2]].forEach((n) => { if (n) new Image().src = 'assets/demo/sr259/' + n.img; });
  const mk = $('marker');
  if (f.x != null) { mk.style.left = f.x + '%'; mk.style.top = f.y + '%'; mk.style.display = 'block'; } else mk.style.display = 'none';
  const doEl = $('do');
  doEl.textContent = '';
  if (f.do) doEl.append(document.createTextNode('Next action  '), el('span', 'act', f.do));
  else doEl.textContent = 'Episode complete';
  $('say').textContent = f.say ? '“' + f.say + '”' : f.do ? '' : D.interfaces[ui].final;
  $('screen-count').textContent = f.n ? 'Action ' + f.n + ' of ' + D.interfaces[ui].actions : D.interfaces[ui].actions + ' actions';

  const a = locate(frames('api'), w, false);
  const calls = $('calls').children;
  [...calls].forEach((li, k) => { li.className = (k === a ? 'now' : k > a ? 'future' : '') + (k === calls.length - 1 ? ' final-item' : ''); });
  const ol = $('calls');
  ol.scrollTo({ top: calls[a].offsetTop - ol.clientHeight / 3, behavior: 'smooth' });
  const na = frames('api').length;
  $('api-count').textContent = a < na ? 'Call ' + frames('api')[a].n + ' of ' + D.interfaces.api.actions : D.interfaces.api.actions + ' calls';

  [...$('phases').children].forEach((b, k) => b.classList.toggle('on', k === w.phase));
  const s = $('scrub');
  s.max = String(m.length - 1);
  s.value = String(i);
}
