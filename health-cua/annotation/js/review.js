// Study A' version A3: physicians review confirmation-set tasks. Each required order of the answer key is judged where it is shown
// (correct as written, or needs a change), with the task author's questions about it as prompts under the row; one question covers the
// orders counted as wrong for the patient, one the booked visits when the task has a dated order, one the chart and instruction (with
// the author's questions about them), then accept, revise or reject.
import { createStore } from './review-store.js?v=7b633b620f';
import { h, md, toast, confirmBox, debounce, radios, fmtTime, emailKey, EMAIL_RE, GOOGLE_ICON } from './ui.js?v=7b633b620f';
import { renderChart, renderTask } from './chart.js?v=7b633b620f';

const app = document.getElementById('app');
let S; let ME = { user: null, admin: false, invite: null }; let SLOT = null;

const REQ = [['ok', 'Correct as written'], ['change', 'Needs a change']];
const WRONG = [['no', 'No'], ['yes', 'Yes']];
const YNU = [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Unsure']];
const CHART = [['ok', 'No problem'], ['problem', 'Problem']];
const DECISION = [['accept', 'Accept'], ['revise', 'Revise'], ['reject', 'Reject']];
const list = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
const blank = (x) => !String(x ?? '').trim();
// keys r0, r1 rather than 0, 1: the database would turn numeric keys into arrays
const needed = (d, rv) => [
  ...list(rv.required).flatMap((q, i) => [(d.req || {})[`r${i}`] ? null : `r${i}`, (d.req || {})[`r${i}`] === 'change' && blank((d.req_note || {})[`r${i}`]) ? `rn${i}` : null]),
  list(rv.wrong?.orders).length && !d.wrong_any ? 'wrong_any' : null, d.wrong_any === 'yes' && blank(d.wrong_note) ? 'wrong_note' : null,
  rv.visit && !d.visit ? 'visit' : null,
  d.chart ? null : 'chart', d.chart === 'problem' && blank(d.chart_note) ? 'chart_note' : null,
  d.decision ? null : 'decision', d.decision && d.decision !== 'accept' && blank(d.notes) ? 'notes' : null].filter(Boolean);

function topbar() {
  return h('div', {}, S.mode === 'demo' ? h('div', { class: 'demo-banner' }, 'Demo: one invented task, stored only in this browser. Nothing here is part of the study.') : null,
    h('header', { class: 'topbar' }, h('a', { class: 'brand', href: '#/', style: { color: 'inherit', textDecoration: 'none' } }, h('img', { class: 'mark', src: 'img/logo-64.png', alt: '' }), 'Health-CUA task review'),
      h('span', { class: 'grow' }), ME.admin ? h('a', { class: 'btn small', href: '#/admin' }, 'Study team') : null,
      ME.user && S.mode !== 'demo' ? h('button', { class: 'ghost small', onclick: async () => { await S.signOut(); location.hash = '#/'; } }, 'Sign out') : null));
}
function page(children, wide = false) { app.replaceChildren(topbar(), h('main', { class: `page${wide ? ' wide' : ''}` }, children)); }

function signinView(msg) {
  app.replaceChildren(h('main', { class: 'page' }, h('div', { class: 'card signin stack' },
    h('div', { class: 'brand' }, h('img', { class: 'mark', src: 'img/logo-64.png', alt: '' }), 'Health-CUA task review'),
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
  const text = `On the left: the inbox item, the instruction an AI agent receives and the patient's chart. On the right: the **answer key** the agent is graded against, with one question beside each part.

- **Required orders.** Is each one correct as written, including the accepted alternatives, doses and dates? If not, say what to change. Where the task's author had a question about an order, it is shown under that order; your answer to the order answers it.
- **Wrong for this patient.** Ordering one of these fails the task. Is any of them not wrong for this patient?
- **Booked visits**, **chart and instruction**, then **accept**, **revise** (say what to change) or **reject**.

Paired tasks share a patient and differ in one fact; they come one after the other. Your answers are saved as you go. Submitting a task locks it.`;
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
    return h('div', { class: `qitem nonum${cur ? ' current' : ''}` }, h('div', { style: { fontWeight: 600 } }, `Task ${n + 1}`), state);
  });
  page(h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('div', { class: 'spread' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Your tasks'), h('h1', { style: { margin: '2px 0 0' } }, `${done} of ${tasks.length} submitted`)),
    id ? h('a', { class: 'btn primary', href: `#/task/${id}` }, 'Continue with the next task') : h('span', { class: 'pill ok' }, 'All done. Thank you.')),
  h('div', { class: 'progress' }, h('div', { style: { width: `${(100 * done) / Math.max(tasks.length, 1)}%` } }))), h('div', { class: 'queue' }, rows)));
}

const more = (xs, n) => (xs.length <= n ? xs.join(', ') : h('span', {}, xs.slice(0, n).join(', '), ' ', h('details', { class: 'inline' }, h('summary', {}, `and ${xs.length - n} more`), xs.slice(n).join(', '))));
const why = (t) => (t ? h('details', { class: 'why' }, h('summary', {}, 'Why'), h('div', { class: 'small' }, t)) : null);
const asks = (ps) => list(ps).map((p) => h('div', { class: 'asks small' }, h('span', { class: 'asks-label' }, 'Author asks: '), p.text,
  p.full && p.full !== p.text ? [' ', h('details', { class: 'inline' }, h('summary', {}, 'context'), ' ', p.full)] : null));

// the answer key with one judgment beside each part; readOnly shows the answers only
function review(d, rv, save, readOnly) {
  const box = h('fieldset', { disabled: readOnly, class: 'review-form' });
  const textSave = debounce(save, 400);
  const area = (value, hint, onInput) => { const t = h('textarea', { readonly: readOnly, placeholder: hint, rows: 2 }, value || ''); t.addEventListener('input', () => onInput(t.value)); return t; };
  const draw = () => {
    const parts = [h('h3', {}, 'Required orders')];
    if (!list(rv.required).length) parts.push(h('div', { class: 'muted small' }, 'None: the right answer is to place no order.'));
    list(rv.required).forEach((q, i) => {
      const k = `r${i}`;
      parts.push(h('div', { class: 'key-item' }, h('div', { class: 'key-head' }, q.headline),
        list(q.accepted).length ? h('div', { class: 'small muted' }, 'Also accepted: ', more(list(q.accepted), 6)) : null,
        list(q.not).length ? h('div', { class: 'small muted' }, `Not: ${list(q.not).join(', ')}`) : null, why(q.why), ...asks(q.prompts),
        radios(`req-${k}`, REQ, (d.req || {})[k], (v) => { d.req = { ...(d.req || {}), [k]: v }; save({ [`req/${k}`]: v }); draw(); }),
        (d.req || {})[k] === 'change' ? area((d.req_note || {})[k], 'What to change, for example: also accept losartan 25 mg.', (v) => { d.req_note = { ...(d.req_note || {}), [k]: v }; textSave({ [`req_note/${k}`]: v }); }) : null));
    });
    if (list(rv.wrong?.orders).length) {
      parts.push(h('h3', {}, 'Wrong for this patient'), h('div', { class: 'key-item' },
        h('ul', { class: 'plain wrong-list' }, list(rv.wrong.orders).map((f) => h('li', {}, h('span', { class: 'key-head' }, more(list(f.names), 6)), f.why ? h('div', { class: 'small muted' }, f.why) : null))),
        ...asks(rv.wrong.prompts),
        h('div', { class: 'sub-q' }, h('span', {}, 'Is any of these not wrong for this patient?'), radios('wrong_any', WRONG, d.wrong_any, (v) => { d.wrong_any = v; save({ wrong_any: v }); draw(); })),
        d.wrong_any === 'yes' ? area(d.wrong_note, 'Which, and why it would be acceptable.', (v) => { d.wrong_note = v; textSave({ wrong_note: v }); }) : null));
    }
    if (list(rv.extras).length) {
      parts.push(h('details', { class: 'extras' }, h('summary', {}, `Also fine, not needed (${list(rv.extras).length})`),
        h('ul', { class: 'plain small' }, list(rv.extras).map((x) => h('li', {}, x.names)))));
    }
    if (rv.visit) {
      parts.push(h('h3', {}, 'Booked visits'), h('div', { class: 'key-item' }, h('div', { class: 'small muted' }, 'Some required orders above have a date window.'),
        h('div', { class: 'sub-q' }, h('span', {}, 'Would a booked visit in these windows also be fine?'), radios('visit', YNU, d.visit, (v) => { d.visit = v; save({ visit: v }); draw(); }))));
    }
    parts.push(h('h3', {}, 'Chart and instruction'), h('div', { class: 'key-item' }, h('div', { class: 'small muted' }, 'Is the chart consistent, and is the instruction clear without giving the answer away?'),
      ...asks(rv.chart?.prompts),
      radios('chart', CHART, d.chart, (v) => { d.chart = v; save({ chart: v }); draw(); }),
      d.chart === 'problem' ? area(d.chart_note, 'What is the problem?', (v) => { d.chart_note = v; textSave({ chart_note: v }); }) : null));
    parts.push(h('h3', {}, 'Decision'), radios('decision', DECISION, d.decision, (v) => { d.decision = v; save({ decision: v }); draw(); }),
      d.decision && d.decision !== 'accept' ? area(d.notes, 'What to change, or why the task should go.', (v) => { d.notes = v; textSave({ notes: v }); })
        : area(d.notes, 'Notes (optional)', (v) => { d.notes = v; textSave({ notes: v }); }));
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
  const n = ordered().findIndex((x) => x.id === id) + 1;
  const right = h('div', {}, h('div', { class: 'panel-h' }, h('h2', {}, 'Answer key and your review'), h('span', { class: 'muted small' }, `Task ${n} of ${ordered().length}`)),
    twin ? h('details', { class: 'note' }, h('summary', {}, h('span', { class: 't' }, "The paired task's answer key"), h('span', { class: 'muted small' }, 'same patient, one fact differs')),
      h('div', { style: { padding: '0 14px 12px' } }, list(twin.review.required).map((q) => h('div', { class: 'small' }, '• ', q.headline)))) : null);
  const f = review(d, rv, save, readOnly); right.append(f);
  if (readOnly) right.append(h('div', { class: 'lock', style: { marginTop: '16px' } }, 'Submitted. This review can no longer be changed.'));
  else {
    const status = h('div', {}); const submit = h('button', { class: 'primary' }, 'Submit review');
    const refresh = () => { const miss = needed(d, rv); submit.disabled = miss.length > 0; status.className = miss.length ? 'problems' : 'ready'; status.textContent = miss.length ? `${miss.length} answer${miss.length > 1 ? 's' : ''} left.` : 'Ready to submit.'; };
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
