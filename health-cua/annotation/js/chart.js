// The patient chart, in the modules the study EHR shows: summary, problems, medications, results, vitals, notes, procedures.
import { h, md, fmtDate } from './ui.js?v=7b633b620f';

const TABS = [['summary', 'Summary'], ['problems', 'Problems'], ['medications', 'Medications'], ['labs', 'Results'], ['vitals', 'Vitals'],
  ['notes', 'Notes'], ['procedures', 'Procedures']];

function flag(row) {
  const v = Number(row.value);
  if (row.flag) return /high|abnormal|critical/i.test(row.flag) ? 'high' : /low/i.test(row.flag) ? 'low' : '';
  if (Number.isNaN(v)) return '';
  if (row.high !== null && row.high !== undefined && v > row.high) return 'high';
  if (row.low !== null && row.low !== undefined && v < row.low) return 'low';
  return '';
}
const range = (r) => (r.low ?? '') !== '' || (r.high ?? '') !== '' ? `${r.low ?? ''}–${r.high ?? ''}` : '';

// Display only (the chart data are unchanged): vital names and units as clinicians write them, blood pressure as one reading,
// at most one decimal for vitals, dates as Jan 24, 2024 18:54.
const VITAL_NAMES = [[/^pain severity\b.*/i, 'Pain score'], [/^blood pressure panel\b.*/i, 'Blood pressure'], [/^oxygen saturation\b.*/i, 'Oxygen saturation'],
  [/^body height\b.*/i, 'Height'], [/^body weight\b.*/i, 'Weight'], [/^body temperature\b.*/i, 'Temperature'], [/^body mass index\b.*/i, 'BMI'],
  [/^heart rate\b.*/i, 'Heart rate'], [/^respiratory rate\b.*/i, 'Respiratory rate'], [/^head occipital-frontal circumference\b.*/i, 'Head circumference']];
const UNITS = [[/mm\[Hg\]/g, 'mmHg'], [/^Cel$/, '°C'], [/^\[degF\]$/, '°F'], [/kg\/m2/g, 'kg/m²'], [/10\*3\/uL/g, '×10³/µL'], [/10\*6\/uL/g, '×10⁶/µL'], [/\buL\b/g, 'µL'], [/\{[^}]*\}/g, '']];
export const cleanUnit = (u) => UNITS.reduce((x, [re, to]) => x.replace(re, to), String(u || '')).trim();
const withUnit = (v, u) => { const x = cleanUnit(u); return `${v ?? ''}${x && !/^[/%°]/.test(x) ? ' ' : ''}${x}`.trim(); };  // 4/10, 94%, 37.2°C
export function fmtStamp(s) { const m = String(s || '').match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/); return m ? `${fmtDate(m[1])} ${m[2]}` : fmtDate(s); }
const bpOf = (v) => { const m = String(v).match(/diastolic[^\d]*([\d.]+)[^;]*;\s*systolic[^\d]*([\d.]+)/i) || String(v).match(/systolic[^\d]*([\d.]+)[^;]*;\s*diastolic[^\d]*([\d.]+)/i);
  if (!m) return null; return /^diastolic/i.test(String(v).trim()) ? `${m[2]}/${m[1]}` : `${m[1]}/${m[2]}`; };
export function tidyVitals(rows) {
  const out = []; const bp = {};
  for (const r of rows || []) {
    const t = String(r.text || '');
    if (/^(systolic|diastolic) blood pressure$/i.test(t)) { const k = r.date; bp[k] = bp[k] || { ...r, text: 'Blood pressure', unit: 'mmHg', _bp: {} }; bp[k]._bp[/^s/i.test(t) ? 's' : 'd'] = r.value; continue; }
    const name = (VITAL_NAMES.find(([re]) => re.test(t))?.[1]) || t.replace(/\s*\[[^\]]*\]/g, '').replace(/\s+-\s+Reported$/, '');
    let value = r.value; let unit = cleanUnit(r.unit);
    const pair = typeof value === 'string' ? bpOf(value) : null;
    if (pair) { value = pair; unit = 'mmHg'; }
    else if (typeof value === 'number' && !Number.isInteger(value)) value = Math.round(value * 10) / 10;
    if (name === 'Pain score' && !unit) unit = '/10';
    out.push({ ...r, text: name, value, unit });
  }
  for (const r of Object.values(bp)) { out.push({ ...r, value: `${r._bp.s ?? '–'}/${r._bp.d ?? '–'}` }); delete r._bp; }
  return out.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function table(cols, rows, rowClass = () => '') {
  if (!rows.length) return h('div', { class: 'empty' }, 'None recorded.');
  return h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, cols.map((c) => h('th', {}, c[0])))),
    h('tbody', {}, rows.map((r) => h('tr', { class: rowClass(r) }, cols.map((c) => c[1](r)))))));
}

function labsView(rows, title) {
  const box = h('div');
  const input = h('input', { type: 'text', placeholder: `Filter ${title.toLowerCase()} by name`, 'aria-label': `Filter ${title}` });
  const render = () => {
    const f = input.value.trim().toLowerCase();
    const shown = rows.filter((r) => !f || r.text.toLowerCase().includes(f));
    box.replaceChildren(table([['Test', (r) => h('td', {}, r.text)], ['Result', (r) => h('td', { class: `num flag-${flag(r)}` }, withUnit(r.value, r.unit), flag(r) ? ` ${flag(r) === 'high' ? 'H' : 'L'}` : '')],
      ['Reference', (r) => h('td', { class: 'num muted' }, range(r))], ['Date', (r) => h('td', { class: 'num' }, fmtStamp(r.date))]], shown));
  };
  input.addEventListener('input', render); render();
  return h('div', {}, h('div', { class: 'filter' }, input), box);
}

function notesView(notes, onOpen) {
  if (!notes.length) return h('div', { class: 'empty' }, 'No notes.');
  const list = notes.map((n, i) => {
    const d = h('details', { class: 'note' }, h('summary', {}, h('span', {}, h('span', { class: 't' }, n.title || n.type || 'Note'), ' ', h('span', { class: 'muted small' }, n.service || '')),
      h('span', { class: 'muted small mono' }, `${fmtDate(n.date)} · ${n.author || ''}`)), h('pre', {}, n.text));
    d.addEventListener('toggle', () => { if (d.open) onOpen?.(i); });
    return d;
  });
  const all = h('button', { class: 'ghost small', onclick: () => { const open = !list.every((d) => d.open); list.forEach((d) => { d.open = open; }); } }, 'Expand or collapse all');
  return h('div', {}, h('div', { class: 'row', style: { justifyContent: 'flex-end', marginBottom: '6px' } }, all), list);
}

export function renderChart(c, { onStop, stopped = new Set(), onView, tab = 'summary' } = {}) {
  // the database drops empty lists, so a chart without procedures (or notes, labs...) arrives without that field
  const arr = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
  const ch = { ...c.chart, problems: arr(c.chart.problems), medications: arr(c.chart.medications), labs: arr(c.chart.labs), notes: arr(c.chart.notes),
    procedures: arr(c.chart.procedures), vitals: tidyVitals(arr(c.chart.vitals)) };
  const p = ch.patient;
  const counts = { problems: ch.problems.length, medications: ch.medications.length, labs: ch.labs.length, vitals: ch.vitals.length, notes: ch.notes.length, procedures: ch.procedures.length };
  const body = h('div');
  const tabs = h('div', { class: 'tabs', role: 'tablist' });
  const active = (r) => ['active', 'recurrence', 'relapse'].includes(r.status);
  const views = {
    summary: () => h('div', { class: 'stack' },
      h('div', {}, h('h3', {}, 'Active problems'), table([['Problem', (r) => h('td', {}, r.text)], ['Onset', (r) => h('td', { class: 'num' }, fmtDate(r.onset))]], ch.problems.filter(active))),
      h('div', {}, h('h3', {}, 'Active medications'), table([['Medication', (r) => h('td', {}, r.text, r.sig ? h('div', { class: 'small muted' }, r.sig) : null)],
        ['Started', (r) => h('td', { class: 'num' }, fmtDate(r.authored))]], ch.medications.filter((m) => m.status === 'active'))),
      h('div', {}, h('h3', {}, 'Latest vitals'), table([['Vital', (r) => h('td', {}, r.text)], ['Value', (r) => h('td', { class: 'num' }, withUnit(r.value, r.unit))], ['Date', (r) => h('td', { class: 'num' }, fmtDate(r.date))]],
        Object.values(Object.fromEntries([...ch.vitals].reverse().map((v) => [v.text, v])))))),
    problems: () => table([['Problem', (r) => h('td', {}, r.text)], ['Status', (r) => h('td', {}, r.status || '')], ['Onset', (r) => h('td', { class: 'num' }, fmtDate(r.onset))],
      ['Resolved', (r) => h('td', { class: 'num' }, fmtDate(r.abated))]], ch.problems, (r) => (active(r) ? '' : 'status-inactive')),
    medications: () => table([['Medication', (r) => h('td', {}, r.text, r.sig ? h('div', { class: 'small muted' }, r.sig) : null, r.reason ? h('div', { class: 'small muted' }, `Reason: ${r.reason}`) : null)],
      ['Status', (r) => h('td', {}, stopped.has(r.id) ? h('span', { class: 'pill' }, 'stop pending') : r.status || '')], ['Started', (r) => h('td', { class: 'num' }, fmtDate(r.authored))],
      ['', (r) => h('td', {}, onStop && r.status === 'active' && !stopped.has(r.id) ? h('button', { class: 'small', onclick: () => onStop(r) }, 'Stop…') : '')]],
    ch.medications, (r) => (r.status === 'active' ? '' : 'status-inactive')),
    labs: () => labsView(ch.labs, 'Results'),
    vitals: () => labsView(ch.vitals, 'Vitals'),
    notes: () => notesView(ch.notes, (i) => onView?.(`note:${i}`)),
    procedures: () => table([['Procedure', (r) => h('td', {}, r.text)], ['Date', (r) => h('td', { class: 'num' }, fmtDate(r.date))]], ch.procedures),
  };
  let current = tab;
  const show = (k) => {
    current = k;
    for (const b of tabs.children) b.setAttribute('aria-selected', String(b.dataset.k === k));
    body.replaceChildren(views[k]());
    onView?.(`tab:${k}`);
  };
  for (const [k, label] of TABS) {
    tabs.append(h('button', { role: 'tab', 'data-k': k, onclick: () => show(k) }, label, counts[k] !== undefined ? h('span', { class: 'count' }, ` ${counts[k]}`) : ''));
  }
  show(current);
  return {
    el: h('div', {},
      h('div', { class: 'patient' }, h('span', { class: 'name' }, p.name), h('span', { class: 'muted' }, `${p.age} y · ${p.sex} · born ${fmtDate(p.birthDate)}`),
        h('span', { class: 'mono muted small' }, `MRN ${p.mrn}`)),
      tabs, body),
    refresh: () => show(current),
  };
}

// timestamps in the instruction as clinicians write them (display only: 2024-06-03T15:00:00+00:00 -> Jun 3, 2024, 15:00)
const isoToClinician = (t) => String(t || '').replace(/\b(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?/g, (_, d, hh, mm) => `${fmtDate(d)}, ${hh}:${mm}`);
export function renderTask(c) {
  return h('div', { class: 'stack' },
    h('div', { class: 'inbox' }, h('div', { class: 'eyebrow' }, `Inbox · ${c.inbox.category || ''}`), h('h2', { style: { margin: '4px 0' } }, c.inbox.subject),
      h('div', { class: 'meta' }, h('span', {}, `From ${c.inbox.sender}`), h('span', {}, fmtDate(c.inbox.received_at))), h('p', { style: { margin: '8px 0 0' } }, c.inbox.body)),
    h('details', { class: 'note', open: true }, h('summary', {}, h('span', { class: 't' }, c.title), h('span', { class: 'muted small' }, `You act as: ${c.role}`)),
      h('div', { class: 'md', style: { padding: '0 14px 12px' }, html: md(isoToClinician(c.instructions)) })));
}
