// The patient chart, in the modules the study EHR shows: summary, problems, medications, results, vitals, notes, procedures.
import { h, md, fmtDate } from './ui.js?v=d70d513cd6';

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

// ---------- EHR chart (Study B and Study A'): the layout of our GUI v3 workstation. A patient banner, a storyboard with vitals, key
// results, problems and medications, and activity tabs: Summary, Chart Review (notes, labs, vitals, medications and procedures with date
// and type filters and a preview), Results Review (a trend table with flags and sparklines), Problem List and Medications.
const DAY = 864e5;
const asDate = (s) => { const x = String(s || ''); return new Date(x.length <= 10 ? `${x}T12:00:00Z` : x.replace(' ', 'T') + (x.length === 16 ? ':00Z' : '')); };
function ago(s, now) {
  const d = Math.round((now - asDate(s)) / DAY);
  if (Number.isNaN(d)) return '';
  return d <= 0 ? 'today' : d < 14 ? `${d} d ago` : d < 60 ? `${Math.round(d / 7)} wk ago` : d < 730 ? `${Math.round(d / 30.4)} mo ago` : `${Math.round(d / 365)} y ago`;
}
const RANGES = [['all', 'All dates', Infinity], ['30', 'Last 30 days', 30], ['182', 'Last 6 months', 182], ['365', 'Last year', 365]];
const shortVital = (t) => ({ 'Blood pressure': 'BP', 'Heart rate': 'Pulse', 'Respiratory rate': 'Resp', 'Oxygen saturation': 'SpO2', Temperature: 'Temp', 'Pain score': 'Pain' }[t] || t);
const flagMark = (r) => { const f = flag(r); return f ? h('span', { class: 'fl' }, f === 'high' ? ' H' : ' L') : null; };
const val = (r) => h('span', { class: flag(r) ? 'flag' : '' }, String(r.value ?? ''), h('span', { class: 'u' }, ` ${cleanUnit(r.unit)}`), flagMark(r));

function chips(options, current, onPick) {
  return h('div', { class: 'chips' }, options.map(([k, label]) => h('button', { type: 'button', class: `chip${k === current ? ' on' : ''}`, onclick: () => onPick(k) }, label)));
}
function grid(cols, rows, { onRow, sel, empty = 'No matching records.' } = {}) {
  if (!rows.length) return h('div', { class: 'none' }, empty);
  return h('div', { class: 'gridwrap' }, h('table', { class: 'grid' }, h('thead', {}, h('tr', {}, cols.map(([t]) => h('th', {}, t)))),
    h('tbody', {}, rows.map((r, i) => h('tr', { class: `${sel === r ? 'sel' : ''}${r._inactive ? ' inactive' : ''}`, onclick: onRow ? () => onRow(r, i) : null, style: onRow ? { cursor: 'pointer' } : null },
      cols.map(([, f]) => f(r)))))));
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

export function ehrChart(c, { onView, task } = {}) {
  const arr = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
  const ch = { ...c.chart, problems: arr(c.chart.problems), medications: arr(c.chart.medications), labs: arr(c.chart.labs), notes: arr(c.chart.notes),
    procedures: arr(c.chart.procedures), vitals: tidyVitals(arr(c.chart.vitals)) };
  const now = asDate(c.taskDate || new Date().toISOString().slice(0, 10)).getTime() + DAY / 2;
  const within = (s, k) => k === 'all' || (now - asDate(s)) / DAY <= Number(k);
  const byDateDesc = (a, b) => String(b.date || b.authored || b.onset || '').localeCompare(String(a.date || a.authored || a.onset || ''));
  const isActive = (r) => ['active', 'recurrence', 'relapse'].includes(r.status);
  const activeProblems = ch.problems.filter(isActive); const activeMeds = ch.medications.filter((m) => m.status === 'active');
  const latest = (rows) => Object.values(Object.fromEntries([...rows].sort((a, b) => String(a.date).localeCompare(String(b.date))).map((r) => [r.text, r])));
  const latestVitals = latest(ch.vitals); const latestLabs = latest(ch.labs).filter((r) => r.value !== '' && !Number.isNaN(Number(r.value))).sort((a, b) => (flag(b) ? 1 : 0) - (flag(a) ? 1 : 0) || byDateDesc(a, b));
  const p = ch.patient;
  const weight = latestVitals.find((v) => v.text === 'Weight');

  const banner = h('div', { class: 'pheader' },
    h('div', { class: 'pname' }, h('h1', {}, p.name), h('div', { class: 'pfacts' }, h('span', {}, `${p.age} y.o. ${String(p.sex || '').slice(0, 1).toUpperCase()}`),
      h('span', {}, `DOB ${fmtDate(p.birthDate)}`), h('span', { class: 'mono' }, `MRN ${p.mrn}`))),
    h('dl', { class: 'pkeys' },
      weight ? h('div', {}, h('dt', {}, 'Weight'), h('dd', {}, withUnit(weight.value, weight.unit), h('small', {}, fmtDate(weight.date)))) : null,
      latestLabs[0] && flag(latestLabs[0]) ? h('div', {}, h('dt', {}, latestLabs[0].text.replace(/\s*\[.*$/, '')), h('dd', { class: 'flag' }, withUnit(latestLabs[0].value, latestLabs[0].unit), flagMark(latestLabs[0]), h('small', {}, fmtDate(latestLabs[0].date)))) : null,
      h('div', {}, h('dt', {}, 'Active problems'), h('dd', {}, String(activeProblems.length))),
      h('div', {}, h('dt', {}, 'Active medications'), h('dd', {}, String(activeMeds.length)))));

  const body = h('div', { class: 'actbody' });
  const tabs = h('nav', { class: 'acttabs', role: 'tablist' });
  let current = task ? 'inbasket' : 'summary'; const state = { page: 0, cr: 'notes', range: 'all', ntype: 'all', find: '', note: null, rr: 'labs', mstat: 'active' };
  const go = (k, patch = {}) => { Object.assign(state, patch); current = k; draw(); onView?.(`tab:${k}${k === 'chartreview' ? `-${state.cr}` : k === 'results' ? `-${state.rr}` : ''}`); };
  const find = (placeholder) => {
    const i = h('input', { type: 'search', class: 'find', placeholder, value: state.find, 'aria-label': placeholder });
    i.addEventListener('input', () => { state.find = i.value; const pos = i.selectionStart; draw(); const j = body.querySelector('input.find'); j?.focus(); j?.setSelectionRange(pos, pos); });
    return i;
  };
  const match = (t) => !state.find.trim() || String(t).toLowerCase().includes(state.find.trim().toLowerCase());
  const openNote = (n) => { const i = ch.notes.indexOf(n); go('chartreview', { cr: 'notes', note: i, range: 'all', ntype: 'all', find: '' }); onView?.(`note:${i}`); };

  const side = h('aside', { class: 'sidebar' },
    h('h2', {}, 'Vitals'), latestVitals.length ? h('table', { class: 'mini' }, h('tbody', {}, latestVitals.filter((v) => !/circumference/i.test(v.text)).map((v) => h('tr', {}, h('th', {}, shortVital(v.text)), h('td', {}, String(v.value ?? ''), h('span', { class: 'u' }, ` ${cleanUnit(v.unit)}`)), h('td', { class: 'when' }, ago(v.date, now)))))) : h('div', { class: 'none' }, 'None recorded'),
    h('h2', {}, 'Key results'), latestLabs.length ? h('table', { class: 'mini kr' }, h('tbody', {}, latestLabs.slice(0, 8).map((r) => h('tr', {}, h('th', { title: r.text }, r.text.replace(/\s*\[.*$/, '')), h('td', {}, val(r)), h('td', { class: 'when' }, ago(r.date, now)))))) : h('div', { class: 'none' }, 'None recorded'),
    h('h2', {}, 'Problems', h('span', { class: 'n' }, String(activeProblems.length))), activeProblems.length ? h('ul', { class: 'plain' }, activeProblems.map((r) => h('li', {}, h('a', { href: 'javascript:void 0', onclick: () => go('problems') }, r.text)))) : h('div', { class: 'none' }, 'None'),
    h('h2', {}, 'Medications', h('span', { class: 'n' }, String(activeMeds.length))), activeMeds.length ? h('ul', { class: 'plain' }, activeMeds.map((r) => h('li', {}, h('a', { href: 'javascript:void 0', onclick: () => go('medications') }, r.text)))) : h('div', { class: 'none' }, 'None'),
    ch.notes.length ? [h('h2', {}, 'Recent notes'), h('ul', { class: 'plain activity' }, [...ch.notes].sort(byDateDesc).slice(0, 4).map((n) => h('li', {}, h('a', { href: 'javascript:void 0', onclick: () => openNote(n) }, n.title || n.type || 'Note'), h('small', {}, `${fmtDate(n.date)} · ${ago(n.date, now)}`))))] : null);

  const panel = (title, ...kids) => h('section', { class: 'panel' }, h('h3', {}, title), h('div', { class: 'body' }, ...kids));
  const views = {
    inbasket: () => task,
    summary: () => h('div', { class: 'summarygrid' },
      panel('Active problems', activeProblems.length ? h('ul', { class: 'plain' }, activeProblems.map((r) => h('li', {}, r.text, r.onset ? h('span', { class: 't' }, `since ${fmtDate(r.onset)}`) : null))) : h('div', { class: 'none' }, 'None')),
      panel('Active medications', activeMeds.length ? h('ul', { class: 'plain' }, activeMeds.map((r) => h('li', {}, r.text, r.sig ? h('small', { class: 'sig' }, r.sig) : null))) : h('div', { class: 'none' }, 'None')),
      panel('Recent results', latestLabs.length ? h('table', { class: 'mini' }, h('tbody', {}, latestLabs.slice(0, 10).map((r) => h('tr', {}, h('th', { title: r.text }, r.text.replace(/\s*\[.*$/, '')), h('td', {}, val(r)), h('td', { class: 'when' }, fmtDate(r.date)))))) : h('div', { class: 'none' }, 'None')),
      panel('Latest vitals', latestVitals.length ? h('table', { class: 'mini' }, h('tbody', {}, latestVitals.map((v) => h('tr', {}, h('th', {}, v.text), h('td', {}, String(v.value ?? ''), h('span', { class: 'u' }, ` ${cleanUnit(v.unit)}`)), h('td', { class: 'when' }, fmtDate(v.date)))))) : h('div', { class: 'none' }, 'None')),
      ch.notes.length ? h('div', { class: 'span2' }, panel('Recent notes', grid([['Document', (n) => h('td', {}, h('a', { href: 'javascript:void 0' }, n.title || 'Note'))], ['Type', (n) => h('td', {}, n.type || '')], ['Author', (n) => h('td', {}, n.author || '')], ['Date', (n) => h('td', { class: 'nw' }, fmtDate(n.date))]],
        [...ch.notes].sort(byDateDesc).slice(0, 5), { onRow: openNote }))) : null),
    chartreview: () => {
      const SUB = [['notes', 'Notes', ch.notes.length], ['labs', 'Labs', ch.labs.length], ['vitals', 'Vitals', ch.vitals.length], ['meds', 'Meds', ch.medications.length], ['procedures', 'Procedures', ch.procedures.length]];
      const sub = h('nav', { class: 'subtabs' }, SUB.map(([k, label, n]) => h('a', { href: 'javascript:void 0', class: state.cr === k ? 'on' : '', onclick: () => go('chartreview', { cr: k, range: 'all', ntype: 'all', find: '', note: null }) }, label, h('span', { class: 't' }, String(n)))));
      const dated = (rows, key = 'date') => rows.filter((r) => within(r[key], state.range));
      const bar = (extra) => h('div', { class: 'chipbar' }, chips(RANGES.map(([k, l]) => [k, l]), state.range, (k) => go('chartreview', { range: k, note: null })), extra, h('span', { class: 'grow' }), find('Find in list'));
      let content;
      if (state.cr === 'notes') {
        const types = [...new Set(ch.notes.map((n) => n.type).filter(Boolean))].sort();
        const rows = dated(ch.notes).filter((n) => (state.ntype === 'all' || n.type === state.ntype) && match(`${n.title} ${n.type} ${n.author} ${n.service} ${n.text}`)).sort(byDateDesc);
        const sel = state.note !== null ? ch.notes[state.note] : null;
        content = [bar(types.length > 1 ? chips([['all', 'All types'], ...types.map((t) => [t, t])], state.ntype, (k) => go('chartreview', { ntype: k, note: null })) : null),
          h('div', { class: 'paging' }, `Showing ${rows.length} of ${ch.notes.length} records · newest first`),
          grid([['Document', (n) => h('td', {}, h('a', { href: 'javascript:void 0' }, n.title || 'Note'))], ['Type', (n) => h('td', {}, n.type || '')], ['Author', (n) => h('td', {}, n.author || '')],
            ['Department', (n) => h('td', {}, n.service || '')], ['Date', (n) => h('td', { class: 'nw' }, fmtStamp(n.date))], ['Status', () => h('td', {}, h('span', { class: 'status final' }, 'final'))]],
          rows, { sel, onRow: (n) => { state.note = ch.notes.indexOf(n); draw(); onView?.(`note:${state.note}`); } }),
          sel ? h('article', { class: 'preview-pane' }, h('div', { class: 'preview-head' }, h('div', {}, h('strong', {}, sel.title || 'Note'), h('div', { class: 'meta' }, [sel.type, sel.author, sel.service, fmtStamp(sel.date)].filter(Boolean).join(' · '))),
            h('button', { type: 'button', class: 'ghost small', onclick: () => { state.note = null; draw(); } }, 'Close')), h('div', { class: 'text' }, sel.text)) : h('div', { class: 'paging' }, 'Select a document to read it here.')];
      } else if (state.cr === 'labs' || state.cr === 'vitals') {
        const src = state.cr === 'labs' ? ch.labs : ch.vitals;
        const rows = dated(src).filter((r) => match(r.text)).sort(byDateDesc);
        content = [bar(), h('div', { class: 'paging' }, `Showing ${rows.length} of ${src.length} results · newest first`),
          grid([[state.cr === 'labs' ? 'Test' : 'Vital', (r) => h('td', {}, r.text)], ['Result', (r) => h('td', { class: 'nw' }, val(r))], ...(state.cr === 'labs' ? [['Reference range', (r) => h('td', { class: 'nw muted' }, range(r))]] : []),
            ['Date', (r) => h('td', { class: 'nw' }, fmtStamp(r.date))]], rows)];
      } else if (state.cr === 'meds') {
        const rows = ch.medications.filter((m) => within(m.authored, state.range) && match(`${m.text} ${m.sig} ${m.reason}`)).sort(byDateDesc).map((m) => ({ ...m, _inactive: m.status !== 'active' }));
        content = [bar(), h('div', { class: 'paging' }, `Showing ${rows.length} of ${ch.medications.length} records`),
          grid([['Medication', (m) => h('td', {}, m.text, m.sig ? h('small', {}, m.sig) : null, m.reason ? h('small', {}, `Indication: ${m.reason}`) : null)], ['Status', (m) => h('td', {}, h('span', { class: `status ${m.status}` }, m.status || ''))],
            ['Ordered', (m) => h('td', { class: 'nw' }, fmtDate(m.authored))]], rows)];
      } else {
        const rows = dated(ch.procedures).filter((r) => match(r.text)).sort(byDateDesc);
        content = [bar(), h('div', { class: 'paging' }, `Showing ${rows.length} of ${ch.procedures.length} records · newest first`),
          grid([['Procedure', (r) => h('td', {}, r.text)], ['Date', (r) => h('td', { class: 'nw' }, fmtDate(r.date))], ['Status', () => h('td', {}, h('span', { class: 'status completed' }, 'completed'))]], rows)];
      }
      return h('div', {}, sub, ...content);
    },
    results: () => {
      const src = state.rr === 'labs' ? ch.labs : ch.vitals;
      const rows = src.filter((r) => within(r.date, state.range) && match(r.text));
      const all = [...new Set(rows.map((r) => r.date))].sort().reverse();
      // as many date columns as fit beside the fixed columns (no column is ever cut off); older dates page in with the arrows
      const fixed = state.rr === 'labs' ? 362 : 292; const avail = (body.clientWidth || 640) - 30; const fit = Math.max(1, Math.floor((avail - fixed) / 76));
      const pages = Math.max(1, Math.ceil(all.length / fit)); state.page = Math.min(state.page, pages - 1);
      const cols = all.slice(state.page * fit, state.page * fit + fit);
      const tests = Object.entries(rows.reduce((m, r) => { (m[r.text] = m[r.text] || []).push(r); return m; }, {}))
        .sort((a, b) => String(b[1].map((r) => r.date).sort().pop()).localeCompare(String(a[1].map((r) => r.date).sort().pop())));
      const head = h('div', { class: 'headrow' }, h('h2', {}, 'Results Review'), h('div', { class: 'seg' }, [['labs', 'Labs'], ['vitals', 'Vitals']].map(([k, l]) => h('button', { type: 'button', class: state.rr === k ? 'on' : '', onclick: () => go('results', { rr: k, find: '', page: 0 }) }, l))));
      const bar = h('div', { class: 'chipbar' }, chips(RANGES.map(([k, l]) => [k, l]), state.range, (k) => go('results', { range: k, page: 0 })), h('span', { class: 'grow' }), find('Find in list'));
      if (!tests.length) return h('div', {}, head, bar, h('div', { class: 'none' }, 'No matching results.'));
      const pager = pages > 1 ? h('div', { class: 'pager' }, h('button', { type: 'button', class: 'ghost small', disabled: state.page >= pages - 1, onclick: () => { state.page += 1; draw(); } }, '◀ Older'),
        h('span', { class: 'meta' }, `${state.page * fit + 1}–${Math.min(all.length, state.page * fit + fit)} of ${all.length} dates`),
        h('button', { type: 'button', class: 'ghost small', disabled: state.page === 0, onclick: () => { state.page -= 1; draw(); } }, 'Newer ▶')) : null;
      const colHead = (s) => { const m = String(s).match(/^(\d{4})-(\d{2}-\d{2})[ T]?(\d{2}:\d{2})?/); return h('th', { class: 'nw' }, m ? fmtDate(`${m[1]}-${m[2]}`).replace(/, \d{4}$/, '') : s, m ? h('small', {}, `${m[1]}${m[3] ? ` ${m[3]}` : ''}`) : null); };  // Jun 3 over 2024 10:00, so a narrow column never clips
      // fixed widths for Test, Trend, Ref. range and Latest; the date columns share the rest of the panel
      const colgroup = h('colgroup', {}, h('col', { style: { width: '160px' } }), h('col', { style: { width: '62px' } }), state.rr === 'labs' ? h('col', { style: { width: '70px' } }) : null, h('col', { style: { width: '70px' } }), cols.map(() => h('col', {})));
      const table = h('div', { class: 'gridwrap trend' }, h('table', { class: 'grid', style: { width: '100%' } }, colgroup,
        h('thead', {}, h('tr', {}, h('th', {}, state.rr === 'labs' ? 'Test' : 'Vital'), h('th', {}, 'Trend'), state.rr === 'labs' ? h('th', {}, 'Ref. range') : null, h('th', { class: 'latest' }, 'Latest'), cols.map(colHead))),
        h('tbody', {}, tests.map(([name, rs]) => {
          const by = Object.fromEntries(rs.map((r) => [r.date, r]));
          const asc = [...rs].sort((a, b) => String(a.date).localeCompare(String(b.date)));
          const last = asc[asc.length - 1]; const lm = String(last.date).match(/^(\d{4}-\d{2}-\d{2})/);
          return h('tr', {}, h('td', {}, name, h('small', {}, cleanUnit(rs[0].unit))), h('td', {}, spark(asc)), state.rr === 'labs' ? h('td', { class: 'nw muted' }, range(rs[0])) : null,
            h('td', { class: `nw val latest${flag(last) ? ' flag' : ''}` }, String(last.value ?? ''), flagMark(last), h('small', {}, lm ? fmtDate(lm[1]).replace(/, \d{4}$/, '') : '')),
            cols.map((d) => h('td', { class: `nw val${by[d] && flag(by[d]) ? ' flag' : ''}` }, by[d] ? [String(by[d].value ?? ''), flagMark(by[d])] : '')));
        }))));
      return h('div', {}, head, bar, h('div', { class: 'spread' }, h('div', { class: 'paging' }, `Showing ${rows.length} of ${src.length} results · newest first`), pager), table);
    },
    problems: () => h('div', {}, h('div', { class: 'headrow' }, h('h2', {}, 'Problem List')),
      grid([['Problem', (r) => h('td', {}, r.text)], ['Status', (r) => h('td', {}, h('span', { class: `status ${isActive(r) ? 'active' : ''}` }, r.status || ''))], ['Noted', (r) => h('td', { class: 'nw' }, fmtDate(r.onset))], ['Resolved', (r) => h('td', { class: 'nw' }, fmtDate(r.abated))]],
        [...activeProblems.sort(byDateDesc), ...ch.problems.filter((r) => !isActive(r)).sort(byDateDesc).map((r) => ({ ...r, _inactive: true }))], { empty: 'No problems recorded.' })),
    medications: () => {
      const rows = (state.mstat === 'active' ? activeMeds : ch.medications).filter((m) => match(`${m.text} ${m.sig}`)).sort(byDateDesc).map((m) => ({ ...m, _inactive: m.status !== 'active' }));
      return h('div', {}, h('div', { class: 'headrow' }, h('h2', {}, 'Medications')), h('div', { class: 'chipbar' }, chips([['active', `Active (${activeMeds.length})`], ['all', `All (${ch.medications.length})`]], state.mstat, (k) => go('medications', { mstat: k })), h('span', { class: 'grow' }), find('Find in list')),
        grid([['Medication', (m) => h('td', {}, m.text, m.sig ? h('small', {}, m.sig) : null, m.reason ? h('small', {}, `Indication: ${m.reason}`) : null)], ['Status', (m) => h('td', {}, h('span', { class: `status ${m.status}` }, m.status || ''))],
          ['Ordered', (m) => h('td', { class: 'nw' }, fmtDate(m.authored))]], rows, { empty: 'No medications.' }));
    },
  };
  const TABS2 = [...(task ? [['inbasket', 'In Basket']] : []), ['summary', 'Summary'], ['chartreview', 'Chart Review'], ['results', 'Results Review'], ['problems', 'Problem List'], ['medications', 'Medications']];
  function draw() {
    tabs.replaceChildren(...TABS2.map(([k, label]) => h('a', { href: 'javascript:void 0', role: 'tab', 'aria-selected': String(current === k), class: current === k ? 'on' : '', onclick: () => go(k, { find: '', range: 'all' }) }, label)));
    body.replaceChildren(views[current]());
  }
  draw(); onView?.(`tab:${current}`);
  addEventListener('resize', () => { if (current === 'results' && body.isConnected) draw(); });
  return { banner, side, main: h('div', { class: 'chartmain' }, tabs, body) };
}

// The whole review screen: the app bar, the patient banner, then the storyboard, the inbox item with the task above the chart, and the
// review panel on the right. The inbox item and the task open first, in the In Basket tab.
export function caseLayout({ c, top, right, onView }) {
  const chart = ehrChart(c, { onView, task: renderTask(c) });
  return h('div', { class: 'ehr-shell' }, top, chart.banner,
    h('div', { class: 'ehr-grid' }, chart.side, h('section', { class: 'ehr-main' }, chart.main), h('section', { class: 'ehr-right' }, right)));
}
