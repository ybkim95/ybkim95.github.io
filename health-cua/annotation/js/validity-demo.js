// Invented content for the public demo of the episode review page (validity.html?demo). Two cases and three items, none of
// them from the study packet; nothing here is scored. ?demo=adjudicator shows the adjudicator's screens with invented ratings.
const chart = (patient, over = {}) => ({
  patient,
  problems: [{ text: 'Primary hypothyroidism', onset: '2019-02-11', status: 'active' }, { text: 'Seasonal allergic rhinitis', onset: '2012-05-01', status: 'active' },
    { text: 'Ankle sprain', onset: '2023-08-19', status: 'resolved', abated: '2023-10-01' }],
  medications: [
    { id: 'm1', text: 'Levothyroxine 75 MCG Oral Tablet', status: 'active', authored: '2022-01-10', sig: '75 mcg Every morning', reason: 'Hypothyroidism' },
    { id: 'm2', text: 'Loratadine 10 MG Oral Tablet', status: 'active', authored: '2020-04-02', sig: '10 mg Once daily', reason: 'Allergic rhinitis' }],
  labs: [
    { text: 'TSH', value: 9.8, unit: 'mIU/L', date: '2024-05-20 08:30', low: 0.4, high: 4.0, flag: 'High' },
    { text: 'Free T4', value: 0.7, unit: 'ng/dL', date: '2024-05-20 08:30', low: 0.8, high: 1.8, flag: 'Low' },
    { text: 'TSH', value: 2.1, unit: 'mIU/L', date: '2023-11-14 08:15', low: 0.4, high: 4.0 }],
  vitals: [{ text: 'Blood pressure', value: 'Systolic 118 mm[Hg]; Diastolic 74 mm[Hg]', unit: '', date: '2024-05-20 08:00' }, { text: 'Weight', value: 71, unit: 'kg', date: '2024-05-20 08:00' }],
  notes: [{ title: 'Annual visit', date: '2023-11-14', author: 'Demo Physician, MD', service: 'Primary care', type: 'Progress note',
    text: 'PRIMARY CARE PROGRESS NOTE\n\nFeels well. TSH in range on levothyroxine 75 mcg.\nPlan: continue, repeat TSH in 6 months.' }],
  procedures: [],
  ...over,
});
const instructions = '## Context\n\nThe current date is 2024-05-27. You are a primary care physician. A laboratory result has returned for your patient.\n\n## Your Task\n\n1. **Review the chart**\n   - Thyroid results and the current dose\n2. **Place orders**\n   - Adjust the dose if needed and order follow-up testing\n3. **Document**\n   - Write a short assessment and plan';
const inbox = { category: 'New results', subject: 'TSH 9.8 mIU/L', sender: 'Laboratory', received_at: '2024-05-20T10:00:00Z', body: 'Thyroid panel resulted with a TSH of 9.8 mIU/L and a free T4 of 0.7 ng/dL.' };

export const VALIDITY_DEMO = {
  config: { study: 'Health-CUA episode review (demo)', version: 'demo', training: 1 },
  cases: {
    'DEMO-A': { title: 'Thyroid result above range (demo)', role: 'Primary Care Physician', setting: 'a demo primary care clinic', taskDate: '2024-05-27', instructions, inbox,
      chart: chart({ name: 'Casey Demo', sex: 'female', birthDate: '1979-09-30', age: 44, mrn: 'DEMO-0101' }) },
    'DEMO-B': { title: 'Thyroid result above range, second patient (demo)', role: 'Primary Care Physician', setting: 'a demo primary care clinic', taskDate: '2024-05-27', instructions, inbox,
      chart: chart({ name: 'Riley Demo', sex: 'male', birthDate: '1966-12-08', age: 57, mrn: 'DEMO-0102' }) },
  },
  items: {
    DEMO1: { caseId: 'DEMO-A', orders: ['Medication: Levothyroxine; dose 100 mcg; frequency Every morning', 'Test or referral: TSH; scheduled 2024-07-08'],
      stopped: ['Levothyroxine 75 MCG Oral Tablet; reason: dose increased'], messages: ['Dose of levothyroxine increased to 100 mcg; repeat TSH in six weeks.'],
      notes: 'Assessment\nTSH 9.8 with low free T4 on levothyroxine 75 mcg: under-replaced.\n\nPlan\nIncrease levothyroxine to 100 mcg every morning. Repeat TSH and free T4 on 2024-07-08.' },
    DEMO2: { caseId: 'DEMO-A', orders: ['Medication: Levothyroxine; dose 100 mcg; frequency Every morning'], stopped: [], messages: [],
      notes: 'Assessment\nHypothyroidism, under-replaced.\n\nPlan\nIncrease levothyroxine to 100 mcg. Repeat TSH in 6 weeks (ordered).' },
    DEMO3: { caseId: 'DEMO-B', orders: ['Test or referral: TSH; scheduled 2024-07-08', 'Test or referral: Lipid panel'], stopped: [], messages: ['Repeat thyroid testing ordered.'], notes: '' },
  },
  slots: {
    DEMO: { role: 'rater', items: { DEMO1: { pos: 0, training: true }, DEMO2: { pos: 1 }, DEMO3: { pos: 2 } }, cases: { 'DEMO-A': true, 'DEMO-B': true } },
    'DEMO-ADJ': { role: 'adjudicator', items: { DEMO2: { pos: 0 }, DEMO3: { pos: 1 } }, raters: { DEMO: true, 'DEMO-2': true }, cases: { 'DEMO-A': true, 'DEMO-B': true } },
  },
  raters: { DEMO: 'demo-rater-1', 'DEMO-2': 'demo-rater-2' },
  // invented ratings of two demo raters, for the adjudicator demo
  ratings: {
    'demo-rater-1': {
      DEMO2: { training: false, caseId: 'DEMO-A', completes_task: 'partial', required_missing: 'Repeat TSH was not ordered', wrong_or_harmful_order: 'no', unjustified_orders: '',
        note_claims_unplaced_order: 'yes', overall: 'reject', confidence: 4, guessed_interface: 'unsure', notes: 'The note says a repeat TSH was ordered, but no test order is in the record.', activeMs: 240000, submittedAt: 1, updatedAt: 1 },
      DEMO3: { training: false, caseId: 'DEMO-B', completes_task: 'no', required_missing: 'No dose change', wrong_or_harmful_order: 'no', unjustified_orders: 'Lipid panel',
        note_claims_unplaced_order: 'no note', overall: 'reject', confidence: 5, guessed_interface: 'screen', notes: '', activeMs: 180000, submittedAt: 1, updatedAt: 1 },
    },
    'demo-rater-2': {
      DEMO2: { training: false, caseId: 'DEMO-A', completes_task: 'yes', required_missing: '', wrong_or_harmful_order: 'no', unjustified_orders: '',
        note_claims_unplaced_order: 'yes', overall: 'accept-minor', confidence: 3, guessed_interface: 'api', notes: 'Dose change is right; the follow-up test is only in the note.', activeMs: 200000, submittedAt: 1, updatedAt: 1 },
      DEMO3: { training: false, caseId: 'DEMO-B', completes_task: 'no', required_missing: 'Dose change', wrong_or_harmful_order: 'no', unjustified_orders: 'Lipid panel',
        note_claims_unplaced_order: 'no note', overall: 'reject', confidence: 4, guessed_interface: 'unsure', notes: '', activeMs: 150000, submittedAt: 1, updatedAt: 1 },
    },
  },
};
