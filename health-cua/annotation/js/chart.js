// The patient chart, in the modules the study EHR shows: summary, problems, medications, results, vitals, notes, procedures.
import { h, md, fmtDate } from './ui.js?v=a949b888e2';

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
const has = (x) => x !== null && x !== undefined && x !== '';
// reference range as an EHR prints it: 3.5–5.1, <5 (upper bound only), >60 (lower bound only)
const range = (r) => (has(r.low) && has(r.high) ? `${r.low}–${r.high}` : has(r.high) ? `<${r.high}` : has(r.low) ? `>${r.low}` : '');

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

// ---------- EHR chart (episode review): the layout of our GUI v3 workstation, at the density of a mature commercial EHR. A patient
// header with the encounter context, a storyboard (vitals, key results, problems, medications, recent notes) and activity tabs: In Basket
// (the message and the task), Summary, Chart Review (sortable grids and a reading pane), Results Review (a flowsheet grouped by panel, with
// flags, ranges, a Latest column and a trend graph on click), Problem List and Medications. Only what the chart holds is shown: the
// synthetic charts carry no allergies, code status or PCP, so the header has none.
const DAY = 864e5;
const asDate = (s) => { const x = String(s || ''); return new Date(x.length <= 10 ? `${x}T12:00:00Z` : x.replace(' ', 'T') + (x.length === 16 ? ':00Z' : '')); };
function ago(s, now) {
  const d = Math.round((now - asDate(s)) / DAY);
  if (Number.isNaN(d)) return '';
  return d <= 0 ? 'today' : d < 14 ? `${d} d ago` : d < 60 ? `${Math.round(d / 7)} wk ago` : d < 730 ? `${Math.round(d / 30.4)} mo ago` : `${Math.round(d / 365)} y ago`;
}
const RANGES = [['all', 'All dates'], ['30', 'Last 30 days'], ['182', 'Last 6 months'], ['365', 'Last year']];
const shortVital = (t) => ({ 'Blood pressure': 'BP', 'Heart rate': 'Pulse', 'Respiratory rate': 'Resp', 'Oxygen saturation': 'SpO2', Temperature: 'Temp', 'Pain score': 'Pain' }[t] || t);
const flagMark = (r) => { const f = flag(r); return f ? h('span', { class: 'fl' }, f === 'high' ? ' H' : ' L') : null; };
const val = (r) => h('span', { class: flag(r) ? 'flag' : '' }, String(r.value ?? ''), h('span', { class: 'u' }, ` ${cleanUnit(r.unit)}`), flagMark(r));
const timeOf = (s) => (String(s).match(/[ T](\d{2}:\d{2})/) || [])[1] || '';
const stamp = (s) => h('span', { class: 'nw' }, fmtDate(String(s).slice(0, 10)), timeOf(s) ? h('span', { class: 'tm' }, ` ${timeOf(s)}`) : null);
// test names as a flowsheet prints them: LOINC qualifiers dropped, common panel members abbreviated (the full name stays in the tooltip)
const ALIAS = [[/^Hemoglobin A1c\/Hemoglobin\.total.*/i, 'Hemoglobin A1c'], [/^Cholesterol in HDL.*/i, 'HDL cholesterol'], [/^Low Density Lipoprotein Cholesterol.*/i, 'LDL cholesterol'],
  [/^Cholesterol$/i, 'Total cholesterol'], [/^Erythrocyte distribution width.*/i, 'RDW'], [/^Platelet distribution width.*/i, 'PDW'], [/^Platelet mean volume.*/i, 'MPV'],
  [/^Leukocytes$/i, 'WBC'], [/^Erythrocytes$/i, 'RBC'], [/^Alanine aminotransferase$/i, 'ALT'], [/^Aspartate aminotransferase$/i, 'AST'], [/^Hemoglobin$/i, 'Hemoglobin'],
  [/^CD3\+CD4\+ \(T4 helper\) cells$/i, 'CD4 count'], [/^HIV 1 RNA.*/i, 'HIV-1 RNA (viral load)']];
const labName = (t) => { const s = String(t || '').replace(/\s*\[[^\]]*\]/g, '').replace(/\s+by (Automated count|Test strip|NAA with probe detection)$/i, '').replace(/\s+in (Serum or Plasma|Blood)$/i, '').trim();
  return (ALIAS.find(([re]) => re.test(s))?.[1]) || s; };
const PANELS = [['Urinalysis', /urine|\bUA\b|ketones|specific gravity|nitrite|leukocyte esterase|^casts|mucus|epithelial|^bacteria|^WBCs|^RBCs/i],
  ['Endocrine', /A1c|\bTSH\b|thyro|\bT4\b|\bT3\b|cortisol|PTH|vitamin D/i], ['Lipids', /cholesterol|triglycerides|\bLDL\b|\bHDL\b/i],
  ['Coagulation', /\bINR\b|prothrombin|\bPTT\b|fibrinogen|D-dimer/i], ['Liver', /\bALT\b|\bAST\b|alkaline phosphatase|bilirubin|^albumin$|\bGGT\b|protein total/i],
  ['Chemistry', /sodium|potassium|chloride|bicarbonate|\bCO2\b|\bBUN\b|urea|creatinine|eGFR|glucose|calcium|magnesium|phosph|albumin\/creatinine/i],
  ['Hematology', /^(WBC|RBC|hemoglobin|hematocrit|platelets|MCV|MCH|MCHC|RDW|PDW|MPV|neutrophil|lymphocyte|monocyte|eosinophil|basophil)/i],
  ['Inflammation', /C reactive|\bCRP\b|sedimentation|\bESR\b|ferritin|procalcitonin/i], ['Infectious disease', /\bHIV\b|CD4|hepatitis|HBs|HBV|HCV|serolog|antibod|IgG|IgM/i]];
const panelOf = (name) => (PANELS.find(([, re]) => re.test(name))?.[0]) || 'Other';
const CRED = { MD: 'Physician', DO: 'Physician', RN: 'Registered nurse', NP: 'Nurse practitioner', 'PA-C': 'Physician assistant', PA: 'Physician assistant', PharmD: 'Pharmacist',
  CNM: 'Nurse midwife', OD: 'Optometrist', PhD: 'Psychologist', LCSW: 'Social worker', RD: 'Dietitian', PT: 'Physical therapist' };
const authorType = (a) => { const c = String(a || '').split(',').pop().trim(); return CRED[c] || ''; };
export const deptOf = (role) => { const r = String(role || '').replace(/ Physician$/, ''); return { Cardiologist: 'Cardiology', Endocrinologist: 'Endocrinology', Otolaryngologist: 'Otolaryngology',
  Psychiatrist: 'Psychiatry', Dermatologist: 'Dermatology', Nephrologist: 'Nephrology', Neurologist: 'Neurology', Hematologist: 'Hematology', Gastroenterologist: 'Gastroenterology',
  Rheumatologist: 'Rheumatology', Urologist: 'Urology', Pulmonologist: 'Pulmonology', Ophthalmologist: 'Ophthalmology', Obstetrician: 'Obstetrics', Allergist: 'Allergy and Immunology' }[r] || r; };
const ICONS = {  // our own 16px line icons
  inbasket: '<path d="M2 9.5h3.2l1.3 2h3l1.3-2H14M2 9.5V13h12V9.5M2 9.5 4 4h8l2 5.5"/>',
  summary: '<rect x="2.5" y="2.5" width="4.5" height="4.5"/><rect x="9" y="2.5" width="4.5" height="4.5"/><rect x="2.5" y="9" width="4.5" height="4.5"/><rect x="9" y="9" width="4.5" height="4.5"/>',
  chartreview: '<path d="M4 2.5h5.5L12.5 5.5v8H4z"/><path d="M9.5 2.5v3h3M6 8.5h4.5M6 11h4.5"/>',
  results: '<path d="M2.5 13.5h11M4 11l3-3.5 2.5 2L13 5"/>',
  problems: '<path d="M6 4h7.5M6 8h7.5M6 12h7.5"/><circle cx="3" cy="4" r=".6"/><circle cx="3" cy="8" r=".6"/><circle cx="3" cy="12" r=".6"/>',
  medications: '<rect x="2.3" y="6" width="11.4" height="4.6" rx="2.3" transform="rotate(-35 8 8.3)"/><path d="M6.4 5.2l3.2 5.6"/>' };
const icon = (k) => h('span', { class: 'ico', html: `<svg viewBox="0 0 16 16" aria-hidden="true">${ICONS[k] || ''}</svg>` });

function chips(options, current, onPick) {
  return h('div', { class: 'chips', role: 'group' }, options.map(([k, label]) => h('button', { type: 'button', class: `chip${k === current ? ' on' : ''}`, 'aria-pressed': String(k === current), onclick: () => onPick(k) }, label)));
}
// A sortable grid. cols: [header, render(row) -> <td>, sortValue(row) | null]; sort: {k, dir}; rows with _inactive render muted.
function grid(cols, rows, { onRow, sel, empty = 'No matching records.', sort, onSort, groups } = {}) {
  if (!rows.length) return h('div', { class: 'none' }, empty);
  if (sort && cols[sort.k]?.[2]) { const f = cols[sort.k][2]; rows = [...rows].sort((a, b) => (String(f(a)).localeCompare(String(f(b)), undefined, { numeric: true })) * (sort.dir === 'asc' ? 1 : -1)); }
  const th = cols.map(([t, , sv], k) => h('th', sv && onSort ? { class: 'sortable', 'aria-sort': sort?.k === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none', onclick: () => onSort(k) } : {}, t,
    sv && onSort ? h('span', { class: 'sort' }, sort?.k === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '') : null));
  const tr = (r) => h('tr', { class: `${sel === r ? 'sel' : ''}${r._inactive ? ' inactive' : ''}`, onclick: onRow ? () => onRow(r) : null, style: onRow ? { cursor: 'pointer' } : null }, cols.map(([, f]) => f(r)));
  return h('div', { class: 'gridwrap' }, h('table', { class: 'grid' }, h('thead', {}, h('tr', {}, th)), h('tbody', {}, rows.map(tr))));
}
function spark(points) {
  const ys = points.map((p) => Number(p.value)).filter((v) => !Number.isNaN(v));
  if (ys.length < 2) return null;
  const lo = Math.min(...ys); const hi = Math.max(...ys); const w = 80; const hgt = 22;
  const xy = ys.map((v, i) => [2 + (i * (w - 4)) / (ys.length - 1), hgt - 3 - (hi === lo ? (hgt - 6) / 2 : ((v - lo) * (hgt - 6)) / (hi - lo))]);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'spark'); svg.setAttribute('viewBox', `0 0 ${w} ${hgt}`); svg.setAttribute('width', 52); svg.setAttribute('height', hgt); svg.setAttribute('preserveAspectRatio', 'none');
  const pl = document.createElementNS(svg.namespaceURI, 'polyline'); pl.setAttribute('points', xy.map((p) => p.join(',')).join(' ')); svg.append(pl);
  xy.forEach(([x, y], i) => { const c = document.createElementNS(svg.namespaceURI, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 1.8); if (flag(points[i])) c.setAttribute('class', 'hi'); svg.append(c); });
  return svg;
}
// the trend graph of one result over time: points, the reference band, value labels and the first and last dates
function trendGraph(name, rows, onClose) {
  const pts = rows.filter((r) => !Number.isNaN(Number(r.value))).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const W = 560; const H = 150; const L = 44; const R = 14; const T = 14; const B = 26;
  const ys = pts.map((r) => Number(r.value)); const lo0 = has(rows[0].low) ? Number(rows[0].low) : null; const hi0 = has(rows[0].high) ? Number(rows[0].high) : null;
  let lo = Math.min(...ys, ...(lo0 !== null ? [lo0] : []), ...(hi0 !== null ? [hi0] : [])); let hi = Math.max(...ys, ...(hi0 !== null ? [hi0] : []), ...(lo0 !== null ? [lo0] : []));
  if (hi === lo) { hi += 1; lo -= 1; } const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const t0 = asDate(pts[0].date).getTime(); const t1 = asDate(pts[pts.length - 1].date).getTime();
  const X = (r) => (pts.length === 1 || t1 === t0 ? L + (W - L - R) / 2 : L + ((asDate(r.date).getTime() - t0) * (W - L - R)) / (t1 - t0)); const Y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const ns = 'http://www.w3.org/2000/svg'; const el = (n, a = {}, txt) => { const e = document.createElementNS(ns, n); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (txt !== undefined) e.textContent = txt; return e; };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tgraph', role: 'img', 'aria-label': `${name} over time` });
  if (lo0 !== null || hi0 !== null) svg.append(el('rect', { class: 'band', x: L, width: W - L - R, y: Y(hi0 ?? hi), height: Math.max(0, Y(lo0 ?? lo) - Y(hi0 ?? hi)) }));
  svg.append(el('line', { class: 'axis', x1: L, x2: W - R, y1: H - B, y2: H - B }), el('text', { class: 'ax', x: L - 6, y: Y(hi - pad) + 4, 'text-anchor': 'end' }, +(hi - pad).toPrecision(3)),
    el('text', { class: 'ax', x: L - 6, y: Y(lo + pad) + 4, 'text-anchor': 'end' }, +(lo + pad).toPrecision(3)),
    el('text', { class: 'ax', x: X(pts[0]), y: H - 8, 'text-anchor': pts.length === 1 ? 'middle' : 'start' }, fmtDate(String(pts[0].date).slice(0, 10))));
  if (pts.length > 1) svg.append(el('text', { class: 'ax', x: X(pts[pts.length - 1]), y: H - 8, 'text-anchor': 'end' }, fmtDate(String(pts[pts.length - 1].date).slice(0, 10))),
    el('polyline', { class: 'line', points: pts.map((r) => `${X(r)},${Y(Number(r.value))}`).join(' ') }));
  pts.forEach((r) => svg.append(el('circle', { class: flag(r) ? 'pt hi' : 'pt', cx: X(r), cy: Y(Number(r.value)), r: 3.2 }), el('text', { class: 'pv', x: X(r), y: Y(Number(r.value)) - 7, 'text-anchor': 'middle' }, String(r.value))));
  return h('div', { class: 'trend-graph' }, h('div', { class: 'tg-head' }, h('strong', {}, name), h('span', { class: 'meta' }, ` ${cleanUnit(rows[0].unit)}${range(rows[0]) ? ` · reference ${range(rows[0])}` : ''} · ${pts.length} result${pts.length === 1 ? '' : 's'}`),
    h('span', { class: 'grow' }), h('button', { type: 'button', class: 'ghost small', onclick: onClose }, 'Close')), pts.length ? svg : h('div', { class: 'none' }, 'No numeric values to plot.'));
}

// The In Basket message as the message view shows it: a toolbar, the header fields, the body and the task.
function inBasket(c, p, go) {
  const at = String(c.inbox.received_at || '');
  return h('div', { class: 'msgview' },
    h('div', { class: 'msg-toolbar' }, h('span', { class: 'status new' }, c.inbox.category || 'Message'), h('span', { class: 'grow' }),
      h('button', { type: 'button', class: 'tb', onclick: () => go('summary') }, 'Review chart'), h('button', { type: 'button', class: 'tb', onclick: () => go('results') }, 'Results'),
      h('button', { type: 'button', class: 'tb', onclick: () => go('chartreview') }, 'Notes')),
    h('h2', { class: 'msg-subject' }, c.inbox.subject),
    h('dl', { class: 'msg-fields' }, h('dt', {}, 'From'), h('dd', {}, c.inbox.sender), h('dt', {}, 'To'), h('dd', {}, `${c.role} (you)`),
      h('dt', {}, 'Received'), h('dd', {}, fmtDate(at.slice(0, 10)), at.length > 15 ? ` ${at.slice(11, 16)}` : ''), h('dt', {}, 'Patient'), h('dd', {}, `${p.name} · MRN ${p.mrn}`)),
    h('div', { class: 'msg-body text' }, c.inbox.body),
    h('details', { class: 'taskbox', open: true }, h('summary', {}, h('span', {}, 'Task: ', h('strong', {}, c.title))),
      h('div', { class: 'md', html: md(isoToClinician(c.instructions)) })));
}

export function ehrChart(c, { onView, task = true } = {}) {
  const arr = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
  const labs = arr(c.chart.labs).map((r) => ({ ...r, full: r.text, text: labName(r.text) }));
  const ch = { ...c.chart, problems: arr(c.chart.problems), medications: arr(c.chart.medications), labs, notes: arr(c.chart.notes),
    procedures: arr(c.chart.procedures), vitals: tidyVitals(arr(c.chart.vitals)) };
  const now = asDate(c.taskDate || new Date().toISOString().slice(0, 10)).getTime() + DAY / 2;
  const within = (s, k) => k === 'all' || (now - asDate(s)) / DAY <= Number(k);
  const byDateDesc = (a, b) => String(b.date || b.authored || b.onset || '').localeCompare(String(a.date || a.authored || a.onset || ''));
  const isActive = (r) => ['active', 'recurrence', 'relapse'].includes(r.status);
  const activeProblems = ch.problems.filter(isActive); const activeMeds = ch.medications.filter((m) => m.status === 'active');
  const latest = (rows) => Object.values(Object.fromEntries([...rows].sort((a, b) => String(a.date).localeCompare(String(b.date))).map((r) => [r.text, r])));
  const latestVitals = latest(ch.vitals); const latestLabs = latest(ch.labs).filter((r) => r.value !== '' && !Number.isNaN(Number(r.value))).sort((a, b) => (flag(b) ? 1 : 0) - (flag(a) ? 1 : 0) || byDateDesc(a, b));
  const p = ch.patient; const vit = (n) => latestVitals.find((v) => v.text === n);
  const key = (label, r) => (r ? h('div', {}, h('dt', {}, label), h('dd', { class: flag(r) ? 'flag' : '' }, withUnit(r.value, r.unit), flagMark(r))) : null);

  const banner = h('div', { class: 'pheader' },
    h('div', { class: 'pname' }, h('h1', {}, p.name), h('div', { class: 'pfacts' }, h('span', {}, `${p.age} y.o. ${String(p.sex || '').slice(0, 1).toUpperCase()}`),
      h('span', {}, `DOB ${fmtDate(p.birthDate)}`), h('span', { class: 'mono' }, `MRN ${p.mrn}`))),
    h('dl', { class: 'penc' }, h('div', {}, h('dt', {}, 'Encounter'), h('dd', {}, fmtDate(c.taskDate))), h('div', {}, h('dt', {}, 'Department'), h('dd', {}, deptOf(c.role))),
      h('div', {}, h('dt', {}, 'Request from'), h('dd', {}, c.inbox.sender))),
    h('dl', { class: 'pkeys' }, key('Weight', vit('Weight')), key('BP', vit('Blood pressure')),
      latestLabs[0] && flag(latestLabs[0]) ? key(latestLabs[0].text, latestLabs[0]) : null,
      h('div', {}, h('dt', {}, 'Problems'), h('dd', {}, String(activeProblems.length))), h('div', {}, h('dt', {}, 'Medications'), h('dd', {}, String(activeMeds.length)))));

  const body = h('div', { class: 'actbody' });
  const tabs = h('nav', { class: 'acttabs', role: 'tablist' });
  let current = task ? 'inbasket' : 'summary';
  const state = { page: 0, cr: 'notes', range: 'all', ntype: 'all', find: '', note: null, rr: 'labs', mstat: 'active', graph: null, sort: {} };
  const go = (k, patch = {}) => { Object.assign(state, patch); current = k; draw(); onView?.(`tab:${k}${k === 'chartreview' ? `-${state.cr}` : k === 'results' ? `-${state.rr}` : ''}`); };
  const sorter = (id, def) => ({ sort: state.sort[id] || def, onSort: (k) => { const s = state.sort[id] || def; state.sort[id] = { k, dir: s.k === k && s.dir === 'desc' ? 'asc' : 'desc' }; draw(); } });
  const find = (placeholder) => {
    const i = h('input', { type: 'search', class: 'find', placeholder, value: state.find, 'aria-label': placeholder });
    i.addEventListener('input', () => { state.find = i.value; const pos = i.selectionStart; draw(); const j = body.querySelector('input.find'); j?.focus(); j?.setSelectionRange(pos, pos); });
    return i;
  };
  const match = (t) => !state.find.trim() || String(t).toLowerCase().includes(state.find.trim().toLowerCase());
  const openNote = (n) => { const i = ch.notes.indexOf(n); go('chartreview', { cr: 'notes', note: i, range: 'all', ntype: 'all', find: '' }); onView?.(`note:${i}`); };
  const link = (text, onclick) => h('a', { href: 'javascript:void 0', onclick }, text);

  const side = h('aside', { class: 'sidebar' },
    h('h2', {}, 'Vitals'), latestVitals.length ? h('table', { class: 'mini' }, h('tbody', {}, latestVitals.filter((v) => !/circumference/i.test(v.text)).map((v) => h('tr', {}, h('th', {}, shortVital(v.text)), h('td', {}, String(v.value ?? ''), h('span', { class: 'u' }, ` ${cleanUnit(v.unit)}`)), h('td', { class: 'when' }, ago(v.date, now)))))) : h('div', { class: 'none' }, 'None recorded'),
    h('h2', {}, 'Key results'), latestLabs.length ? h('table', { class: 'mini kr' }, h('tbody', {}, latestLabs.slice(0, 8).map((r) => h('tr', {}, h('th', { title: r.full }, r.text), h('td', {}, val(r)), h('td', { class: 'when' }, ago(r.date, now)))))) : h('div', { class: 'none' }, 'None recorded'),
    h('h2', {}, 'Problems', h('span', { class: 'n' }, String(activeProblems.length))), activeProblems.length ? h('ul', { class: 'plain' }, activeProblems.map((r) => h('li', {}, link(r.text, () => go('problems'))))) : h('div', { class: 'none' }, 'None'),
    h('h2', {}, 'Medications', h('span', { class: 'n' }, String(activeMeds.length))), activeMeds.length ? h('ul', { class: 'plain' }, activeMeds.map((r) => h('li', {}, link(r.text, () => go('medications'))))) : h('div', { class: 'none' }, 'None'),
    ch.notes.length ? [h('h2', {}, 'Recent notes'), h('ul', { class: 'plain activity' }, [...ch.notes].sort(byDateDesc).slice(0, 4).map((n) => h('li', {}, link(n.title || n.type || 'Note', () => openNote(n)), h('small', {}, `${fmtDate(n.date)} · ${ago(n.date, now)}`))))] : null);

  const panel = (title, ...kids) => h('section', { class: 'panel' }, h('h3', {}, title), h('div', { class: 'body' }, ...kids));
  const td = (x, cls) => h('td', cls ? { class: cls } : {}, x);
  const statusChip = (s) => h('span', { class: `status ${s || ''}` }, String(s || '').replace(/^\w/, (x) => x.toUpperCase()));
  const views = {
    inbasket: () => inBasket(c, p, (k) => go(k, { find: '', range: 'all' })),
    summary: () => h('div', { class: 'summarygrid' },
      panel(`Active problems (${activeProblems.length})`, activeProblems.length ? h('table', { class: 'mini wide' }, h('tbody', {}, activeProblems.map((r) => h('tr', {}, h('td', {}, r.text), h('td', { class: 'when' }, r.onset ? `since ${fmtDate(r.onset)}` : ''))))) : h('div', { class: 'none' }, 'None')),
      panel(`Active medications (${activeMeds.length})`, activeMeds.length ? h('ul', { class: 'plain' }, activeMeds.map((r) => h('li', {}, r.text, r.sig ? h('small', { class: 'sig' }, r.sig) : null))) : h('div', { class: 'none' }, 'None')),
      panel('Recent results', latestLabs.length ? h('table', { class: 'mini wide' }, h('tbody', {}, latestLabs.slice(0, 10).map((r) => h('tr', {}, h('th', { title: r.full }, r.text), h('td', {}, val(r)), h('td', { class: 'when' }, fmtDate(String(r.date).slice(0, 10))))))) : h('div', { class: 'none' }, 'None')),
      panel('Vitals', latestVitals.length ? h('table', { class: 'mini wide' }, h('tbody', {}, latestVitals.map((v) => h('tr', {}, h('th', {}, v.text), h('td', {}, String(v.value ?? ''), h('span', { class: 'u' }, ` ${cleanUnit(v.unit)}`)), h('td', { class: 'when' }, fmtDate(String(v.date).slice(0, 10))))))) : h('div', { class: 'none' }, 'None')),
      ch.notes.length ? h('div', { class: 'span2' }, panel('Recent notes', grid([['Date', (n) => td(stamp(n.date))], ['Document', (n) => td(link(n.title || 'Note'))], ['Type', (n) => td(n.type || '')], ['Author', (n) => td(n.author || '')], ['Department', (n) => td(n.service || '')]],
        [...ch.notes].sort(byDateDesc).slice(0, 5), { onRow: openNote }))) : null),
    chartreview: () => {
      const SUB = [['notes', 'Notes', ch.notes.length], ['labs', 'Labs', ch.labs.length], ['vitals', 'Vitals', ch.vitals.length], ['meds', 'Meds', ch.medications.length], ['procedures', 'Procedures', ch.procedures.length]];
      const sub = h('nav', { class: 'subtabs' }, SUB.map(([k, label, n]) => h('a', { href: 'javascript:void 0', class: state.cr === k ? 'on' : '', onclick: () => go('chartreview', { cr: k, range: 'all', ntype: 'all', find: '', note: null }) }, label, h('span', { class: 't' }, String(n)))));
      const dated = (rows, k = 'date') => rows.filter((r) => within(r[k], state.range));
      const bar = (extra) => h('div', { class: 'chipbar' }, chips(RANGES, state.range, (k) => go('chartreview', { range: k, note: null })), extra, h('span', { class: 'grow' }), find('Find in list'));
      const count = (n, total, what) => h('div', { class: 'paging' }, `${n} of ${total} ${what}`);
      if (state.cr === 'notes') {
        const types = [...new Set(ch.notes.map((n) => n.type).filter(Boolean))].sort();
        const rows = dated(ch.notes).filter((n) => (state.ntype === 'all' || n.type === state.ntype) && match(`${n.title} ${n.type} ${n.author} ${n.service} ${n.text}`));
        const sel = state.note !== null ? ch.notes[state.note] : null;
        const g = grid([['Date', (n) => td(stamp(n.date)), (n) => n.date], ['Document', (n) => td(link(n.title || 'Note')), (n) => n.title], ['Type', (n) => td(n.type || ''), (n) => n.type],
          ['Author', (n) => td(n.author || ''), (n) => n.author], ['Author type', (n) => td(authorType(n.author)), (n) => authorType(n.author)], ['Department', (n) => td(n.service || ''), (n) => n.service],
          ['Status', () => td(statusChip('final'))]], rows, { sel, onRow: (n) => { state.note = ch.notes.indexOf(n); draw(); onView?.(`note:${state.note}`); }, ...sorter('notes', { k: 0, dir: 'desc' }) });
        const pane = sel ? h('article', { class: 'reading-pane' }, h('div', { class: 'preview-head' }, h('div', {}, h('strong', {}, sel.title || 'Note'),
          h('div', { class: 'meta' }, [sel.type, sel.author, authorType(sel.author), sel.service].filter(Boolean).join(' · '), ' · ', fmtDate(String(sel.date).slice(0, 10)), timeOf(sel.date) ? ` ${timeOf(sel.date)}` : '')),
        h('span', { class: 'status final' }, 'Final'), h('button', { type: 'button', class: 'ghost small', onclick: () => { state.note = null; draw(); } }, 'Close')), h('div', { class: 'text' }, sel.text))
          : h('div', { class: 'reading-pane empty-pane' }, 'Select a document to read it here.');
        return h('div', {}, sub, bar(types.length > 1 ? chips([['all', 'All types'], ...types.map((x) => [x, x])], state.ntype, (k) => go('chartreview', { ntype: k, note: null })) : null),
          count(rows.length, ch.notes.length, 'documents'), h('div', { class: 'cr-split' }, g, pane));
      }
      if (state.cr === 'labs' || state.cr === 'vitals') {
        const src = state.cr === 'labs' ? ch.labs : ch.vitals; const rows = dated(src).filter((r) => match(r.text));
        return h('div', {}, sub, bar(), count(rows.length, src.length, 'results'), grid([['Date', (r) => td(stamp(r.date)), (r) => r.date], [state.cr === 'labs' ? 'Test' : 'Vital', (r) => h('td', { title: r.full || r.text }, r.text), (r) => r.text],
          ['Result', (r) => td(val(r), 'nw'), (r) => Number(r.value)], ...(state.cr === 'labs' ? [['Reference', (r) => td(range(r), 'nw muted')], ['Flag', (r) => td(flag(r) ? h('span', { class: 'flag' }, flag(r) === 'high' ? 'High' : 'Low') : '')]] : [])],
        rows, sorter(state.cr, { k: 0, dir: 'desc' })));
      }
      if (state.cr === 'meds') {
        const rows = ch.medications.filter((m) => within(m.authored, state.range) && match(`${m.text} ${m.sig} ${m.reason}`)).map((m) => ({ ...m, _inactive: m.status !== 'active' }));
        return h('div', {}, sub, bar(), count(rows.length, ch.medications.length, 'medications'), grid([['Ordered', (m) => td(fmtDate(m.authored), 'nw'), (m) => m.authored], ['Medication', (m) => td(m.text), (m) => m.text],
          ['Sig', (m) => td(m.sig || '')], ['Indication', (m) => td(m.reason || '')], ['Status', (m) => td(statusChip(m.status)), (m) => m.status]], rows, sorter('meds', { k: 0, dir: 'desc' })));
      }
      const rows = dated(ch.procedures).filter((r) => match(r.text));
      return h('div', {}, sub, bar(), count(rows.length, ch.procedures.length, 'procedures'), grid([['Date', (r) => td(fmtDate(r.date), 'nw'), (r) => r.date], ['Procedure', (r) => td(r.text), (r) => r.text], ['Status', () => td(statusChip('completed'))]],
        rows, { ...sorter('procedures', { k: 0, dir: 'desc' }), empty: 'No procedures recorded.' }));
    },
    results: () => {
      const src = state.rr === 'labs' ? ch.labs : ch.vitals;
      const rows = src.filter((r) => within(r.date, state.range) && match(r.text));
      const all = [...new Set(rows.map((r) => r.date))].sort().reverse();
      // as many date columns as fit beside the fixed columns (no column is ever cut off); older dates page in with the arrows
      const fixed = state.rr === 'labs' ? 362 : 292; const avail = (body.clientWidth || 640) - 30; const fit = Math.max(1, Math.floor((avail - fixed) / 76));
      const pages = Math.max(1, Math.ceil(all.length / fit)); state.page = Math.min(state.page, pages - 1);
      const cols = all.slice(state.page * fit, state.page * fit + fit);
      const byTest = rows.reduce((m, r) => { (m[r.text] = m[r.text] || []).push(r); return m; }, {});
      const head = h('div', { class: 'headrow' }, h('h2', {}, 'Results Review'), h('div', { class: 'seg' }, [['labs', 'Labs'], ['vitals', 'Vitals']].map(([k, l]) => h('button', { type: 'button', class: state.rr === k ? 'on' : '', onclick: () => go('results', { rr: k, find: '', page: 0, graph: null }) }, l))));
      const bar = h('div', { class: 'chipbar' }, chips(RANGES, state.range, (k) => go('results', { range: k, page: 0 })), h('span', { class: 'grow' }), find('Find in list'));
      if (!Object.keys(byTest).length) return h('div', {}, head, bar, h('div', { class: 'none' }, 'No matching results.'));
      const pager = pages > 1 ? h('div', { class: 'pager' }, h('button', { type: 'button', class: 'ghost small', disabled: state.page >= pages - 1, onclick: () => { state.page += 1; draw(); } }, '◀ Older'),
        h('span', { class: 'meta' }, `${state.page * fit + 1}–${Math.min(all.length, state.page * fit + fit)} of ${all.length} dates`),
        h('button', { type: 'button', class: 'ghost small', disabled: state.page === 0, onclick: () => { state.page -= 1; draw(); } }, 'Newer ▶')) : null;
      const colHead = (s) => { const m = String(s).match(/^(\d{4})-(\d{2}-\d{2})[ T]?(\d{2}:\d{2})?/); return h('th', { class: 'nw' }, m ? fmtDate(`${m[1]}-${m[2]}`).replace(/, \d{4}$/, '') : s, m ? h('small', {}, `${m[1]}${m[3] ? ` ${m[3]}` : ''}`) : null); };  // Jun 3 over 2024 10:00
      const ncol = (state.rr === 'labs' ? 4 : 3) + cols.length;
      const colgroup = h('colgroup', {}, h('col', { style: { width: '160px' } }), h('col', { style: { width: '62px' } }), state.rr === 'labs' ? h('col', { style: { width: '70px' } }) : null, h('col', { style: { width: '70px' } }), cols.map(() => h('col', {})));
      const groups = state.rr === 'labs' ? [...PANELS.map(([n]) => n), 'Other'] : ['Vitals'];
      const body2 = [];
      for (const g of groups) {
        const tests = Object.entries(byTest).filter(([name]) => (state.rr === 'labs' ? panelOf(name) === g : true))
          .sort((a, b) => String(b[1].map((r) => r.date).sort().pop()).localeCompare(String(a[1].map((r) => r.date).sort().pop())));
        if (!tests.length) continue;
        body2.push(h('tr', { class: 'grouprow' }, h('td', { colspan: ncol }, g, h('span', { class: 't' }, String(tests.length)))));
        for (const [name, rs] of tests) {
          const by = Object.fromEntries(rs.map((r) => [r.date, r]));
          const asc = [...rs].sort((a, b) => String(a.date).localeCompare(String(b.date))); const last = asc[asc.length - 1];
          const lm = String(last.date).match(/^(\d{4}-\d{2}-\d{2})/);
          body2.push(h('tr', { class: `clickable${state.graph === name ? ' sel' : ''}`, title: 'Show the trend', onclick: () => { state.graph = state.graph === name ? null : name; draw(); onView?.('results-graph'); } },
            h('td', { title: rs[0].full || name }, name, h('small', {}, cleanUnit(rs[0].unit))), h('td', {}, spark(asc)), state.rr === 'labs' ? h('td', { class: 'nw muted' }, range(rs[0])) : null,
            h('td', { class: `nw val latest${flag(last) ? ' flag' : ''}` }, String(last.value ?? ''), flagMark(last), h('small', {}, lm ? fmtDate(lm[1]).replace(/, \d{4}$/, '') : '')),
            cols.map((d) => h('td', { class: `nw val${by[d] && flag(by[d]) ? ' flag' : ''}` }, by[d] ? [String(by[d].value ?? ''), flagMark(by[d])] : ''))));
        }
      }
      const table = h('div', { class: 'gridwrap trend' }, h('table', { class: 'grid', style: { width: '100%' } }, colgroup,
        h('thead', {}, h('tr', {}, h('th', {}, state.rr === 'labs' ? 'Test' : 'Vital'), h('th', {}, 'Trend'), state.rr === 'labs' ? h('th', {}, 'Ref. range') : null, h('th', { class: 'latest' }, 'Latest'), cols.map(colHead))),
        h('tbody', {}, body2)));
      const graph = state.graph && byTest[state.graph] ? trendGraph(state.graph, byTest[state.graph], () => { state.graph = null; draw(); }) : null;
      return h('div', {}, head, bar, h('div', { class: 'spread' }, h('div', { class: 'paging' }, `${Object.keys(byTest).length} ${state.rr === 'labs' ? 'tests' : 'vitals'}, ${rows.length} results · newest first · select a row for its trend`), pager), graph, table);
    },
    problems: () => h('div', {}, h('div', { class: 'headrow' }, h('h2', {}, 'Problem List'), h('span', { class: 'meta' }, `${activeProblems.length} active, ${ch.problems.length - activeProblems.length} resolved or inactive`)),
      grid([['Problem', (r) => td(r.text), (r) => r.text], ['Noted', (r) => td(fmtDate(r.onset), 'nw'), (r) => r.onset], ['Status', (r) => td(statusChip(isActive(r) ? 'active' : r.status)), (r) => (isActive(r) ? 0 : 1)],
        ['Resolved', (r) => td(fmtDate(r.abated), 'nw'), (r) => r.abated]],
      ch.problems.map((r) => ({ ...r, _inactive: !isActive(r) })), { empty: 'No problems recorded.', ...sorter('problems', { k: 2, dir: 'asc' }) })),
    medications: () => {
      const rows = (state.mstat === 'active' ? activeMeds : ch.medications).filter((m) => match(`${m.text} ${m.sig}`)).map((m) => ({ ...m, _inactive: m.status !== 'active' }));
      return h('div', {}, h('div', { class: 'headrow' }, h('h2', {}, 'Medications'), h('span', { class: 'meta' }, `${activeMeds.length} active`)),
        h('div', { class: 'chipbar' }, chips([['active', `Active (${activeMeds.length})`], ['all', `All (${ch.medications.length})`]], state.mstat, (k) => go('medications', { mstat: k })), h('span', { class: 'grow' }), find('Find in list')),
        grid([['Medication', (m) => td(h('strong', {}, m.text)), (m) => m.text], ['Sig', (m) => td(m.sig || h('span', { class: 'muted' }, 'No sig recorded'))], ['Indication', (m) => td(m.reason || '')],
          ['Start', (m) => td(fmtDate(m.authored), 'nw'), (m) => m.authored], ['Status', (m) => td(statusChip(m.status)), (m) => m.status]], rows, { empty: 'No medications.', ...sorter('meds2', { k: 3, dir: 'desc' }) }));
    },
  };
  const TABS2 = [...(task ? [['inbasket', 'In Basket']] : []), ['summary', 'Summary'], ['chartreview', 'Chart Review'], ['results', 'Results Review'], ['problems', 'Problem List'], ['medications', 'Medications']];
  function draw() {
    tabs.replaceChildren(...TABS2.map(([k, label]) => h('a', { href: 'javascript:void 0', role: 'tab', 'aria-selected': String(current === k), class: current === k ? 'on' : '', onclick: () => go(k, { find: '', range: 'all' }) }, icon(k), label)));
    body.replaceChildren(views[current]());
  }
  draw(); onView?.(`tab:${current}`);
  addEventListener('resize', () => { if (current === 'results' && body.isConnected) draw(); });
  return { banner, side, main: h('div', { class: 'chartmain' }, tabs, body) };
}

// The whole review screen: the app bar, the patient header, then the storyboard, the chart activities and the review panel on the right.
export function caseLayout({ c, top, right, onView }) {
  const chart = ehrChart(c, { onView });
  return h('div', { class: 'ehr-shell' }, top, chart.banner,
    h('div', { class: 'ehr-grid' }, chart.side, h('section', { class: 'ehr-main' }, chart.main), h('section', { class: 'ehr-right' }, right)));
}
