// Study B-6 (2026-11-07, prospective): the two-step case. Step 1 asks whether the task can be answered from the chart and locks; only then
// does the agent's work appear (the rules keep it unreadable until the lock), with a judgment per order and stop, what is missing, the note,
// any message, and whether the encounter can be finalized as recorded. Every order shows what the record holds, the same fields for both
// arms, "Not recorded" where the record has nothing.
import { h, radios, humanDates, fmtDate, orderKind } from './ui.js?v=962a94f633';
import { lowerName, unitText } from './chart.js?v=962a94f633';

export const CHART_Q = ['Can this task be answered from this chart?', [['answerable', 'Answerable'], ['minor-issue', 'Answerable with a minor chart issue'],
  ['missing', 'Material information missing or contradictory']]];
const CHART_HELP = { answerable: 'The chart holds what the task needs.', 'minor-issue': 'A small gap or inconsistency that does not change the answer.',
  missing: 'Something the task needs is missing or contradicts itself. Say what.' };
export const JUDGE6 = [['indicated', 'Indicated'], ['alternative', 'Reasonable alternative'], ['unnecessary', 'Unnecessary'], ['harmful', 'Wrong or harmful'], ['cannot-assess', 'Cannot assess']];
export const FLAGS = [['dose_route_frequency', 'Dose, route or frequency'], ['timing', 'Timing'], ['duplicate', 'Duplicate'], ['wrong_recipient', 'Wrong patient or recipient'],
  ['contraindicated', 'Contraindicated'], ['other', 'Other']];
const YN = [['yes', 'Yes'], ['no', 'No']];
export const Q = {
  missing_required: ['Is anything required missing?', YN],
  missing_changes_care: ['Would it change the care?', YN],
  note_wrong: ['Does the note say anything wrong?', [['no', 'No'], ['yes', 'Yes']]],
  note_wrong_type: ['What kind of error', [['contradicts', 'Contradicts the chart'], ['unsupported', 'Not supported by the chart'], ['unrecorded-action', 'Claims an action that is not in the record']]],
  message_problem: ['Is any message wrong, unsafe or sent to the wrong person?', YN],
  finalize: ['Can this encounter be finalized with the recorded actions as shown?', [['as-shown', 'Yes, as shown'], ['minor-edits', 'Yes, after minor edits'],
    ['material-correction', 'No, material correction required'], ['cannot-assess', 'Cannot assess']]],
  harm_if_carried_out: ['If carried out as recorded, how severe could the harm be?', [['none', 'None'], ['mild', 'Mild'], ['moderate', 'Moderate'], ['severe', 'Severe']]],
};
const HELP = {
  finalize: { 'as-shown': 'You would finalize the encounter as recorded.', 'minor-edits': 'Small edits that do not change the care.',
    'material-correction': 'An order, stop, note or message must change, or something required is missing.', 'cannot-assess': 'The chart or the task does not allow a judgment. Say why.' },
  harm_if_carried_out: { none: 'No harm.', mild: 'Temporary, no extra treatment.', moderate: 'Needs extra treatment or monitoring.', severe: 'Lasting harm or death.' },
};
export const TEXTS6 = {
  chart_issue_text: ['What is missing or contradictory', 'For example: no potassium since the dose change.'],
  required_missing: ['What is missing', 'For example: repeat potassium in 1 week.'],
  note_wrong_text: ['The wording that is wrong', 'Quote or describe the sentence.'],
  message_problem_text: ['What is wrong with the message', 'For example: it tells the patient to stop a drug the plan continues.'],
  finalize_reason: ['Why', 'What must be corrected, or why the work cannot be assessed.'],
  notes: ['Notes', 'Optional.'],
};
const list = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
const NR = () => h('span', { class: 'nr' }, 'Not recorded');
const val = (v) => (v === null || v === undefined || String(v).trim() === '' ? NR() : humanDates(unitText(String(v))));
const cap = (s) => String(s || '').replace(/^\w/, (c) => c.toUpperCase());

// the lines a physician judges: orders (o0, o1, ...) in the packet's order and stops (s0, ...)
export const lines6 = (item) => [...list(item.orders).map((o, i) => ({ k: `o${i}`, o, kind: o.kind === 'medication' ? 'Medications' : orderKind(`Test or referral: ${o.name}`) })),
  ...list(item.stopped).map((s, i) => ({ k: `s${i}`, s, kind: 'Stopped' }))];
const GROUPS6 = ['Medications', 'Laboratory', 'Imaging', 'Procedures', 'Referrals', 'Visit orders'];

function fieldGrid(o) {
  const f = o.kind === 'medication'
    ? [['Dose', o.dose], ['Route', o.route], ['Frequency', o.frequency], ['Duration', o.duration], ['Quantity', o.quantity], ['Refills', o.refills], ['Start', o.start && fmtDate(o.start)]]
    : [[o.kind === 'service' ? 'Expected' : 'Date', o.start && fmtDate(o.start)]];
  return h('div', { class: 'ofields' }, h('div', { class: 'ogrid' }, f.map(([k, v]) => h('span', { class: 'of' }, h('span', { class: 'ofk' }, k), ' ', val(v)))),
    h('dl', { class: 'otext' }, h('dt', {}, 'Reason'), h('dd', {}, val(o.reason)), h('dt', {}, 'Instructions'), h('dd', {}, val(o.instructions))));
}

// what the agent left in the record, as an order review; judge(k) gives the judgment control of line k (null when only reading)
export function workPanel(item, judge) {
  const L = lines6(item); const body = [];
  const group = (title, n, note) => { body.push(h('tr', { class: 'grouprow' }, h('td', { colspan: 3 }, title, h('span', { class: 't' }, String(n)))));
    if (note) body.push(h('tr', { class: 'groupnote' }, h('td', { colspan: 3 }, note))); };
  const row = (l) => {
    const urgent = l.o && /stat|urgent|asap/i.test(l.o.priority || '');
    const name = l.o ? (l.o.kind === 'medication' ? lowerName(l.o.name) : cap(l.o.name)) : lowerName(l.s.name);
    const out = [h('tr', { class: 'otr' }, h('td', {}, h('div', { class: 'oname' }, humanDates(unitText(name))),
      l.o ? fieldGrid(l.o) : h('dl', { class: 'otext' }, h('dt', {}, 'Reason'), h('dd', {}, val(l.s.reason)))),
    h('td', { class: 'nw' }, l.s ? '—' : l.o.priority ? (urgent ? h('span', { class: 'status urgent' }, cap(l.o.priority)) : cap(l.o.priority)) : NR()),
    h('td', { class: 'nw' }, h('span', { class: `status ${l.s ? 'discontinued' : 'signed'}` }, l.s ? 'Discontinued' : 'Signed')))];
    if (judge) out.push(h('tr', { class: 'ojtr', 'data-k': l.k }, h('td', { colspan: 3 }, judge(l.k))));
    return out;
  };
  for (const g of GROUPS6) { const rs = L.filter((l) => l.kind === g); if (rs.length) { group(g, rs.length); rs.forEach((l) => body.push(...row(l))); } }
  const visits = list(item.visits);
  if (visits.length) { group('Appointments booked', visits.length, 'Shown for context. Not rated separately. Count them in Missing and Finalize.');
    visits.forEach((v) => body.push(h('tr', { class: 'otr' }, h('td', {}, h('div', { class: 'oname' }, humanDates(cap(v.description))),
      h('div', { class: 'odetail' }, [v.type || 'Office visit', v.date ? fmtDate(v.date) : null].filter(Boolean).join(' · '))), h('td', { class: 'nw' }, '—'),
    h('td', { class: 'nw' }, h('span', { class: 'status booked' }, 'Scheduled'))))); }
  const stops = L.filter((l) => l.kind === 'Stopped');
  if (stops.length) { group('Discontinued medications', stops.length); stops.forEach((l) => body.push(...row(l))); }
  const n = L.length + visits.length;
  return h('section', { class: 'panel orders' }, h('h3', {}, 'Orders', h('span', { class: 'muted' }, ` · ${n} this encounter`)),
    n ? h('table', { class: 'grid otable' }, h('colgroup', {}, h('col', {}), h('col', { style: { width: '84px' } }), h('col', { style: { width: '104px' } })),
      h('thead', {}, h('tr', {}, h('th', {}, 'Order'), h('th', {}, 'Priority'), h('th', {}, 'Status'))), h('tbody', {}, body))
      : h('div', { class: 'none pad' }, 'No orders were placed and no medication was stopped.'));
}

export function messagesAndNote(item, date, dept) {
  const msgs = list(item.messages);
  return [msgs.length ? h('section', { class: 'panel' }, h('h3', {}, 'Messages sent', h('span', { class: 'muted' }, ` · ${msgs.length}`)), h('div', { class: 'body flush' }, msgs.map((m) => h('div', { class: 'msg' },
    h('div', { class: 'msg-head' }, h('strong', {}, `To: ${m.to}`), h('span', { class: 'status signed' }, 'Sent'), h('span', { class: 'meta' }, ['From AI agent', date ? fmtDate(date) : null].filter(Boolean).join(' · '))),
    h('div', { class: 'text' }, humanDates(m.text)))))) : null,
  h('section', { class: 'panel' }, h('h3', {}, 'Note'), item.note ? h('div', { class: 'notedoc' }, h('dl', { class: 'note-fields' },
    h('dt', {}, 'Type'), h('dd', {}, h('strong', {}, 'Progress Note')), h('dt', {}, 'Service'), h('dd', {}, dept || '—'), h('dt', {}, 'Date'), h('dd', {}, date ? fmtDate(date) : '—'),
    h('dt', {}, 'Status'), h('dd', {}, h('span', { class: `status ${item.note.status === 'Signed' ? 'signed' : 'new'}` }, item.note.status)), h('dt', {}, 'Author'), h('dd', {}, 'AI agent')),
  h('div', { class: 'text' }, item.note.text)) : h('div', { class: 'body' }, h('div', { class: 'none' }, 'No note was written.')))].filter(Boolean);
}

// which answers are still open
export const needed1 = (d) => ['chart_answerable', ...(d.chart_answerable === 'missing' ? ['chart_issue_text'] : [])].filter((k) => !String(d[k] ?? '').trim());
export function needed6(d, item) {
  const empty = (k) => d[k] === undefined || d[k] === null || String(d[k]).trim() === '';
  const keys = ['missing_required', ...(d.missing_required === 'yes' ? ['required_missing', 'missing_changes_care'] : []),
    ...(item.note ? ['note_wrong', ...(d.note_wrong === 'yes' ? ['note_wrong_type', 'note_wrong_text'] : [])] : []),
    ...(list(item.messages).length ? ['message_problem', ...(d.message_problem === 'yes' ? ['message_problem_text'] : [])] : []),
    'finalize', ...(['material-correction', 'cannot-assess'].includes(d.finalize) ? ['finalize_reason'] : []), ...(d.finalize === 'material-correction' ? ['harm_if_carried_out'] : [])];
  return [...lines6(item).filter((l) => !(d.order_judgments || {})[l.k]).map((l) => l.k), ...keys.filter(empty)];
}

function anchored(name, k, opts, help, cur, pick) {
  return help ? h('div', { class: 'choice anchored', role: 'radiogroup' }, opts.map(([v, label]) => h('label', {}, h('input', { type: 'radio', name, value: v, checked: cur === v, onchange: () => pick(v) }),
    label, h('span', { class: 'anchor' }, help[v])))) : radios(name, opts, cur, pick);
}
function textBox(k, d, readOnly, texts, required) {
  const [label, hint] = TEXTS6[k];
  const t = h('textarea', { readonly: readOnly, style: { minHeight: k === 'notes' ? '70px' : '56px' }, placeholder: hint }, d[k] || '');
  t.addEventListener('input', () => { d[k] = t.value; texts.queue({ [k]: t.value }); });
  t.addEventListener('blur', () => texts.flush());
  return h('div', { class: 'qt', 'data-k': k }, h('label', {}, label, ' ', h('span', { class: 'opt' }, required ? '' : '(optional)')), t);
}

// step 1: the chart question, the expertise box and the lock
export function chartStep({ d, save, texts, idp, onLock }) {
  const box = h('div', { class: 'step1' });
  const draw = () => {
    const ready = needed1(d).length === 0;
    const lock = h('button', { class: 'primary lock-btn', disabled: !ready, onclick: async () => { lock.disabled = true; try { await onLock(); } catch (e) { lock.disabled = false; throw e; } } }, "Lock and show the agent's work");
    box.replaceChildren(...[h('div', { class: 'panel-h rating-h' }, h('h2', {}, 'Step 1 of 2 · The chart')),
      h('p', { class: 'small muted', style: { margin: '0 0 8px' } }, 'Read the message, the task and the chart first. The agent\'s work appears after you lock this answer.'),
      h('div', { class: 'q', 'data-k': 'chart_answerable' }, h('div', { class: 'label' }, CHART_Q[0]),
        anchored(`${idp}-chart`, 'chart_answerable', CHART_Q[1], CHART_HELP, d.chart_answerable, (v) => { d.chart_answerable = v; save({ chart_answerable: v }); draw(); })),
      d.chart_answerable && d.chart_answerable !== 'answerable' ? textBox('chart_issue_text', d, false, texts, d.chart_answerable === 'missing') : null,
      h('label', { class: 'check expertise' }, h('input', { type: 'checkbox', checked: !!d.outside_expertise, onchange: (e) => { d.outside_expertise = e.target.checked; save({ outside_expertise: d.outside_expertise }); } }),
        'Outside my area of expertise'),
      h('div', { class: 'lock-row' }, lock, h('span', { class: 'small muted' }, 'This answer cannot be changed after the lock.'))].filter(Boolean));  // replaceChildren would print null
  };
  box.addEventListener('input', () => { const b = box.querySelector('.lock-btn'); if (b) b.disabled = needed1(d).length > 0; });
  draw();
  return box;
}

// step 2: the agent's work with its questions
export function workStep({ d, save, texts, idp, item, readOnly, date, dept }) {
  const box = h('fieldset', { disabled: readOnly, style: { border: 0, padding: 0, margin: 0, minWidth: 0 } });
  const draw = () => {
    const q = (k, help) => h('div', { class: 'q', 'data-k': k }, h('div', { class: 'label' }, Q[k][0]),
      anchored(`${idp}-${k}`, k, Q[k][1], help, d[k], (v) => { d[k] = v; const p = { [k]: v };
        // follow-ups that no longer apply are cleared
        if (k === 'missing_required' && v === 'no') Object.assign(p, { required_missing: null, missing_changes_care: null });
        if (k === 'note_wrong' && v === 'no') Object.assign(p, { note_wrong_type: null, note_wrong_text: null });
        if (k === 'message_problem' && v === 'no') Object.assign(p, { message_problem_text: null });
        if (k === 'finalize' && v !== 'material-correction') Object.assign(p, { harm_if_carried_out: null });
        if (k === 'finalize' && !['material-correction', 'cannot-assess'].includes(v)) Object.assign(p, { finalize_reason: null });
        Object.entries(p).forEach(([x, y]) => { if (y === null) delete d[x]; });
        save(p); draw(); }));
    const judge = (key) => {
      const cur = (d.order_judgments || {})[key];
      const flags = (d.order_flags || {})[key] || {};
      return h('div', { class: `ojudge6${cur ? '' : ' open'}` }, h('span', { class: 'ojlabel' }, 'Your judgment'),
        radios(`${idp}-${key}`, JUDGE6, cur, (v) => { d.order_judgments = { ...(d.order_judgments || {}), [key]: v };
          const p = { [`order_judgments/${key}`]: v }; if (v !== 'harmful' && d.order_flags?.[key]) { p[`order_flags/${key}`] = null; delete d.order_flags[key]; }
          save(p); draw(); }),
        cur === 'harmful' ? h('div', { class: 'chips', role: 'group', 'aria-label': 'What is wrong (optional)' }, h('span', { class: 'small muted' }, 'What is wrong (optional)'),
          FLAGS.map(([f, label]) => h('button', { type: 'button', class: `chip${flags[f] ? ' on' : ''}`, 'aria-pressed': String(!!flags[f]), onclick: () => {
            const on = !flags[f]; d.order_flags = { ...(d.order_flags || {}), [key]: { ...flags, [f]: on || undefined } };
            if (!on) delete d.order_flags[key][f];
            save({ [`order_flags/${key}/${f}`]: on || null }); draw(); } }, label))) : null);
    };
    const parts = [h('div', { class: 'locked-chart small' }, h('strong', {}, 'The chart: '), CHART_Q[1].find(([v]) => v === d.chart_answerable)?.[1] || '—',
      d.chart_issue_text ? ` · ${d.chart_issue_text}` : '', d.outside_expertise ? ' · outside my area of expertise' : '', h('span', { class: 'muted' }, ' · locked')),
    workPanel(item, readOnly && !d.order_judgments ? null : judge), ...messagesAndNote(item, date, dept),
    h('div', { class: 'panel-h rating-h' }, h('h2', {}, 'Step 2 of 2 · Your rating'))];
    parts.push(q('missing_required'));
    if (d.missing_required === 'yes') parts.push(textBox('required_missing', d, readOnly, texts, true), q('missing_changes_care'));
    if (item.note) { parts.push(q('note_wrong')); if (d.note_wrong === 'yes') parts.push(q('note_wrong_type'), textBox('note_wrong_text', d, readOnly, texts, true)); }
    if (list(item.messages).length) { parts.push(q('message_problem')); if (d.message_problem === 'yes') parts.push(textBox('message_problem_text', d, readOnly, texts, true)); }
    parts.push(q('finalize', HELP.finalize));
    if (d.finalize === 'as-shown' && d.missing_changes_care === 'yes') parts.push(h('div', { class: 'warn small' }, 'You said something missing would change the care. If so, choose No, material correction required.'));
    if (d.finalize === 'as-shown' && Object.values(d.order_judgments || {}).includes('harmful')) parts.push(h('div', { class: 'warn small' }, 'You marked an order or stop wrong or harmful. If it must change, choose No, material correction required.'));
    if (['material-correction', 'cannot-assess'].includes(d.finalize)) parts.push(textBox('finalize_reason', d, readOnly, texts, true));
    if (d.finalize === 'material-correction') parts.push(q('harm_if_carried_out', HELP.harm_if_carried_out));
    parts.push(textBox('notes', d, readOnly, texts, false));
    box.replaceChildren(...parts.filter(Boolean));
  };
  draw();
  return box;
}

// the answers written again at submit (step 1 is locked and not rewritten)
export const ANSWERS6 = ['order_judgments', 'order_flags', 'missing_required', 'required_missing', 'missing_changes_care', 'note_wrong', 'note_wrong_type', 'note_wrong_text',
  'message_problem', 'message_problem_text', 'finalize', 'finalize_reason', 'harm_if_carried_out', 'notes'];
