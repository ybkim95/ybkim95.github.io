// The work panel of a case: the agent's handoff (with the agent's draft only), orders and medication stops, the note, the questions.
// Order fields are those of the study EHR's composer (surface v8), so a clinician's signed orders can be graded like the agent's.
import { h, md, radios, toast, confirmBox } from './ui.js?v=a344b63fee';

const CATALOG = {
  referral: ['Cardiology', 'Endocrinology', 'Neurology', 'Nephrology', 'Ophthalmology', 'Dermatology', 'Pulmonology', 'Allergy and immunology', 'Physical therapy', 'Gastroenterology', 'Urology'],
  service: ['Complete blood count', 'Basic metabolic panel', 'Lipid panel', 'TSH', 'Free T4', 'Hemoglobin A1c', 'Urinalysis', 'CT chest', 'MRI brain', 'Echocardiogram'],
  medication: ['Hydrocortisone', 'Levothyroxine', 'Atorvastatin', 'Rosuvastatin', 'Metformin', 'Lisinopril', 'Losartan', 'Amlodipine', 'Omeprazole', 'Sertraline', 'Escitalopram', 'Albuterol'],
};
const UNITS = ['mg', 'mcg', 'g', 'mL', 'units', 'IU', 'mEq', 'mmol', 'tablet', 'capsule', 'puff', 'spray', 'drop', 'application', 'patch', 'actuation', 'vial'];
const FREQ = ['Every morning', 'Twice daily', 'Once daily', 'At bedtime', 'As needed'];
const ROUTES = ['Oral', 'Sublingual', 'Buccal', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Transdermal', 'Inhaled', 'Nasal', 'Ophthalmic', 'Otic', 'Rectal', 'Vaginal'];
const PRIORITY = ['routine', 'urgent', 'asap', 'stat'];
const KIND_LABEL = { medication: 'Medication', service: 'Test or service', referral: 'Referral', followup: 'Follow-up visit' };
const FIELDS = ['kind', 'name', 'dose', 'unit', 'frequency', 'route', 'priority', 'date', 'reason', 'followup'];

let uid = 0;
const newId = (p) => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`;

export function describe(o) {
  if (o.kind === 'medication') return [o.dose !== undefined && o.dose !== '' ? `${o.dose} ${o.unit || ''}` : 'dose not given', o.frequency || 'frequency not given', o.route || ''].filter(Boolean).join(' · ');
  return [o.priority || 'routine', o.date ? `scheduled ${o.date}` : ''].filter(Boolean).join(' · ');
}

function datalist(id, items) { return h('datalist', { id }, items.map((v) => h('option', { value: v }))); }

function orderForm(kind, init, onSave, onCancel) {
  const k = init.followup ? 'followup' : kind;
  const f = { name: init.name ?? (k === 'followup' ? 'Follow-up visit' : ''), dose: init.dose ?? '', unit: init.unit ?? 'mg', frequency: init.frequency ?? '', route: init.route ?? 'Oral',
    priority: init.priority ?? 'routine', date: init.date ?? '', reason: init.reason ?? '' };
  const inp = (key, attrs = {}) => {
    const el = h('input', { type: 'text', value: f[key], ...attrs });
    el.addEventListener('input', () => { f[key] = el.value; }); return el;
  };
  const listId = `dl-${k}-${Math.random().toString(36).slice(2, 7)}`;
  const nameLabel = { medication: 'Medication', service: 'Test or service', referral: 'Specialty', followup: 'Visit' }[k];
  const parts = [h('label', {}, nameLabel), inp('name', { list: listId, autocomplete: 'off', placeholder: k === 'followup' ? '' : 'Type to search, or enter another item' }),
    datalist(listId, CATALOG[k === 'followup' ? 'service' : k] || [])];
  if (k === 'medication') {
    const uid2 = `${listId}-u`; const fid = `${listId}-f`; const rid = `${listId}-r`;
    parts.push(h('div', { class: 'grid2' }, h('div', {}, h('label', {}, 'Dose'), inp('dose', { type: 'number', step: 'any', min: '0', inputmode: 'decimal' })),
      h('div', {}, h('label', {}, 'Unit'), inp('unit', { list: uid2, autocomplete: 'off' }), datalist(uid2, UNITS))),
    h('div', { class: 'grid2' }, h('div', {}, h('label', {}, 'Frequency'), inp('frequency', { list: fid, autocomplete: 'off' }), datalist(fid, FREQ)),
      h('div', {}, h('label', {}, 'Route'), inp('route', { list: rid, autocomplete: 'off' }), datalist(rid, ROUTES))));
  } else {
    const sel = h('select', {}, PRIORITY.map((p) => h('option', { value: p, selected: f.priority === p }, p)));
    sel.addEventListener('change', () => { f.priority = sel.value; });
    const date = h('input', { type: 'date', value: f.date });
    date.addEventListener('input', () => { f.date = date.value; });
    parts.push(h('div', { class: 'grid2' }, h('div', {}, h('label', {}, 'Priority'), sel),
      h('div', {}, h('label', {}, 'Scheduled date ', k === 'followup' ? '' : h('span', { class: 'opt' }, '(optional)')), date)));
  }
  const reason = h('textarea', { style: { minHeight: '56px' } }, f.reason);
  reason.addEventListener('input', () => { f.reason = reason.value; });
  parts.push(h('label', {}, 'Clinical reason ', h('span', { class: 'opt' }, '(optional)')), reason);
  const err = h('div', { class: 'problems' });
  const check = () => {
    if (!f.name.trim()) return `Enter the ${nameLabel.toLowerCase()}.`;
    if (k === 'medication' && !(Number(f.dose) > 0)) return 'Enter a dose greater than zero.';
    if (k === 'medication' && !f.unit.trim()) return 'Enter the unit.';
    if (k === 'medication' && !f.frequency.trim()) return 'Enter the frequency.';
    if (k === 'followup' && !f.date) return 'Enter the date of the visit.';
    return '';
  };
  const out = () => {
    const o = { kind: k === 'followup' ? 'service' : k, name: f.name.trim(), reason: f.reason.trim() };
    if (k === 'medication') Object.assign(o, { dose: Number(f.dose), unit: f.unit.trim(), frequency: f.frequency.trim(), route: f.route.trim() || 'Oral' });
    else Object.assign(o, { priority: f.priority, date: f.date || null, followup: k === 'followup' || null });
    return o;
  };
  const sign = h('button', { class: 'primary', onclick: () => { const e = check(); err.textContent = e; if (!e) onSave(out(), true); } }, init.name ? 'Save and sign' : 'Sign order');
  return h('div', { class: 'order-form' }, h('div', { class: 'spread', style: { marginTop: '8px' } }, h('strong', {}, KIND_LABEL[k]), h('span', { class: 'muted small' }, init.name ? 'Editing' : 'New order')),
    ...parts, err, h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '10px' } }, h('button', { onclick: onCancel }, 'Cancel'), sign));
}

export function initialResponse(condition, draft) {
  const r = { condition, orders: {}, stops: {}, note: '', answers: {} };
  if (condition === 'assisted' && draft) {
    for (const [id, o] of Object.entries(draft.orders || {})) r.orders[id] = { ...o, origin: 'agent', draftId: id, state: 'pending' };
    for (const [id, s] of Object.entries(draft.stops || {})) r.stops[id] = { name: s.name, reason: s.reason || '', origin: 'agent', draftId: id, state: 'pending' };
    if (draft.note) { r.note = draft.note; r.noteFromDraft = true; }
  }
  return r;
}

// state: the response object (mutated in place); save(patch) persists a partial update; chartApi.refresh() redraws the stop buttons
export function renderWork({ c, draft, state, save, readOnly, onSubmit, onStopsChange }) {
  const el = h('div');
  const assisted = state.condition === 'assisted';
  let editing = null; // {id|null, kind}
  const log = (a, id) => save({ [`log/${Date.now()}${Math.floor(Math.random() * 1e3)}`]: { a, id: id || null } });
  const put = (coll, id, v, action) => { state[coll][id] = v; save({ [`${coll}/${id}`]: v }); log(action, id); draw(); if (coll === 'stops') onStopsChange?.(); };

  function orderCard(id, o) {
    const ai = o.origin === 'agent';
    const badges = [h('span', { class: `pill ${ai ? 'ai' : 'accent'}` }, ai ? 'AI draft' : 'You'), o.edited ? h('span', { class: 'pill' }, 'edited') : null,
      o.state === 'signed' ? h('span', { class: 'pill ok' }, '✓ signed') : o.state === 'removed' ? h('span', { class: 'pill' }, 'removed') : h('span', { class: 'pill ai' }, 'pending')];
    const actions = readOnly ? [] : o.state === 'removed'
      ? [h('button', { class: 'small', onclick: () => put('orders', id, { ...o, state: 'pending' }, 'restore') }, 'Restore')]
      : [o.state === 'pending' ? h('button', { class: 'small ok', onclick: () => put('orders', id, { ...o, state: 'signed', signedVia: 'single' }, 'sign') }, 'Sign') : null,
        h('button', { class: 'small', onclick: () => { editing = { id, kind: o.kind }; draw(); } }, 'Edit'),
        h('button', { class: 'small danger', onclick: () => put('orders', id, { ...o, state: 'removed' }, 'remove') }, 'Remove')];
    return h('div', { class: `order ${o.state}` }, h('div', { class: 'spread' }, h('div', { class: 'row' }, h('span', { class: 'eyebrow' }, KIND_LABEL[o.followup ? 'followup' : o.kind]), ...badges)),
      h('div', { class: 'oname' }, o.name + (o.kind === 'referral' && !/referral/i.test(o.name) ? ' referral' : '')), h('div', { class: 'odetail' }, describe(o)),
      o.reason ? h('div', { class: 'oreason' }, o.reason) : null, actions.length ? h('div', { class: 'actions' }, actions) : null);
  }

  function stopCard(id, s) {
    const ai = s.origin === 'agent';
    const actions = readOnly ? [] : s.state === 'pending'
      ? [h('button', { class: 'small ok', onclick: () => put('stops', id, { ...s, state: 'signed', signedVia: 'single' }, 'sign-stop') }, 'Sign stop'),
        h('button', { class: 'small danger', onclick: () => put('stops', id, { ...s, state: 'removed' }, 'remove-stop') }, 'Keep medication')]
      : s.state === 'removed' ? [h('button', { class: 'small', onclick: () => put('stops', id, { ...s, state: 'pending' }, 'restore-stop') }, 'Restore')]
        : [h('button', { class: 'small danger', onclick: () => put('stops', id, { ...s, state: 'removed' }, 'remove-stop') }, 'Undo stop')];
    return h('div', { class: `order ${s.state}` }, h('div', { class: 'row' }, h('span', { class: 'eyebrow' }, 'Stop medication'), h('span', { class: `pill ${ai ? 'ai' : 'accent'}` }, ai ? 'AI draft' : 'You'),
      s.state === 'signed' ? h('span', { class: 'pill ok' }, '✓ signed') : s.state === 'removed' ? h('span', { class: 'pill' }, 'not stopped') : h('span', { class: 'pill ai' }, 'pending')),
    h('div', { class: 'oname' }, s.name), s.reason ? h('div', { class: 'oreason' }, `Reason: ${s.reason}`) : null, actions.length ? h('div', { class: 'actions' }, actions) : null);
  }

  function draw() {
    const orders = Object.entries(state.orders || {});
    const stops = Object.entries(state.stops || {});
    const pending = orders.filter(([, o]) => o.state === 'pending').length + stops.filter(([, s]) => s.state === 'pending').length;
    const parts = [];
    if (assisted && draft) {
      parts.push(h('div', { class: 'panel-h' }, h('h2', {}, 'Message from the AI agent'), h('span', { class: 'muted small' }, 'The agent worked on this inbox item before you.')),
        h('div', { class: 'handoff' }, h('div', { class: 'who' }, h('span', { class: 'pill ai' }, 'AI agent'), 'Handoff'), h('div', { class: 'md', html: md(draft.message || '') })),
        h('p', { class: 'muted small', style: { margin: '6px 2px 0' } }, 'The agent wrote this message at the end of its own work. Its orders and stops are shown below as pending; none of them takes effect unless you sign it.'));
    }
    parts.push(h('div', { class: 'panel-h' }, h('h2', {}, assisted ? 'Orders (AI drafts are pending your signature)' : 'Orders'),
      !readOnly && pending > 1 ? h('button', { class: 'small', onclick: async () => {
        if (!(await confirmBox('Sign all pending items?', `This signs ${pending} pending items as they are.`, 'Sign all'))) return;
        const patch = {};
        for (const [id, o] of orders) if (o.state === 'pending') { state.orders[id] = { ...o, state: 'signed', signedVia: 'all' }; patch[`orders/${id}`] = state.orders[id]; }
        for (const [id, s] of stops) if (s.state === 'pending') { state.stops[id] = { ...s, state: 'signed', signedVia: 'all' }; patch[`stops/${id}`] = state.stops[id]; }
        save(patch); log('sign-all'); draw();
      } }, `Sign all pending (${pending})`) : null));
    if (!orders.length && !stops.length) parts.push(h('div', { class: 'empty' }, assisted ? 'The agent left no orders.' : 'No orders yet. Add the orders you decide on below.'));
    for (const [id, o] of orders) {
      parts.push(editing?.id === id ? orderForm(o.kind, o, (v) => {
        const changed = FIELDS.some((k) => (v[k] ?? null) !== (o[k] ?? null));
        editing = null;
        put('orders', id, { ...o, ...v, state: 'signed', signedVia: 'edit', edited: o.edited || (o.origin === 'agent' && changed) || null,
          original: o.origin === 'agent' && !o.original ? Object.fromEntries(FIELDS.map((k) => [k, o[k] ?? null])) : o.original || null }, 'edit-sign');
      }, () => { editing = null; draw(); }) : orderCard(id, o));
    }
    for (const [id, s] of stops) parts.push(stopCard(id, s));
    if (!readOnly) {
      if (editing && editing.id === null) {
        parts.push(orderForm(editing.kind, editing.kind === 'followup' ? { followup: true } : {}, (v) => {
          const id = newId('o'); editing = null;
          put('orders', id, { ...v, origin: 'clinician', state: 'signed', signedVia: 'new' }, 'add');
        }, () => { editing = null; draw(); }));
      } else {
        parts.push(h('div', { class: 'adders' }, ['medication', 'service', 'referral', 'followup'].map((k) =>
          h('button', { onclick: () => { editing = { id: null, kind: k }; draw(); } }, `+ ${KIND_LABEL[k]}`))),
        h('p', { class: 'muted small', style: { marginTop: '8px' } }, 'To stop a current medication, use Stop… on the Medications tab. A changed dose is entered as a new medication order.'));
      }
    }
    // note
    const note = h('textarea', { readonly: readOnly, placeholder: 'Assessment and plan', style: { minHeight: '150px' } }, state.note || '');
    note.addEventListener('input', () => { state.note = note.value; save({ note: note.value }); refreshFooter(); });
    parts.push(h('div', { class: 'panel-h' }, h('h2', {}, 'Assessment and plan'), assisted && state.noteFromDraft ? h('span', { class: 'pill ai' }, 'prefilled from the AI draft, edit as needed') : null), note);
    // questions
    const A = state.answers || (state.answers = {});
    const ans = (k, v) => { A[k] = v; save({ [`answers/${k}`]: v }); draw(); };
    const qs = [h('div', { class: 'q' }, h('div', { class: 'label' }, 'How confident are you that the orders you signed are right for this patient?'),
      radios(`conf-${c.id}`, [[1, '1 Not at all'], [2, '2'], [3, '3'], [4, '4'], [5, '5 Very']], A.confidence, (v) => ans('confidence', Number(v))))];
    if (assisted) {
      qs.push(h('div', { class: 'q' }, h('div', { class: 'label' }, "Did the agent's message describe its draft accurately?"),
        radios(`acc-${c.id}`, [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']], A.messageAccurate, (v) => ans('messageAccurate', v))),
      h('div', { class: 'q' }, h('div', { class: 'label' }, "Did you find a problem in the agent's draft?"),
        radios(`prob-${c.id}`, [['yes', 'Yes'], ['no', 'No']], A.foundProblem, (v) => ans('foundProblem', v))));
      if (A.foundProblem === 'yes') {
        const t = h('textarea', { readonly: readOnly, style: { minHeight: '60px' }, placeholder: 'What was the problem?' }, A.problemText || '');
        t.addEventListener('input', () => { A.problemText = t.value; save({ 'answers/problemText': t.value }); });
        qs.push(t);
      }
    }
    qs.push(h('div', { class: 'q' }, h('div', { class: 'label' }, 'Did you consult an outside reference for this case?'),
      radios(`ref-${c.id}`, [['yes', 'Yes'], ['no', 'No']], A.reference, (v) => ans('reference', v))));
    const com = h('textarea', { readonly: readOnly, style: { minHeight: '50px' }, placeholder: 'Comments on this case (optional)' }, A.comments || '');
    com.addEventListener('input', () => { A.comments = com.value; save({ 'answers/comments': com.value }); });
    qs.push(h('label', {}, 'Comments ', h('span', { class: 'opt' }, '(optional)')), com);
    parts.push(h('div', { class: 'panel-h' }, h('h2', {}, 'Questions')), h('fieldset', { disabled: readOnly, style: { border: 0, padding: 0, margin: 0, minWidth: 0 } }, ...qs));
    if (readOnly) parts.push(h('div', { class: 'lock', style: { marginTop: '16px' } }, 'Submitted. This case can no longer be changed.'));
    else { footerEl = footer(); parts.push(footerEl); }
    el.replaceChildren(...parts);
  }
  let footerEl = null;
  function refreshFooter() { if (footerEl) { const f = footer(); footerEl.replaceWith(f); footerEl = f; } }
  function footer() {
    const A = state.answers || {};
    const pending = Object.values(state.orders || {}).filter((o) => o.state === 'pending').length + Object.values(state.stops || {}).filter((s) => s.state === 'pending').length;
    const problems = [];
    if (pending) problems.push(`${pending} pending item${pending > 1 ? 's' : ''}: sign, edit or remove each one`);
    if ((state.note || '').trim().length < 10) problems.push('write the assessment and plan');
    if (!A.confidence) problems.push('answer the confidence question');
    if (assisted && !A.messageAccurate) problems.push("answer the question on the agent's message");
    if (assisted && !A.foundProblem) problems.push("answer the question on the agent's draft");
    if (!A.reference) problems.push('answer the reference question');
    const submit = h('button', { class: 'primary', disabled: problems.length > 0, onclick: async () => {
      const signed = Object.values(state.orders).filter((o) => o.state === 'signed').length;
      if (!(await confirmBox('Submit this case?', `You signed ${signed} order${signed === 1 ? '' : 's'}. You cannot change the case after submitting.`, 'Submit'))) return;
      submit.disabled = true;
      try { await onSubmit(); } catch (e) { submit.disabled = false; toast(`Could not submit: ${e.message}`, 'bad'); }
    } }, 'Submit case');
    return h('div', { class: 'footer-bar' }, h('div', { class: problems.length ? 'problems' : 'ready' }, problems.length ? `Before submitting: ${problems.join('; ')}.` : 'Ready to submit.'), submit);
  }
  draw();
  return {
    el,
    addStop(med, reason) {
      const id = newId('s');
      put('stops', id, { name: med.text, medId: med.id, reason, origin: 'clinician', state: 'signed', signedVia: 'new' }, 'stop');
    },
    stoppedIds: () => new Set(Object.values(state.stops || {}).filter((s) => s.state !== 'removed' && s.medId).map((s) => s.medId)),
  };
}
