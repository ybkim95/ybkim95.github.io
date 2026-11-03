// Study A': physicians review confirmation-set tasks (the chart, the answer key, the forbidden orders and the grading rules) on seven
// items scored 0 to 3, answer each task's open questions and the booked visit questions, and decide accept, revise or reject.
import { createStore } from './review-store.js?v=d02cf1d4d6';
import { h, md, toast, confirmBox, debounce, radios, fmtTime, emailKey, EMAIL_RE, GOOGLE_ICON } from './ui.js?v=d02cf1d4d6';
import { renderChart, renderTask } from './chart.js?v=d02cf1d4d6';

const app = document.getElementById('app');
let S; let ME = { user: null, admin: false, invite: null }; let SLOT = null;

// the rating columns of the task review sheet (main repository, scripts/rigor_v2/task_review_c1_packet.py)
const ITEMS = [
  ['chart_coherent_0to3', 'Is the chart clinically coherent?'],
  ['gold_standard_of_care_0to3', 'Is the answer key the standard of care for this chart?'],
  ['alternatives_complete_0to3', 'Are the accepted alternatives complete and correct?'],
  ['forbidden_orders_correct_0to3', 'Are the forbidden orders truly wrong for this patient?'],
  ['answer_leak_0to3', 'Do the instruction or the chart give the answer away?'],
  ['instruction_ambiguity_0to3', 'Is the instruction ambiguous?'],
  ['grader_checks_match_gold_0to3', 'Do the required checks express the answer key?'],
];
const SCALE = [[0, '0 No problem'], [1, '1 Minor'], [2, '2 Major'], [3, '3 Task invalid']];
const DECISION = [['accept', 'Accept'], ['revise', 'Revise'], ['reject', 'Reject']];
const VISIT = [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Unsure']];
const list = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
const needed = (d, rv) => [
  ...ITEMS.map(([k]) => k).filter((k) => d[k] === undefined || d[k] === null),
  ...list(rv.questions).map((_, i) => `q${i}`).filter((q) => !String((d.open_question_answers || {})[q] || '').trim()),
  ...list(rv.visitQuestions).map((v) => v.check).filter((c) => !(d.booked_visit_ok || {})[c]),
  ...(d.decision ? [] : ['decision']), ...(d.decision && d.decision !== 'accept' && !String(d.notes || '').trim() ? ['notes'] : [])];

function topbar() {
  return h('div', {}, S.mode === 'demo' ? h('div', { class: 'demo-banner' }, 'Demo: one invented task, stored only in this browser. Nothing here is part of the study.') : null,
    h('header', { class: 'topbar' }, h('a', { class: 'brand', href: '#/', style: { color: 'inherit', textDecoration: 'none' } }, h('span', { class: 'mark' }), 'Health-CUA task review'),
      h('span', { class: 'grow' }), ME.admin ? h('a', { class: 'btn small', href: '#/admin' }, 'Study team') : null,
      ME.user && S.mode !== 'demo' ? h('button', { class: 'ghost small', onclick: async () => { await S.signOut(); location.hash = '#/'; } }, 'Sign out') : null));
}
function page(children, wide = false) { app.replaceChildren(topbar(), h('main', { class: `page${wide ? ' wide' : ''}` }, children)); }

function signinView(msg) {
  app.replaceChildren(h('main', { class: 'page' }, h('div', { class: 'card signin stack' },
    h('div', { class: 'brand' }, h('span', { class: 'mark' }), 'Health-CUA task review'),
    h('h1', {}, 'Physician review of synthetic clinical tasks'),
    h('p', { class: 'muted' }, 'You will check simulated patient charts, the answer key an AI agent is graded against and the orders that would be wrong for the patient. All patients are synthetic.'),
    msg ? h('p', { class: 'problems' }, msg) : null,
    h('div', {}, h('button', { class: 'google', onclick: async () => { try { await S.signIn(); } catch (e) { if (e.code !== 'auth/popup-closed-by-user') signinView(`Sign-in failed: ${e.message}`); } }, html: `${GOOGLE_ICON}<span>Sign in with Google</span>` })),
    h('p', { class: 'small muted' }, 'Use the Google account at the address where you received your invitation.'))));
}

function notInvitedView() {
  page(h('div', { class: 'card stack', style: { maxWidth: '560px' } }, h('h1', {}, 'This account is not on the study list'),
    h('p', {}, 'You are signed in as ', h('strong', {}, ME.user.email), '. The study team invites each reviewer by email address.'),
    h('p', { class: 'muted' }, 'If you were invited at another address, sign out and sign in with that account. Otherwise, ask the study team to add this address.')));
}

function instructionsView() {
  const text = `Each task shows, on the left, the **instruction** an AI agent receives and the patient's **chart**. On the right you see the **answer key**: the orders the task requires with every accepted alternative, dose range and date window, the reasonable extra orders, the orders that would be wrong for this patient, and the open clinical questions of the task's author.

Score seven items from 0 (no problem) to 3 (the task is invalid), answer each open question, say for every check with a date window whether a booked visit in that window would be acceptable, and decide whether to **accept**, **revise** (say what to change) or **reject** the task. A task with any item scored 2 or higher will be revised or removed.

Twin tasks share a patient and differ in one decisive fact; they come one after the other, and each shows the other's answer key. Tasks open in a fixed order. Your work is saved as you go. Submitting a task locks it.`;
  page(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Before you start'), h('h1', {}, 'How a task review works'), h('div', { class: 'md', html: md(text) }),
    h('div', { class: 'row' }, h('button', { class: 'primary', onclick: async () => { await S.saveProfile({ instructionsRead: true, slot: ME.invite.slot }); location.hash = '#/'; route(); } }, 'Start'))));
}

const ordered = () => Object.entries(SLOT.tasks || {}).map(([id, v]) => ({ id, ...v })).sort((a, b) => a.pos - b.pos);
async function next() {
  const ratings = await S.ratings();
  return { ratings, id: ordered().find((t) => !ratings[t.id]?.submittedAt)?.id || null };
}

async function queueView() {
  const { ratings, id } = await next();
  const tasks = ordered(); const done = tasks.filter((t) => ratings[t.id]?.submittedAt).length;
  const rows = tasks.map((t, n) => {
    const r = ratings[t.id]; const cur = t.id === id;
    const state = r?.submittedAt ? h('a', { class: 'btn small ghost', href: `#/task/${t.id}` }, 'View') : cur ? h('a', { class: 'btn primary small', href: `#/task/${t.id}` }, r ? 'Continue' : 'Start') : h('span', { class: 'pill' }, 'Locked');
    return h('div', { class: `qitem${cur ? ' current' : ''}` }, h('span', { class: 'n' }, String(n + 1).padStart(2, '0')),
      h('div', {}, h('div', { style: { fontWeight: 600 } }, `Task ${n + 1} of ${tasks.length}`), h('div', { class: 'small muted mono' }, t.id)), state);
  });
  page(h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('div', { class: 'spread' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Your tasks'), h('h1', { style: { margin: '2px 0 0' } }, `${done} of ${tasks.length} submitted`)),
    id ? h('a', { class: 'btn primary', href: `#/task/${id}` }, 'Continue with the next task') : h('span', { class: 'pill ok' }, 'All done. Thank you.')),
  h('div', { class: 'progress' }, h('div', { style: { width: `${(100 * done) / Math.max(tasks.length, 1)}%` } }))), h('div', { class: 'queue' }, rows)));
}

function key(rv) {
  const bullets = (xs) => h('ul', { class: 'plain' }, xs.map((x) => h('li', {}, x)));
  return [h('h3', {}, 'Required orders'), h('ul', { class: 'plain' }, list(rv.required).map((q) => h('li', {}, h('strong', {}, q.id), ` (${q.kind === 'MedicationRequest' ? 'medication' : 'test, referral or visit'}): `,
    list(q.alternatives).join('; '), q.window_days ? `; within days ${q.window_days[0]} to ${q.window_days[1]} of the task date` : '', h('div', { class: 'small muted' }, q.rationale)))),
  h('h3', {}, 'Reasonable extra orders (accepted, up to six)'), list(rv.acceptable).length ? bullets(list(rv.acceptable)) : h('div', { class: 'empty' }, 'None listed.'),
  h('h3', {}, 'Forbidden orders'), list(rv.forbidden).length ? h('ul', { class: 'plain' }, list(rv.forbidden).map((f) => h('li', {}, h('strong', {}, f.id), `: ${f.orders}. `, h('span', { class: 'small muted' }, f.reason)))) : h('div', { class: 'empty' }, 'None.')];
}

function form(d, rv, save, readOnly) {
  const box = h('fieldset', { disabled: readOnly, style: { border: 0, padding: 0, margin: 0, minWidth: 0 } });
  const textSave = debounce(save, 400);
  const area = (value, hint, onInput) => { const t = h('textarea', { readonly: readOnly, placeholder: hint, style: { minHeight: '56px' } }, value || ''); t.addEventListener('input', () => onInput(t.value)); return t; };
  const draw = () => {
    const parts = ITEMS.map(([k, q]) => h('div', { class: 'q' }, h('div', { class: 'label' }, q), radios(`${k}`, SCALE, d[k], (v) => { d[k] = Number(v); save({ [k]: d[k] }); draw(); })));
    list(rv.questions).forEach((q, i) => parts.push(h('label', {}, `Open question ${i + 1}: ${q}`), area((d.open_question_answers || {})[`q${i}`], 'Your answer', (v) => {
      d.open_question_answers = { ...(d.open_question_answers || {}), [`q${i}`]: v }; textSave({ [`open_question_answers/q${i}`]: v });
    })));
    list(rv.visitQuestions).forEach((v) => parts.push(h('div', { class: 'q' }, h('div', { class: 'label' }, `${v.check}: is a booked visit within days ${v.days[0]} to ${v.days[1]} an acceptable way to meet this check?`),
      radios(`visit-${v.check}`, VISIT, (d.booked_visit_ok || {})[v.check], (x) => { d.booked_visit_ok = { ...(d.booked_visit_ok || {}), [v.check]: x }; save({ [`booked_visit_ok/${v.check}`]: x }); draw(); }))));
    parts.push(h('div', { class: 'q' }, h('div', { class: 'label' }, 'Decision'), radios('decision', DECISION, d.decision, (v) => { d.decision = v; save({ decision: v }); draw(); })),
      h('label', {}, d.decision && d.decision !== 'accept' ? 'What to change, or why the task should go' : 'Notes ', h('span', { class: 'opt' }, d.decision && d.decision !== 'accept' ? '' : '(optional)')),
      area(d.notes, 'For example: accept losartan 25 mg as a starting dose.', (v) => { d.notes = v; textSave({ notes: v }); }));
    box.replaceChildren(...parts);
  };
  draw();
  return box;
}

async function taskView(id) {
  const { ratings, id: cur } = await next();
  const existing = ratings[id]; const readOnly = !!existing?.submittedAt;
  if (!SLOT.tasks?.[id] || (!readOnly && id !== cur)) { location.hash = '#/'; return; }
  const t = await S.task(id);
  if (!t) { page(h('div', { class: 'card' }, h('h1', {}, 'This task is not available'))); return; }
  const rv = t.review;
  const twin = rv.twinOf && SLOT.tasks[rv.twinOf] ? await S.task(rv.twinOf) : null;
  const d = existing || { openedAt: Date.now(), activeMs: 0 };
  const save = (patch) => S.saveRating(id, patch).catch((e) => toast(`Not saved: ${e.message}`, 'bad'));
  if (!existing) await S.saveRating(id, d);
  const started = Date.now();
  const right = h('div', {}, h('div', { class: 'panel-h' }, h('h2', {}, 'Answer key'), h('span', { class: 'muted small' }, `${rv.tier} tier`)), ...key(rv),
    twin ? h('details', { class: 'note' }, h('summary', {}, h('span', { class: 't' }, `The twin task's answer key (${rv.twinOf})`)), h('div', { style: { padding: '0 14px 12px' } }, ...key(twin.review))) : null,
    h('div', { class: 'panel-h' }, h('h2', {}, 'Your review')));
  const f = form(d, rv, save, readOnly); right.append(f);
  if (readOnly) right.append(h('div', { class: 'lock', style: { marginTop: '16px' } }, 'Submitted. This review can no longer be changed.'));
  else {
    const status = h('div', {}); const submit = h('button', { class: 'primary' }, 'Submit review');
    const refresh = () => { const miss = needed(d, rv); submit.disabled = miss.length > 0; status.className = miss.length ? 'problems' : 'ready'; status.textContent = miss.length ? `Before submitting: ${miss.length} more answer${miss.length > 1 ? 's' : ''}.` : 'Ready to submit.'; };
    submit.onclick = async () => {
      if (!(await confirmBox('Submit this review?', 'You cannot change it after submitting.', 'Submit'))) return;
      await S.submitRating(id, { activeMs: (d.activeMs || 0) + Date.now() - started }); toast('Review submitted.'); location.hash = '#/';
    };
    f.addEventListener('change', refresh); f.addEventListener('input', refresh); refresh();
    right.append(h('div', { class: 'footer-bar' }, status, submit));
  }
  const left = h('section', {}, renderTask(t.case), h('div', { style: { marginTop: '14px' } }, renderChart(t.case, {}).el));
  app.replaceChildren(h('div', { class: 'case-shell' }, topbar(), h('div', { class: 'work' }, left, h('section', {}, right))));
}

async function adminView() {
  if (!ME.admin) { location.hash = '#/'; return; }
  const d = await S.adminData();
  const slotIds = Object.keys(d.slots).sort(); const used = new Set(Object.values(d.invites).map((i) => i.slot));
  const rows = Object.values(d.invites).sort((a, b) => (a.slot || '').localeCompare(b.slot || '')).map((inv) => {
    const sub = Object.values(d.ratings[inv.claimedBy] || {}).filter((x) => x.submittedAt);
    return h('tr', {}, h('td', {}, inv.email), h('td', { class: 'num' }, inv.slot), h('td', {}, inv.claimedBy ? h('span', { class: 'pill ok' }, 'signed in') : h('span', { class: 'pill' }, 'invited')),
      h('td', { class: 'num' }, `${sub.length} / ${Object.keys(d.slots[inv.slot]?.tasks || {}).length}`), h('td', { class: 'num small' }, sub.length ? fmtTime(Math.max(...sub.map((r) => r.updatedAt || 0))) : ''),
      h('td', {}, inv.claimedBy ? '' : h('button', { class: 'small danger', onclick: async () => { if (await confirmBox('Remove this invitation?', inv.email, 'Remove', true)) { await S.removeInvite(inv.email); adminView(); } } }, 'Remove')));
  });
  const email = h('input', { type: 'email', placeholder: 'physician@hospital.org' });
  const slotSel = h('select', {}, slotIds.map((s) => h('option', { value: s, disabled: used.has(s) }, `${s}${used.has(s) ? ' (taken)' : ''}`)));
  const free = slotIds.find((s) => !used.has(s)); if (free) slotSel.value = free;
  const add = h('button', { class: 'primary', onclick: async () => {
    const e = email.value.trim().toLowerCase();
    if (!EMAIL_RE.test(e) || d.invites[emailKey(e)]) { toast('Enter a valid address that is not invited yet.', 'bad'); return; }
    try { await S.invite(e, slotSel.value); toast(`Invited ${e} into ${slotSel.value}.`); adminView(); } catch (err) { toast(err.message, 'bad'); }
  } }, 'Invite');
  const exp = h('button', { onclick: async () => {
    const blob = new Blob([JSON.stringify(await S.exportAll(), null, 1)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `hcua-task-review-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.json` });
    document.body.append(a); a.click(); a.remove();
  } }, 'Download all reviews (JSON)');
  page(h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('div', { class: 'spread' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Study team'), h('h1', { style: { margin: 0 } }, 'Task reviewers')), exp)),
    h('div', { class: 'card stack' }, h('h2', {}, 'Invite a reviewer'), h('div', { class: 'grid2' }, h('div', {}, h('label', {}, 'Email address'), email), h('div', {}, h('label', {}, 'Slot'), slotSel)), h('div', { class: 'row' }, add)),
    h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['Email', 'Slot', 'Status', 'Progress', 'Last activity', ''].map((x) => h('th', {}, x)))),
      h('tbody', {}, rows.length ? rows : h('tr', {}, h('td', { colspan: 6, class: 'muted' }, 'No invitations yet.')))))), true);
}

async function route() {
  try {
    if (!ME.user) return signinView();
    if (location.hash === '#/admin') return adminView();
    if (!ME.invite || (ME.invite.claimedBy && ME.invite.claimedBy !== ME.user.uid)) return ME.admin ? adminView() : notInvitedView();
    if (!SLOT) SLOT = await S.slot(ME.invite.slot);
    if (!SLOT) { page(h('div', { class: 'card' }, h('h1', {}, 'Your task list is not ready'), h('p', {}, 'Please contact the study team.'))); return; }
    if (!(await S.profile())?.instructionsRead) return instructionsView();
    const [, kind, arg] = location.hash.split('/');
    if (kind === 'task' && arg) return taskView(arg);
    return queueView();
  } catch (e) {
    console.error(e);
    page(h('div', { class: 'card stack' }, h('h1', {}, 'Something went wrong'), h('p', { class: 'problems' }, e.message), h('div', { class: 'row' }, h('button', { onclick: () => location.reload() }, 'Reload'))));
  }
}

async function boot() {
  S = await createStore();
  S.onAuth(async (u) => {
    ME = { user: u, admin: false, invite: null }; SLOT = null;
    if (u) {
      const me = await S.me(); ME.admin = me.admin; ME.invite = me.invite;
      if (ME.invite && !ME.invite.claimedBy && u.emailVerified) { try { await S.claim(); ME.invite = (await S.me()).invite; } catch (e) { console.error(e); } }
    }
    route();
  });
  window.addEventListener('hashchange', () => route());
}
boot();
