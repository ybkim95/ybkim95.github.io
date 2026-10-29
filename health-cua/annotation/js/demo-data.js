// Two invented cases for the public demo (?demo). They are not study cases and are never scored.
const chart = (over) => ({
  patient: { name: 'Avery Demo', sex: 'female', birthDate: '1958-03-14', age: 66, mrn: 'DEMO-0001' },
  problems: [{ text: 'Essential hypertension', onset: '2015-04-02', status: 'active' }, { text: 'Type 2 diabetes mellitus', onset: '2017-09-11', status: 'active' },
    { text: 'Chronic kidney disease stage 3a', onset: '2022-01-20', status: 'active' }],
  medications: [
    { id: 'm1', text: 'Lisinopril 20 MG Oral Tablet', status: 'active', authored: '2021-06-01', sig: '20 mg Once daily', reason: 'Hypertension' },
    { id: 'm2', text: 'Spironolactone 25 MG Oral Tablet', status: 'active', authored: '2024-04-22', sig: '25 mg Once daily', reason: 'Resistant hypertension' },
    { id: 'm3', text: 'Metformin 500 MG Oral Tablet', status: 'active', authored: '2017-09-11', sig: '500 mg Twice daily', reason: 'Diabetes' }],
  labs: [
    { text: 'Potassium', value: 6.1, unit: 'mmol/L', date: '2024-05-29 08:10', low: 3.5, high: 5.1, flag: 'High' },
    { text: 'Creatinine', value: 1.42, unit: 'mg/dL', date: '2024-05-29 08:10', low: 0.5, high: 1.1, flag: 'High' },
    { text: 'eGFR', value: 39, unit: 'mL/min/1.73m2', date: '2024-05-29 08:10', low: 60 },
    { text: 'Potassium', value: 4.6, unit: 'mmol/L', date: '2024-03-12 08:30', low: 3.5, high: 5.1 },
    { text: 'Hemoglobin A1c', value: 7.1, unit: '%', date: '2024-03-12 08:30', high: 5.7 }],
  vitals: [{ text: 'Blood pressure', value: 'Systolic 128 mm[Hg]; Diastolic 76 mm[Hg]', unit: '', date: '2024-05-29 08:00' },
    { text: 'Heart rate', value: 72, unit: '/min', date: '2024-05-29 08:00' }],
  notes: [{ title: 'Nephrology visit', date: '2024-04-22', author: 'Demo Nephrologist, MD', service: 'Nephrology', type: 'Progress note',
    text: 'NEPHROLOGY PROGRESS NOTE\n\nBlood pressure above goal on lisinopril. Added spironolactone 25 mg daily for resistant hypertension.\nPlan: repeat potassium and creatinine in 4 to 6 weeks.' }],
  procedures: [],
  ...over,
});
export const DEMO = {
  config: { study: 'Health-CUA clinician supervision study (demo)', version: 'demo' },
  slot: { sequence: 'demo', items: { D1: { pos: 0, block: 0, condition: 'alone', practice: true }, D2: { pos: 1, block: 0, condition: 'assisted', practice: true } } },
  cases: {
    D1: { title: 'Abnormal potassium result (demo)', role: 'Primary Care Physician', setting: 'a demo primary care clinic', taskDate: '2024-06-03', practice: true,
      instructions: '## Context\n\nThe current date is 2024-06-03. You are a primary care physician. A laboratory result has returned for your patient.\n\n## Your Task\n\n1. **Review the chart**\n   - Recent laboratory results and medication changes\n2. **Place orders**\n   - Adjust medications if needed and order follow-up testing\n3. **Document**\n   - Write a short assessment and plan',
      inbox: { category: 'New results', subject: 'Potassium 6.1 mmol/L', sender: 'Laboratory', received_at: '2024-05-29T10:00:00Z', body: 'Basic metabolic panel resulted with a potassium of 6.1 mmol/L.' },
      chart: chart({}) },
    D2: { title: 'Abnormal potassium result, agent draft (demo)', role: 'Primary Care Physician', setting: 'a demo primary care clinic', taskDate: '2024-06-03', practice: true,
      instructions: '## Context\n\nThe current date is 2024-06-03. You are a primary care physician. A laboratory result has returned for your patient.\n\n## Your Task\n\n1. **Review the chart**\n2. **Place orders**\n3. **Document**',
      inbox: { category: 'New results', subject: 'Potassium 6.1 mmol/L', sender: 'Laboratory', received_at: '2024-05-29T10:00:00Z', body: 'Basic metabolic panel resulted with a potassium of 6.1 mmol/L.' },
      chart: chart({ patient: { name: 'Jordan Demo', sex: 'male', birthDate: '1961-07-02', age: 62, mrn: 'DEMO-0002' } }) },
  },
  drafts: {
    D2: { orders: { d1: { kind: 'service', name: 'Basic metabolic panel', priority: 'urgent', date: '2024-06-05', reason: 'Repeat potassium after holding spironolactone' },
      d2: { kind: 'medication', name: 'Lisinopril', dose: 40, unit: 'mg', frequency: 'Once daily', route: 'Oral', reason: 'Blood pressure' } },
    stops: { s1: { name: 'Spironolactone 25 MG Oral Tablet', reason: 'Hyperkalemia' } },
    message: 'COMPLETED. I reviewed the potassium of 6.1 mmol/L.\n\n- **Stopped** spironolactone because of hyperkalemia.\n- **Ordered** a repeat basic metabolic panel on 2024-06-05.\n- **Increased** lisinopril to 40 mg daily for blood pressure.\n\nI signed the note.',
    note: 'Assessment\nHyperkalemia (K 6.1) after spironolactone was added to lisinopril in CKD 3a.\n\nPlan\nStop spironolactone. Repeat BMP on 2024-06-05. Increase lisinopril to 40 mg daily.' },
  },
};
