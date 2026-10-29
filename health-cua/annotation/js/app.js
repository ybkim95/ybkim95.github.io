import { createStore } from './store.js?v=4d1c651a8e';
import { h, md, toast, confirmBox, debounce, radios, fmtTime, emailKey, EMAIL_RE, GOOGLE_ICON } from './ui.js?v=4d1c651a8e';
import { renderChart, renderTask } from './chart.js?v=4d1c651a8e';
import { renderWork, initialResponse } from './orders.js?v=4d1c651a8e';

const app = document.getElementById('app');
let S; let ME = { user: null, admin: false, invite: null }; let SLOT = null; let CONFIG = {};
let online = true; const savedListeners = new Set();

// ---------- shell
function topbar(extra = []) {
  const status = h('span', { class: 'saved' }, 'Saved');
  const setStatus = (s) => { status.className = `saved ${s === 'saving' ? 'saving' : online ? '' : 'offline'}`; status.textContent = !online ? 'Offline: changes are kept and sync when you reconnect' : s === 'saving' ? 'Saving…' : 'All changes saved'; };
  savedListeners.clear(); savedListeners.add(setStatus); setStatus('saved');
  return h('div', {}, S.mode === 'demo' ? h('div', { class: 'demo-banner' }, 'Demo: invented cases, stored only in this browser. Nothing here is part of the study.') : null,
    h('header', { class: 'topbar' }, h('a', { class: 'brand', href: '#/', style: { color: 'inherit', textDecoration: 'none' } }, h('span', { class: 'mark' }), 'Health-CUA clinician study'),
      h('span', { class: 'grow' }), ...extra, ME.user ? status : null,
      ME.admin ? h('a', { class: 'btn small', href: '#/admin' }, 'Study team') : null,
      ME.user && S.mode !== 'demo' ? h('button', { class: 'ghost small', onclick: async () => { await S.signOut(); location.hash = '#/'; } }, 'Sign out') : null));
}
function page(children, wide = false, extra = []) { app.replaceChildren(topbar(extra), h('main', { class: `page${wide ? ' wide' : ''}` }, children)); }

function tracked(fn) {
  return async (...a) => {
    savedListeners.forEach((l) => l('saving'));
    try { await fn(...a); savedListeners.forEach((l) => l('saved')); } catch (e) { console.error(e); toast(`Not saved: ${e.message}`, 'bad'); }
  };
}

// ---------- sign in and onboarding
function signinView(msg) {
  app.replaceChildren(h('main', { class: 'page' }, h('div', { class: 'card signin stack' },
    h('div', { class: 'brand' }, h('span', { class: 'mark' }), 'Health-CUA clinician study'),
    h('h1', {}, 'Physician study of an AI agent in the electronic health record'),
    h('p', { class: 'muted' }, 'You will complete inbox tasks in a simulated patient chart, some on your own and some by reviewing orders that an AI agent drafted. All patients are synthetic.'),
    msg ? h('p', { class: 'problems' }, msg) : null,
    h('div', {}, h('button', { class: 'google', onclick: async () => { try { await S.signIn(); } catch (e) { if (e.code !== 'auth/popup-closed-by-user') signinView(`Sign-in failed: ${e.message}`); } }, html: `${GOOGLE_ICON}<span>Sign in with Google</span>` })),
    h('p', { class: 'small muted' }, 'Use the Google account at the address where you received your invitation.'))));
}

function notInvitedView() {
  page(h('div', { class: 'card stack', style: { maxWidth: '560px' } }, h('h1', {}, 'This account is not on the study list'),
    h('p', {}, 'You are signed in as ', h('strong', {}, ME.user.email), '. The study team invites each participant by email address.'),
    h('p', { class: 'muted' }, 'If you were invited at another address, sign out and sign in with that account. Otherwise, reply to your invitation and ask the study team to add this address.'),
    ME.user.emailVerified ? null : h('p', { class: 'problems' }, 'The email address of this Google account is not verified.')));
}

const BACKGROUND = {
  specialty: ['Internal medicine', 'Family medicine', 'Emergency medicine', 'Hospital medicine', 'Other'],
  level: ['Attending or consultant', 'Fellow', 'Resident, PGY-3 or later', 'Resident, PGY-1 or 2', 'Other'],
  ai: ['Never', 'A few times', 'Monthly', 'Weekly', 'Daily'],
};

function consentView(profile) {
  const contact = CONFIG.contact || 'the study team at the address in your invitation';
  const agree = h('input', { type: 'checkbox', id: 'agree' });
  const name = h('input', { type: 'text', placeholder: 'Type your full name' });
  const go = h('button', { class: 'primary', onclick: tracked(async () => {
    if (!agree.checked || name.value.trim().length < 3) { toast('Tick the box and type your full name to continue.', 'bad'); return; }
    await S.saveProfile({ consent: { agreed: true, name: name.value.trim(), at: Date.now(), version: CONFIG.version || 'C-draft-1' } });
    route();
  }) }, 'I agree and continue');
  page(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Step 1 of 3'), h('h1', {}, 'Study information'),
    h('div', { class: 'md', html: md(`**Purpose.** We study how physicians work with an AI agent that operates the electronic health record (EHR). The agent reads the chart and drafts orders for an inbox task. We compare work done alone with work done by reviewing the agent's drafts.

**What you will do.** ${CONFIG.cases || 16} study cases and 2 practice cases, in two blocks. In one block you work alone. In the other you see the agent's message and its draft orders, which you sign, edit or remove. Each case takes about 5 to 10 minutes, about 2 to 3 hours in all. You can stop at any time and continue later; your work is saved as you go.

**The cases.** All patients are synthetic. No real patient data are shown. The agent's drafts are real outputs of an AI agent and may contain errors. Work as you would in practice. You may use the references you normally use.

**What we record.** Your orders, notes and answers, the time you spend on each case, and the background questions on the next page. Your Google account is used only to sign you in. Results are reported in aggregate, and individual answers are reported under a participant code, never your name.

**Voluntary.** Taking part is voluntary. You may stop at any time without giving a reason, and you may ask for your answers to be deleted by contacting ${contact}.${CONFIG.ethics ? `\n\n**Ethics.** ${CONFIG.ethics}` : ''}`) }),
    h('label', { class: 'check' }, agree, 'I have read the study information and agree to take part.'), name, h('div', { class: 'row' }, go)));
}

function profileView(profile) {
  const p = { ...(profile?.background || {}) };
  const save = debounce(tracked(async () => S.saveProfile({ background: p })), 400);
  const set = (k) => (v) => { p[k] = v; save(); };
  const txt = (k, attrs = {}) => { const el = h('input', { type: 'text', value: p[k] || '', ...attrs }); el.addEventListener('input', () => set(k)(el.value)); return el; };
  const num = (k) => { const el = h('input', { type: 'number', min: '0', max: '60', value: p[k] ?? '' }); el.addEventListener('input', () => set(k)(el.value === '' ? null : Number(el.value))); return el; };
  const box = h('div');
  const draw = () => box.replaceChildren(...[
    h('label', {}, 'Specialty'), radios('spec', BACKGROUND.specialty.map((x) => [x, x]), p.specialty, (v) => { set('specialty')(v); draw(); }),
    p.specialty === 'Other' ? txt('specialtyOther', { placeholder: 'Your specialty' }) : null,
    h('label', {}, 'Training level'), radios('lvl', BACKGROUND.level.map((x) => [x, x]), p.level, (v) => { set('level')(v); draw(); }),
    h('div', { class: 'grid2' }, h('div', {}, h('label', {}, 'Years of clinical practice since medical school'), num('years')),
      h('div', {}, h('label', {}, 'Country of practice'), txt('country'))),
    h('label', {}, 'EHR you use most ', h('span', { class: 'opt' }, '(for example Epic, Cerner)')), txt('ehr'),
    h('label', {}, 'How often do you use AI tools such as chatbots in clinical work?'), radios('ai', BACKGROUND.ai.map((x) => [x, x]), p.aiUse, (v) => { set('aiUse')(v); draw(); }),
    h('label', {}, 'Did you write, review or see any of the study cases before today?'), radios('prior', [['no', 'No'], ['yes', 'Yes']], p.priorExposure, (v) => { set('priorExposure')(v); draw(); })].filter(Boolean));
  draw();
  const go = h('button', { class: 'primary', onclick: tracked(async () => {
    if (!p.specialty || !p.level || p.years === undefined || p.years === null || !p.aiUse || !p.priorExposure) { toast('Answer every question to continue.', 'bad'); return; }
    await S.saveProfile({ background: p, backgroundDone: Date.now() }); route();
  }) }, 'Continue');
  page(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Step 2 of 3'), h('h1', {}, 'About you'), box, h('div', { class: 'row' }, go)));
}

function howView() {
  page(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Step 3 of 3'), h('h1', {}, 'How a case works'),
    h('div', { class: 'md', html: md(`Each case opens on an **inbox item** and the **task** for the clinician you act as. The **chart** is on the left, with tabs for the summary, problems, medications, results, vitals, notes and procedures. Read what you need, as in practice.

On the right you place your **orders**: medications (with dose, unit, frequency and route), tests, referrals and follow-up visits, each signed when you save it. To stop a current medication, use **Stop…** on the Medications tab. A changed dose is entered as a new medication order. Then write a short **assessment and plan** and answer a few questions.

**With the AI agent's draft.** In one block the agent has already worked on the inbox item. You see its message and its orders and medication stops as **pending** items. Sign, edit or remove each one, and add anything that is missing. Nothing the agent drafted counts until you sign it.

The two practice cases come first, one of each kind. Your work saves automatically. Submitting a case locks it.`) }),
    h('div', { class: 'row' }, h('button', { class: 'primary', onclick: tracked(async () => { await S.saveProfile({ howRead: Date.now() }); location.hash = '#/queue'; route(); }) }, 'Go to my cases'))));
}

// ---------- queue
function orderedItems() { return Object.entries(SLOT.items).map(([id, v]) => ({ id, ...v })).sort((a, b) => a.pos - b.pos); }
const BLOCK_SURVEYS = (items) => [...new Set(items.filter((i) => !i.practice).map((i) => i.block))].map((b) => `block${b}`);

async function nextStep() {
  const [resp, surveys] = await Promise.all([S.responses(), S.surveys()]);
  const items = orderedItems();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!resp[it.id]?.submittedAt) return { kind: 'case', id: it.id, resp, surveys };
    const last = !items[i + 1] || items[i + 1].block !== it.block;
    if (last && !it.practice && !surveys[`block${it.block}`]?.submittedAt) return { kind: 'survey', id: `block${it.block}`, block: it.block, condition: it.condition, resp, surveys };
  }
  if (!surveys.final?.submittedAt) return { kind: 'survey', id: 'final', resp, surveys };
  return { kind: 'done', resp, surveys };
}

async function queueView() {
  const step = await nextStep();
  const items = orderedItems();
  const done = items.filter((i) => step.resp[i.id]?.submittedAt).length;
  const blocks = [...new Set(items.map((i) => i.block))];
  const label = (b) => { const it = items.find((i) => i.block === b); return b === 0 ? 'Practice' : `Block ${b}: ${it.condition === 'assisted' ? "reviewing the AI agent's drafts" : 'working alone'}`; };
  const list = h('div', { class: 'queue' });
  let n = 0;
  for (const b of blocks) {
    list.append(h('div', { class: 'block-head' }, h('h3', { style: { margin: 0 } }, label(b)), b === 0 ? h('span', { class: 'muted small' }, 'Not scored') : null));
    for (const it of items.filter((i) => i.block === b)) {
      n++;
      const r = step.resp[it.id];
      const isCur = step.kind === 'case' && step.id === it.id;
      const state = r?.submittedAt ? h('span', { class: 'pill ok' }, '✓ Submitted') : isCur ? h('a', { class: 'btn primary small', href: `#/case/${it.id}` }, r ? 'Continue' : 'Start') : h('span', { class: 'pill' }, 'Locked');
      list.append(h('div', { class: `qitem${isCur ? ' current' : ''}${!r?.submittedAt && !isCur ? ' locked' : ''}` }, h('span', { class: 'n' }, String(n).padStart(2, '0')),
        h('div', {}, h('div', { style: { fontWeight: 600 } }, it.practice ? `Practice case ${n}` : `Case ${n - 2}`), h('div', { class: 'small muted' }, it.condition === 'assisted' ? 'With the AI agent\'s draft' : 'On your own')),
        r?.submittedAt ? h('div', { class: 'row' }, state, h('a', { class: 'btn small ghost', href: `#/case/${it.id}` }, 'View')) : state));
    }
    if (b !== 0) {
      const sid = `block${b}`; const sv = step.surveys[sid]; const cur = step.kind === 'survey' && step.id === sid;
      list.append(h('div', { class: `qitem${cur ? ' current' : ''}${!sv?.submittedAt && !cur ? ' locked' : ''}` }, h('span', { class: 'n' }, '—'), h('div', {}, h('div', { style: { fontWeight: 600 } }, 'Questionnaire on this block')),
        sv?.submittedAt ? h('span', { class: 'pill ok' }, '✓ Done') : cur ? h('a', { class: 'btn primary small', href: `#/survey/${sid}` }, 'Start') : h('span', { class: 'pill' }, 'Locked')));
    }
  }
  const fin = step.surveys.final?.submittedAt;
  list.append(h('div', { class: 'block-head' }, h('h3', { style: { margin: 0 } }, 'Finish')), h('div', { class: `qitem${step.kind === 'survey' && step.id === 'final' ? ' current' : ''}${!fin && step.id !== 'final' ? ' locked' : ''}` },
    h('span', { class: 'n' }, '—'), h('div', {}, h('div', { style: { fontWeight: 600 } }, 'Final questions')),
    fin ? h('span', { class: 'pill ok' }, '✓ Done') : step.id === 'final' ? h('a', { class: 'btn primary small', href: '#/survey/final' }, 'Start') : h('span', { class: 'pill' }, 'Locked')));
  const total = items.length;
  const cta = step.kind === 'case' ? h('a', { class: 'btn primary', href: `#/case/${step.id}` }, step.resp[step.id] ? 'Continue where you left off' : 'Start the next case')
    : step.kind === 'survey' ? h('a', { class: 'btn primary', href: `#/survey/${step.id}` }, 'Answer the questionnaire') : h('span', { class: 'pill ok' }, 'All done. Thank you.');
  page(h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('div', { class: 'spread' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Your cases'), h('h1', { style: { margin: '2px 0 0' } }, `${done} of ${total} submitted`)), cta),
    h('div', { class: 'progress' }, h('div', { style: { width: `${(100 * done) / total}%` } })),
    h('p', { class: 'muted small', style: { margin: 0 } }, 'Cases open in a fixed order. Your work is saved as you go, so you can stop and come back at any time.')), list));
}

// ---------- case
async function caseView(id) {
  const step = await nextStep();
  const item = SLOT.items[id];
  if (!item) { location.hash = '#/queue'; return; }
  const existing = step.resp[id];
  const readOnly = !!existing?.submittedAt;
  if (!readOnly && !(step.kind === 'case' && step.id === id)) { location.hash = '#/queue'; return; }
  const [c, draft] = await Promise.all([S.caseData(id), item.condition === 'assisted' ? S.draft(id) : Promise.resolve(null)]);
  if (!c) { page(h('div', { class: 'card' }, h('h1', {}, 'This case is not available'), h('p', {}, 'Return to your cases and try again.'))); return; }
  c.id = id;
  let state = existing;
  const save = (patch) => tracked(() => S.saveResponse(id, patch))();
  if (!state) {
    state = { ...initialResponse(item.condition, draft), block: item.block, pos: item.pos, practice: !!item.practice, openedAt: Date.now(), activeMs: 0 };
    await S.saveResponse(id, state);
  }
  state.orders = state.orders || {}; state.stops = state.stops || {}; state.answers = state.answers || {};
  // active time: counted while the tab is visible and the reader has used the mouse or keyboard in the last minute
  let lastInput = Date.now(); let active = state.activeMs || 0; let unsaved = 0;
  const bump = () => { lastInput = Date.now(); };
  ['mousemove', 'keydown', 'wheel', 'pointerdown', 'scroll'].forEach((e) => window.addEventListener(e, bump, { passive: true, capture: true }));
  const timer = readOnly ? null : setInterval(() => {
    if (document.visibilityState === 'visible' && Date.now() - lastInput < 60000) { active += 5000; unsaved += 5000; }
    if (unsaved >= 15000) { unsaved = 0; S.saveResponse(id, { activeMs: active }).catch(() => {}); }
  }, 5000);
  const cleanup = () => { if (timer) clearInterval(timer); ['mousemove', 'keydown', 'wheel', 'pointerdown', 'scroll'].forEach((e) => window.removeEventListener(e, bump, { capture: true })); };
  window.addEventListener('hashchange', cleanup, { once: true });

  const work = renderWork({ c, draft: item.condition === 'assisted' ? draft : null, state, save, readOnly,
    onStopsChange: () => refreshChart(),
    onSubmit: async () => {
      cleanup();
      await S.submitResponse(id, { activeMs: active, answers: state.answers, note: state.note || '' });
      toast('Case submitted.');
      location.hash = '#/queue';
    } });
  const viewed = new Set();
  let tab = 'summary';
  const onView = (k) => {
    if (k.startsWith('tab:')) tab = k.slice(4);
    if (!readOnly && !viewed.has(k)) { viewed.add(k); save({ [`views/${k.replace(/[.#$\[\]/:]/g, '_')}`]: Date.now() }); }
  };
  const onStop = readOnly ? null : async (med) => {
    const reason = h('textarea', { style: { minHeight: '60px' }, placeholder: 'Reason for stopping' });
    const body = h('div', {}, h('p', {}, h('strong', {}, med.text)), h('label', {}, 'Reason'), reason);
    if (!(await confirmBox('Stop this medication?', body, 'Sign stop'))) return;
    work.addStop(med, reason.value.trim());
  };
  function refreshChart() { const fresh = renderChart(c, { stopped: work.stoppedIds(), onStop, onView, tab }); chartEl.replaceWith(fresh.el); chartEl = fresh.el; }
  let chartEl = renderChart(c, { stopped: work.stoppedIds(), onStop, onView }).el;
  const left = h('section', {}, renderTask(c), h('div', { style: { marginTop: '14px' } }, chartEl));
  const pos = orderedItems().findIndex((i) => i.id === id) + 1;
  const tag = item.condition === 'assisted' ? h('span', { class: 'pill ai' }, "With the AI agent's draft") : h('span', { class: 'pill accent' }, 'On your own');
  app.replaceChildren(h('div', { class: 'case-shell' }, topbar([h('a', { class: 'btn small ghost', href: '#/queue' }, '← My cases'), h('span', { class: 'muted small' }, `${item.practice ? 'Practice case' : 'Case'} ${item.practice ? pos : pos - 2}`), tag]),
    h('div', { class: 'work' }, left, h('section', {}, work.el))));
}

// ---------- surveys
const TLX = [['mental', 'Mental demand', 'How mentally demanding were the tasks?', 'Very low', 'Very high'],
  ['physical', 'Physical demand', 'How physically demanding were the tasks?', 'Very low', 'Very high'],
  ['temporal', 'Temporal demand', 'How hurried or rushed was the pace?', 'Very low', 'Very high'],
  ['performance', 'Performance', 'How successful were you in accomplishing what you were asked to do?', 'Perfect', 'Failure'],
  ['effort', 'Effort', 'How hard did you have to work to accomplish your level of performance?', 'Very low', 'Very high'],
  ['frustration', 'Frustration', 'How insecure, discouraged, irritated, stressed and annoyed were you?', 'Very low', 'Very high']];
const TRUST = [['rely', "I could rely on the agent's drafts."], ['checked', "I checked each of the agent's drafts against the chart."], ['time', "The agent's drafts saved me time."],
  ['misled', "The agent's message made me less careful."]];

async function surveyView(id) {
  const step = await nextStep();
  const existing = step.surveys[id];
  if (!existing?.submittedAt && !(step.kind === 'survey' && step.id === id)) { location.hash = '#/queue'; return; }
  const ro = !!existing?.submittedAt;
  const block = id.startsWith('block') ? Number(id.slice(5)) : null;
  const cond = block ? orderedItems().find((i) => i.block === block)?.condition : null;
  const d = { ...(existing || {}) };
  const save = debounce(tracked(() => S.saveSurvey(id, d, false)), 400);
  const parts = [];
  if (block) {
    parts.push(h('p', { class: 'muted' }, `About the block you just finished (${cond === 'assisted' ? "reviewing the AI agent's drafts" : 'working alone'}). Move each slider to your answer.`));
    const tlx = h('div', { class: 'tlx' });
    for (const [k, name, q, lo, hi] of TLX) {
      const out = h('span', { class: 'mono small muted' }, d[k] ?? '–');
      const range = h('input', { type: 'range', min: '0', max: '100', step: '5', value: d[k] ?? 50, disabled: ro, 'aria-label': name });
      range.addEventListener('input', () => { d[k] = Number(range.value); out.textContent = range.value; save(); });
      tlx.append(h('div', { class: 'scale' }, h('div', { class: 'spread' }, h('strong', {}, name), out), h('div', { class: 'small muted' }, q), range, h('div', { class: 'ends' }, h('span', {}, lo), h('span', {}, hi))));
    }
    parts.push(tlx);
    if (cond === 'assisted') {
      parts.push(h('h2', { style: { marginTop: '18px' } }, 'The AI agent'));
      for (const [k, q] of TRUST) parts.push(h('div', { class: 'q' }, h('div', { class: 'label' }, q),
        radios(`${id}-${k}`, [[1, 'Strongly disagree'], [2, 'Disagree'], [3, 'Neutral'], [4, 'Agree'], [5, 'Strongly agree']], d[k], (v) => { d[k] = Number(v); save(); })));
    }
  } else {
    parts.push(h('div', { class: 'q' }, h('div', { class: 'label' }, 'Which way of working did you prefer?'),
      radios('pref', [['alone', 'On my own'], ['assisted', "Reviewing the agent's drafts"], ['none', 'No preference']], d.preference, (v) => { d.preference = v; save(); })),
    h('div', { class: 'q' }, h('div', { class: 'label' }, 'Would you use an agent like this in your own practice, if you reviewed and signed its work?'),
      radios('use', [[1, 'Definitely not'], [2, 'Probably not'], [3, 'Unsure'], [4, 'Probably yes'], [5, 'Definitely yes']], d.wouldUse, (v) => { d.wouldUse = Number(v); save(); })));
  }
  const com = h('textarea', { readonly: ro, placeholder: 'Anything else you would like to tell us (optional)', style: { minHeight: '80px' } }, d.comments || '');
  com.addEventListener('input', () => { d.comments = com.value; save(); });
  parts.push(h('label', {}, 'Comments ', h('span', { class: 'opt' }, '(optional)')), com);
  const need = () => (block ? TLX.map((t) => t[0]).concat(cond === 'assisted' ? TRUST.map((t) => t[0]) : []) : ['preference', 'wouldUse']).filter((k) => d[k] === undefined || d[k] === null);
  if (!ro) parts.push(h('div', { class: 'row', style: { marginTop: '16px' } }, h('button', { class: 'primary', onclick: tracked(async () => {
    const miss = need(); if (miss.length) { toast(`Answer every question first (${miss.length} left).`, 'bad'); return; }
    await S.saveSurvey(id, d, true); toast('Saved.'); location.hash = '#/queue';
  }) }, 'Submit')));
  else parts.push(h('div', { class: 'lock', style: { marginTop: '16px' } }, 'Submitted.'));
  page(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, block ? `Block ${block}` : 'Finish'), h('h1', {}, block ? 'Questionnaire on this block' : 'Final questions'), ...parts));
}

// ---------- study team
async function adminView() {
  if (!ME.admin) { location.hash = '#/'; return; }
  const d = await S.adminData();
  const slotIds = Object.keys(d.slots).sort();
  const used = new Set(Object.values(d.invites).map((i) => i.slot));
  const emails = Object.fromEntries(Object.values(d.invites).filter((i) => i.claimedBy).map((i) => [i.claimedBy, i.email]));
  const rows = Object.entries(d.invites).sort((a, b) => (a[1].slot || '').localeCompare(b[1].slot || '')).map(([k, inv]) => {
    const resp = inv.claimedBy ? d.responses[inv.claimedBy] || {} : {};
    const total = Object.keys(d.slots[inv.slot]?.items || {}).length;
    const sub = Object.values(resp).filter((r) => r.submittedAt).length;
    const last = Math.max(0, ...Object.values(resp).map((r) => r.updatedAt || 0));
    const prof = inv.claimedBy ? d.profiles[inv.claimedBy] : null;
    return h('tr', {}, h('td', {}, inv.email), h('td', { class: 'num' }, inv.slot), h('td', { class: 'small' }, d.slots[inv.slot]?.sequence || ''),
      h('td', {}, inv.claimedBy ? h('span', { class: 'pill ok' }, 'signed in') : h('span', { class: 'pill' }, 'invited')),
      h('td', { class: 'small' }, prof?.background?.specialty || ''), h('td', { class: 'num' }, `${sub} / ${total}`), h('td', { class: 'num small' }, last ? fmtTime(last) : ''),
      h('td', {}, inv.claimedBy ? '' : h('button', { class: 'small danger', onclick: async () => { if (await confirmBox('Remove this invitation?', inv.email, 'Remove', true)) { await S.removeInvite(inv.email); adminView(); } } }, 'Remove')));
  });
  const email = h('input', { type: 'email', placeholder: 'physician@hospital.org' });
  const slotSel = h('select', {}, slotIds.map((s) => h('option', { value: s, disabled: used.has(s) }, `${s} · ${d.slots[s].sequence}${used.has(s) ? ' (taken)' : ''}`)));
  const free = slotIds.find((s) => !used.has(s)); if (free) slotSel.value = free;
  const add = h('button', { class: 'primary', onclick: async () => {
    const e = email.value.trim().toLowerCase();
    if (!EMAIL_RE.test(e)) { toast('Enter a valid email address.', 'bad'); return; }
    if (d.invites[emailKey(e)]) { toast('This address is already invited.', 'bad'); return; }
    try { await S.invite(e, slotSel.value); toast(`Invited ${e} into ${slotSel.value}.`); adminView(); } catch (err) { toast(err.message, 'bad'); }
  } }, 'Invite');
  const exp = h('button', { onclick: async () => {
    const data = await S.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `hcua-supervision-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.json` });
    document.body.append(a); a.click(); a.remove();
  } }, 'Download all responses (JSON)');
  const nResp = Object.values(d.responses).reduce((n, r) => n + Object.values(r).filter((x) => x.submittedAt && !x.practice).length, 0);
  page(h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('div', { class: 'spread' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Study team'), h('h1', { style: { margin: 0 } }, 'Participants')), exp),
    h('dl', { class: 'kv' }, h('dt', {}, 'Invitations'), h('dd', {}, String(Object.keys(d.invites).length)), h('dt', {}, 'Signed in'), h('dd', {}, String(Object.keys(emails).length)),
      h('dt', {}, 'Study cases submitted'), h('dd', {}, String(nResp)), h('dt', {}, 'Reader slots free'), h('dd', {}, String(slotIds.length - used.size)))),
  h('div', { class: 'card stack' }, h('h2', {}, 'Invite a physician'), h('p', { class: 'muted small', style: { margin: 0 } }, 'The invitation is claimed the first time that Google account signs in. Each slot fixes which half of the cases is seen with the agent\'s draft and which block comes first. Fill slots in order to keep the four sequences balanced.'),
    h('div', { class: 'grid2' }, h('div', {}, h('label', {}, 'Email address'), email), h('div', {}, h('label', {}, 'Reader slot'), slotSel)), h('div', { class: 'row' }, add)),
  h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['Email', 'Slot', 'Sequence', 'Status', 'Specialty', 'Cases', 'Last activity', ''].map((x) => h('th', {}, x)))),
    h('tbody', {}, rows.length ? rows : h('tr', {}, h('td', { colspan: 8, class: 'muted' }, 'No invitations yet.')))))), true);
}

function doneView() {
  page(h('div', { class: 'card stack', style: { maxWidth: '560px' } }, h('h1', {}, 'Thank you'), h('p', {}, 'You have finished every case and questionnaire. Your answers are saved.'),
    h('p', { class: 'muted' }, 'You can close this page. To see your submitted cases again, open My cases.'), h('div', { class: 'row' }, h('a', { class: 'btn', href: '#/queue' }, 'My cases'))));
}

// ---------- routing
async function route() {
  try {
    if (!ME.user) return signinView();
    if (location.hash === '#/admin') return adminView();
    if (!ME.invite || (ME.invite.claimedBy && ME.invite.claimedBy !== ME.user.uid)) {
      if (ME.admin) return adminView();
      return notInvitedView();
    }
    if (!SLOT) SLOT = await S.slot(ME.invite.slot);
    if (!SLOT) { page(h('div', { class: 'card' }, h('h1', {}, 'Your case list is not ready'), h('p', {}, 'Please contact the study team.'))); return; }
    const profile = await S.profile();
    if (!profile?.consent?.agreed) return consentView(profile);
    if (!profile.backgroundDone) return profileView(profile);
    if (!profile.howRead) return howView();
    const [, kind, arg] = location.hash.split('/');
    if (kind === 'case' && arg) return caseView(arg);
    if (kind === 'survey' && arg) return surveyView(arg);
    const step = await nextStep();
    if (step.kind === 'done' && !kind) return doneView();
    return queueView();
  } catch (e) {
    console.error(e);
    page(h('div', { class: 'card stack' }, h('h1', {}, 'Something went wrong'), h('p', { class: 'problems' }, e.message), h('div', { class: 'row' }, h('button', { onclick: () => location.reload() }, 'Reload'))));
  }
}

async function boot() {
  S = await createStore();
  S.onConnection((c) => { online = c; savedListeners.forEach((l) => l('saved')); });
  S.onAuth(async (u) => {
    ME = { user: u, admin: false, invite: null }; SLOT = null;
    if (u) {
      const me = await S.me();
      ME.admin = me.admin; ME.invite = me.invite;
      if (ME.invite && !ME.invite.claimedBy && u.emailVerified) {
        try { await S.claim(); ME.invite = (await S.me()).invite; } catch (e) { console.error(e); }
      }
      try { CONFIG = (await S.config()) || {}; } catch { CONFIG = {}; }
    }
    route();
  });
  window.addEventListener('hashchange', () => route());
}
boot();
