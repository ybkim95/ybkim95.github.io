// Episode player: one synthetic task through the API, our GUI and OpenMRS. A pointer replays each recorded action on the
// screenshots (glide, press, type, scroll, keys), the API pane follows by phase, and playback starts when the player is in view.
const PHASES = ['Read the chart', 'Place the order', 'Write the note', 'Finish'];
const NAMES = { api: 'API', gui: 'GUI', openmrs: 'OpenMRS' };
const SPEED = +new URLSearchParams(location.search).get('speed') || 1;  // the overview video plays faster
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const ROOTDIR = 'assets/demo/sr259/', FIRST = 'fable';  // the agent shown first, the first entry of models.json
let BASE = ROOTDIR + FIRST + '/', MODELS = [], CACHE = {}, visible = false;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let D, S, ui = 'gui', i = 0, run = 0, playing = false, userPaused = false, apiShown = -1;

fetch(BASE + 'episode.json?v=202611101400').then((r) => r.json()).then((d) => { D = d; init(); })
  .catch(() => { $('do').textContent = 'The episode could not be loaded.'; });

const frames = (name) => D.interfaces[name].frames;
const indicesOf = (list, phase, skipLast) => list.map((f, k) => (f.phase === phase && !(skipLast && k === list.length - 1) ? k : -1)).filter((k) => k >= 0);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Position of the screen episode within its phase, so the API pane can follow.
function where() {
  const m = frames(ui), f = m[i];
  if (i === m.length - 1) return { phase: f.phase, frac: 1, end: true };
  const ks = indicesOf(m, f.phase, true);
  return { phase: f.phase, frac: (i - ks[0]) / ks.length, end: false };
}
function locate(list, w, hasFinalFrame) {
  if (w.end) return hasFinalFrame ? list.length - 1 : list.length;
  const ks = indicesOf(list, w.phase, hasFinalFrame);
  if (!ks.length) {  // this interface has no step in that phase: stay at its last step before it
    const before = list.map((f, k) => (f.phase <= w.phase ? k : -1)).filter((k) => k >= 0);
    return before.length ? before[before.length - 1] : 0;
  }
  return ks[Math.min(ks.length - 1, Math.floor(w.frac * ks.length))];
}

function init() {
  S = makeStage($('shot'), () => BASE);
  agents();
  buildCalls(); buildPhases(); buildOutcome(); drawLanes(); verdict('api-verdict', 'api');
  addEventListener('resize', () => { clearTimeout(drawLanes.t); drawLanes.t = setTimeout(drawLanes, 200); });
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => { userPaused = true; stop(); setUi(t.dataset.ui); }));
  $('prev').onclick = () => { userPaused = true; stop(); show(i - 1); };
  $('next').onclick = () => { userPaused = true; stop(); show(i + 1); };
  $('play').onclick = () => { if (playing) { userPaused = true; stop(); } else { userPaused = false; start(); } };
  $('scrub').oninput = (e) => { userPaused = true; stop(); show(+e.target.value); };
  $('viewer').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { userPaused = true; stop(); show(i + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { userPaused = true; stop(); show(i - 1); e.preventDefault(); }
  });
  show(0);
  // Autoplay in view, never with reduced motion or after the reader took control.
  if (!reduced && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !userPaused) start(); else if (!visible) stop(); }, { threshold: 0.35 }).observe($('viewer'));
  }
}

// Agent chips: each agent's episode of the same task loads when chosen; an interface it has no episode for is hidden.
function agents() {
  fetch(ROOTDIR + 'models.json?v=202611101400').then((r) => r.json()).then((list) => {
    MODELS = list; CACHE[FIRST] = D;
    const box = $('agents');
    box.innerHTML = list.map((m, k) => `<button type="button" role="tab" aria-selected="${k === 0}" data-k="${m.key}">${m.model}</button>`).join('');
    box.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      pick(b.dataset.k);
    };
  }).catch(() => {});
}
function pick(key) {
  stop(); userPaused = false;
  const load = CACHE[key] ? Promise.resolve(CACHE[key]) : fetch(ROOTDIR + (key ? key + '/' : '') + 'episode.json?v=202611101400').then((r) => r.json()).then((d) => (CACHE[key] = d));
  load.then((d) => {
    D = d; BASE = ROOTDIR + (key ? key + '/' : ''); apiShown = -1, i = 0;  // the old step may lie past the end of this episode
    $('calls').innerHTML = ''; $('outcome-grid').innerHTML = '';
    buildCalls(); buildOutcome(); drawLanes(); verdict('api-verdict', 'api');
    document.querySelectorAll('.tab').forEach((t) => { t.hidden = !D.interfaces[t.dataset.ui]; });
    ui = D.interfaces.gui ? 'gui' : 'openmrs';
    document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.ui === ui)));
    show(0);
    if (visible && !reduced) start();
  });
}

// Trajectory plot under the player: one segment per interface on a shared step scale, a row per chart section, dots coloured
// by phase, a cursor at the current step. Clicking a dot moves the player there.
const ROWS = ['Inbox', 'Summary', 'Problems', 'Medications', 'Results', 'Notes', 'Orders', 'Note writing', 'Sign'];
const PH = ['Read the chart', 'Place the order', 'Write the note', 'Finish'];
function drawLanes() {
  const box = $('lanes'); if (!box || !D) return;
  const G = ['api', 'gui', 'openmrs'].filter((n) => D.interfaces[n]).map((n) => ({ n, fr: D.interfaces[n].frames, len: D.interfaces[n].actions }));
  const LW = 96, P = 15, TOP = 20, GAP = 22, total = G.reduce((s, g) => s + g.len, 0);
  const unit = Math.max(6, (box.clientWidth - LW - GAP * (G.length - 1) - 8) / total);
  let x = LW, out = '';
  ROWS.forEach((r, k) => { out += `<text class="rl" x="${LW - 8}" y="${TOP + k * P + 4}">${r}</text><line class="grid" x1="${LW}" x2="100%" y1="${TOP + k * P}" y2="${TOP + k * P}"/>`; });
  G.forEach((g) => {
    g.x0 = x; g.w = g.len * unit;
    const X = (f, k) => x + ((f.n || g.len) - 0.5) * unit, Y = (f) => TOP + ROWS.indexOf(f.sec) * P;
    out += `<text class="gl" x="${x}" y="11">${NAMES[g.n]} <tspan>${g.len} ${g.n === 'api' ? 'calls' : 'actions'}</tspan></text>`;
    out += `<polyline class="path" points="${g.fr.map((f, k) => X(f, k) + ',' + Y(f)).join(' ')}"/>`;
    out += g.fr.map((f, k) => `<circle class="dot p${f.phase}" data-g="${g.n}" data-k="${k}" cx="${X(f, k)}" cy="${Y(f)}" r="3.2"><title>${NAMES[g.n]}, ${f.n ? (g.n === 'api' ? 'call ' : 'action ') + f.n : 'end'}: ${f.sec}</title></circle>`).join('');
    out += `<line class="cur" id="cur-${g.n}" y1="${TOP - 6}" y2="${TOP + (ROWS.length - 1) * P + 6}"/>`;
    x += g.w + GAP;
  });
  const W = x - GAP + 8, H = TOP + (ROWS.length - 1) * P + 10;
  box.innerHTML = `<svg width="${W}" height="${H}" role="img" aria-label="Trajectory of ${D.model}: ${G.map((g) => `${NAMES[g.n]} ${g.len} steps`).join(', ')}">${out}</svg>`
    + `<p class="lane-key">${PH.map((t, k) => `<span><i class="p${k}"></i>${t}</span>`).join('')}</p>`;
  box.G = G; box.unit = unit;
  box.querySelector('svg').onclick = (e) => {
    const d = e.target.closest('.dot'); if (!d) return;
    userPaused = true; stop();
    const g = d.dataset.g, k = +d.dataset.k;
    if (g === 'api') { const t = frames(ui).findIndex((f) => f.phase >= frames('api')[k].phase); show(t >= 0 ? t : 0); return; }
    if (g !== ui) { ui = g; document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.ui === ui))); }
    show(k);
  };
  laneCursor(-1);
}
function laneCursor(a) {
  const box = $('lanes'); if (!box || !box.G) return;
  box.G.forEach((g) => {
    const c = $('cur-' + g.n); if (!c) return;
    const k = g.n === 'api' ? Math.min(a < 0 ? 0 : a, g.fr.length - 1) : g.n === ui ? i : -1;
    if (k < 0) { c.style.display = 'none'; return; }
    const f = g.fr[k], xx = g.x0 + ((f.n || g.len) - 0.5) * box.unit;
    c.style.display = ''; c.setAttribute('x1', xx); c.setAttribute('x2', xx);
  });
  box.querySelectorAll('.dot.now').forEach((d) => d.classList.remove('now'));
  const d = box.querySelector(`.dot[data-g="${ui}"][data-k="${i}"]`); if (d) d.classList.add('now');
}

function buildCalls() {
  const ol = $('calls');
  frames('api').forEach((f) => {
    const li = el('li');
    const head = el('div');
    head.append(el('span', 'n', String(f.n)), el('span', 'tool', f.tool));
    li.dataset.tool = f.tool;
    const det = el('div', 'detail');
    if (f.say) det.append(el('p', 'say', f.say));
    const dl = el('dl');
    Object.entries(f.args).forEach(([key, v]) => dl.append(el('dt', null, key), el('dd', null, v)));
    det.append(dl, el('p', 'result', f.result));
    li.append(head, det);
    li.onclick = () => { userPaused = true; stop(); const m = frames(ui); const t = m.findIndex((x) => x.phase >= f.phase); if (t >= 0) show(t); };
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
    b.onclick = () => { userPaused = true; stop(); show(frames(ui).findIndex((f) => f.phase === k)); };
    $('phases').append(b);
  });
}

// The grader's verdict on every check of the task, per interface, with the episode's result below (the checks the task was written with).
function buildOutcome() {
  const box = $('outcome-grid');
  const uis = ['api', 'gui', 'openmrs'].filter((n) => D.interfaces[n]);
  const t = el('table', 'verdict');
  t.append(el('caption', null, `Grader verdict on each check of this task, ${D.model}`));
  const head = el('tr');
  head.append(el('th', null, 'Check'));
  uis.forEach((n) => { const th = el('th'); th.scope = 'col'; th.append(el('span', 'dot ' + n), document.createTextNode(NAMES[n])); head.append(th); });
  const thead = el('thead'); thead.append(head);
  const body = el('tbody');
  D.interfaces[uis[0]].checks.forEach(({ label }) => {
    const tr = el('tr'); const th = el('th', null, label); th.scope = 'row'; tr.append(th);
    uis.forEach((n) => {
      const c = D.interfaces[n].checks.find((x) => x.label === label), ok = !!(c && c.pass);
      const td = el('td', ok ? 'ok' : 'fail', ok ? '✓' : '✗'); td.setAttribute('aria-label', ok ? 'passed' : 'failed'); tr.append(td);
    });
    body.append(tr);
  });
  const fr = el('tr'); const fth = el('th', null, 'Episode'); fth.scope = 'row'; fr.append(fth);
  uis.forEach((n) => {
    const v = D.interfaces[n], td = el('td', v.success ? 'ok' : 'fail');
    td.append(el('b', null, v.success ? 'Success' : 'Failed'), el('small', null, v.actions + (n === 'api' ? ' tool calls' : ' actions')));
    fr.append(td);
  });
  const foot = el('tfoot'); foot.append(fr);
  t.append(thead, body, foot);
  box.append(t);
}

// The grader's result for the episode shown, in the pane header, as the reader watches it.
function verdict(id, n) {
  const v = D.interfaces[n], e = $(id); if (!e || !v) return;
  const p = v.checks.filter((c) => c.pass).length, t = v.checks.length;
  e.className = 'vbadge ' + (v.success ? 'ok' : 'fail');
  e.textContent = `${v.success ? 'Pass' : 'Fail'} ${p}/${t}`;
  e.title = `${p} of ${t} checks passed`;
}

function setUi(name) {
  const w = where();
  ui = name;
  document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.ui === name)));
  show(locate(frames(ui), w, true));
}

// View of frame k. Paused, the pointer rests where the agent acts next under a magnifier; playing, it stays put and glides there.
function show(k, moving = false) {
  const m = frames(ui);
  i = Math.max(0, Math.min(m.length - 1, k));
  const f = m[i];
  S.show(f, [m[i + 1], m[i + 2]], { keep: moving, lens: !moving });
  caption(f); verdict('screen-verdict', ui);
  sync();
}

function caption(f) {
  const doEl = $('do');
  doEl.textContent = '';
  if (f.do) doEl.append(el('span', 'act', f.do));
  else doEl.textContent = 'Episode complete';
  $('say').textContent = f.say ? '“' + f.say + '”' : f.do ? '' : D.interfaces[ui].final;
  $('screen-count').textContent = f.n ? 'Action ' + f.n + ' of ' + D.interfaces[ui].actions : D.interfaces[ui].actions + ' actions';
}

// The API pane follows the screen episode by phase; a newly reached call types in like a line of code.
function sync() {
  const a = locate(frames('api'), where(), false);
  const calls = $('calls').children;
  [...calls].forEach((li, k) => { li.className = (k === a ? 'now' : k > a ? 'future' : '') + (k === calls.length - 1 ? ' final-item' : ''); });
  const ol = $('calls');
  ol.scrollTo({ top: calls[a].offsetTop - ol.clientHeight / 3, behavior: reduced ? 'auto' : 'smooth' });
  if (playing && a !== apiShown && calls[a].dataset.tool) {
    const t = calls[a].querySelector('.tool'), full = calls[a].dataset.tool;
    let c = 0; const tick = () => { t.textContent = full.slice(0, ++c); if (c < full.length) setTimeout(tick, 18); };
    tick();
  }
  apiShown = a;
  const na = frames('api').length;
  $('api-count').textContent = a < na ? 'Call ' + frames('api')[a].n + ' of ' + D.interfaces.api.actions : D.interfaces.api.actions + ' calls';
  [...$('phases').children].forEach((b, k) => b.classList.toggle('on', k === where().phase));
  laneCursor(a);
  const s = $('scrub');
  s.max = String(frames(ui).length - 1);
  s.value = String(i);
}

function start() {
  if (playing || !D) return;
  playing = true; run++;
  $('play').textContent = '❚❚'; $('play').setAttribute('aria-label', 'Pause');
  loop(run).catch(() => {});
}
function stop() {
  run++; playing = false;
  $('play').textContent = '▶'; $('play').setAttribute('aria-label', 'Play');
  S.clear();
}

async function loop(token) {
  const alive = () => token === run, sleep = (ms) => S.wait(ms, alive);
  for (;;) {
    const m = frames(ui);
    if (i >= m.length - 1) {  // end of this interface: rest, then play the other one from the start
      await sleep(2200);
      ui = ui === 'gui' ? 'openmrs' : 'gui';
      document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.ui === ui)));
      show(0); await sleep(600); continue;
    }
    await S.act(m[i], alive);
    await S.crossfade(m[i + 1], alive);
    i++; show(i, true);
    await sleep(160);
  }
}

// A screenshot stage with a pointer that replays recorded actions (glide, press, type, scroll, keys). The main player and the
// failure clips each own one. alive() turns false when playback stops, which cancels any step in flight.
function makeStage(shot, base) {
  shot.insertAdjacentHTML('beforeend', '<img class="layer next" alt="" aria-hidden="true"><span class="ripple"></span><span class="bubble"></span><span class="keycap"></span><span class="wheel"></span><span class="lens"></span>'
    + '<svg class="pointer" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5v17.2l4.4-4.2 2.9 6.6 2.6-1.1-2.8-6.5 6.1-.3z"/></svg>');
  const sq = (s) => shot.querySelector(s), img = shot.querySelector('img:not(.layer)'), B = typeof base === 'function' ? base : () => base;
  let ptr = { x: 50, y: 50 };
  const wait = (ms, alive) => new Promise((res, rej) => setTimeout(() => (alive() ? res() : rej(new Error('stopped'))), ms / SPEED));
  const place = (p) => { const e = sq('.pointer'); e.style.left = p.x + '%'; e.style.top = p.y + '%'; };
  const clear = () => ['bubble', 'keycap', 'wheel'].forEach((c) => sq('.' + c).classList.remove('on'));
  // a 2.5x magnifier beside the pointer, so small text on the screen can be read
  function lens(at) {
    const L = sq('.lens');
    if (!at || !img.src) { L.classList.remove('on'); return; }
    const w = shot.clientWidth, hh = shot.clientHeight, Z = 2.5, R = L.offsetWidth / 2, px = at.x / 100 * w, py = at.y / 100 * hh;
    L.style.backgroundImage = `url("${img.src}")`;  // src, not currentSrc, which lags until the new frame loads
    L.style.backgroundSize = `${w * Z}px ${hh * Z}px`;
    L.style.backgroundPosition = `${R - px * Z}px ${R - py * Z}px`;
    L.style.left = (px > w * 0.62 ? px - 2 * R - 22 : px + 22) + 'px';
    L.style.top = Math.min(Math.max(py - R, 4), hh - 2 * R - 4) + 'px';
    L.classList.add('on');
  }
  function show(f, preload = [], o = {}) {
    img.src = B() + f.img;
    img.alt = `The EHR screen the agent saw${f.sec ? ', ' + f.sec : ''}${f.do ? '. Its next action: ' + f.do : ''}`;
    preload.forEach((n) => { if (n && n.img) new Image().src = B() + n.img; });
    if (f.x != null && !o.keep) ptr = { x: f.x, y: f.y };
    place(ptr); sq('.pointer').style.opacity = f.do ? 1 : 0; clear();
    lens(o.lens && f.do && f.x != null ? ptr : null);
  }
  function glide(to, alive) {
    const from = { ...ptr }, d = Math.hypot(to.x - from.x, to.y - from.y);
    const dur = (reduced ? 0 : Math.min(900, 380 + d * 9)) / SPEED;
    return new Promise((res, rej) => {
      const t0 = performance.now();
      const frame = (now) => {
        if (!alive()) return rej(new Error('stopped'));
        const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = ease(t);
        // a slight arc, as a hand moves a mouse
        ptr = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e - Math.sin(Math.PI * e) * Math.min(4, d / 12) };
        place(ptr);
        t < 1 ? requestAnimationFrame(frame) : (ptr = { ...to }, res());
      };
      requestAnimationFrame(frame);
    });
  }
  async function key(name, at, alive) {
    const k = sq('.keycap');
    k.textContent = name; k.style.left = Math.min(at.x, 85) + '%'; k.style.top = at.y + '%';
    k.classList.add('on'); await wait(450, alive); k.classList.remove('on');
  }
  async function act(f, alive) {
    const target = f.x != null ? { x: f.x, y: f.y } : ptr;
    lens(null);
    await glide(target, alive);
    const kind = (f.do || '').split(' ')[0];
    if (kind === 'Click' || kind === 'Select' || kind === 'Double') {
      const p = sq('.pointer'), r = sq('.ripple');
      r.style.left = target.x + '%'; r.style.top = target.y + '%';
      lens(target); await wait(420, alive);
      p.classList.add('press'); r.classList.remove('go'); void r.offsetWidth; r.classList.add('go');
      await wait(170, alive); p.classList.remove('press'); await wait(360, alive); lens(null);
    } else if (kind === 'Type') {
      const m = f.do.match(/“(.*)”/), text = m ? m[1].replace(/ …$/, '') : '';
      const b = sq('.bubble');
      b.style.left = Math.min(target.x, 62) + '%'; b.style.top = target.y + '%';
      b.textContent = ''; b.classList.add('on');
      const per = Math.max(12, Math.min(55, 1500 / Math.max(1, text.length)));
      for (let c = 1; c <= text.length; c++) { b.textContent = text.slice(0, c); await wait(per, alive); }
      await wait(250, alive);
      if (/press Enter/.test(f.do)) await key('Enter', target, alive);
      b.classList.remove('on');
    } else if (kind === 'Scroll') {
      const w = sq('.wheel');
      w.style.left = target.x + '%'; w.style.top = target.y + '%'; w.classList.add('on');
      img.classList.add('scrolling'); await wait(520, alive);
      img.classList.remove('scrolling'); w.classList.remove('on');
    } else if (kind === 'Press') {
      await key(f.do.replace('Press ', ''), target, alive);
    } else {
      await wait(300, alive);
    }
  }
  function crossfade(nextFrame, alive) {
    if (!nextFrame) return Promise.resolve();
    const n = sq('.layer.next');
    return new Promise((res, rej) => {
      n.onload = () => {
        n.onload = null; n.classList.add('in');
        setTimeout(() => {
          if (!alive()) { n.classList.remove('in'); return rej(new Error('stopped')); }
          img.src = n.src;  // the faded-in layer becomes the base, then the layer resets without a flash
          requestAnimationFrame(() => { n.classList.remove('in'); res(); });
        }, 340 / SPEED);
      };
      n.src = B() + nextFrame.img;
      if (n.complete && n.naturalWidth) n.onload();
    });
  }
  return { show, act, crossfade, wait, clear };
}
