// Data layer of the task review page (Study A'). Firebase Auth (Google) and the Realtime Database in production; local storage in the
// demo. Every path is under REVIEW_ROOT and is enforced server side by database.rules.json:
//   config, admins/{emailKey}, invites/{emailKey} {email, slot, invitedAt, claimedBy, claimedAt}
//   slots/{slot}              {tasks/{taskId}: {pos}}
//   tasks/{taskId}            {case: task and chart, review: instruction, gold, forbidden orders, open questions} (readable within the slot)
//   profiles/{uid}            instructions read (own)
//   ratings/{uid}/{taskId}    one rating per task (own; locked once submitted)
import { FIREBASE_CONFIG, REVIEW_ROOT as ROOT } from './config.js?v=d02cf1d4d6';
import { emailKey } from './ui.js?v=d02cf1d4d6';
import { VALIDITY_DEMO } from './validity-demo.js?v=d02cf1d4d6';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';

export async function createStore() {
  const q = new URLSearchParams(location.search);
  if (['localhost', '127.0.0.1'].includes(location.hostname) && q.has('emulator')) return firebaseStore(true);
  if (q.has('demo') || !FIREBASE_CONFIG.apiKey) return demoStore();
  return firebaseStore(false);
}

async function firebaseStore(emulator) {
  const [{ initializeApp }, A, D] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-database.js`)]);
  const cfg = emulator ? { apiKey: 'demo-key', authDomain: 'demo-hcua.firebaseapp.com', projectId: 'demo-hcua',
    databaseURL: 'http://127.0.0.1:9000?ns=demo-hcua' } : FIREBASE_CONFIG;
  const app = initializeApp(cfg, 'review');
  const auth = A.getAuth(app); const db = D.getDatabase(app);
  if (emulator) { A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true }); D.connectDatabaseEmulator(db, '127.0.0.1', 9000); }
  await A.setPersistence(auth, A.browserLocalPersistence);
  await A.getRedirectResult(auth).catch((e) => { console.error('sign-in redirect', e); });
  const r = (p) => D.ref(db, `${ROOT}/${p}`);
  const val = async (p) => { const s = await D.get(r(p)); return s.exists() ? s.val() : null; };
  const now = D.serverTimestamp;
  let user = null;
  const ek = () => emailKey(user?.email);
  return {
    mode: emulator ? 'emulator' : 'firebase',
    onAuth(cb) { return A.onAuthStateChanged(auth, (u) => { user = u; cb(u ? { uid: u.uid, email: u.email, emailVerified: u.emailVerified, name: u.displayName } : null); }); },
    async signIn() {
      const p = new A.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      if (emulator) return A.signInWithRedirect(auth, p);
      try { await A.signInWithPopup(auth, p); } catch (e) {
        if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') return A.signInWithRedirect(auth, p);
        throw e;
      }
    },
    signOut() { return A.signOut(auth); },
    onConnection(cb) { return D.onValue(D.ref(db, '.info/connected'), (s) => cb(!!s.val())); },
    async me() {
      const admin = (await val(`admins/${ek()}`).catch(() => null)) === true;
      return { admin, invite: await val(`invites/${ek()}`).catch(() => null) };
    },
    claim: () => D.update(r(`invites/${ek()}`), { claimedBy: user.uid, claimedAt: now() }),
    slot: (s) => val(`slots/${s}`),
    task: (t) => val(`tasks/${t}`),
    ratings: () => val(`ratings/${user.uid}`).then((v) => v || {}),
    saveRating: (t, patch) => D.update(r(`ratings/${user.uid}/${t}`), { ...patch, updatedAt: now() }),
    submitRating: (t, patch) => D.update(r(`ratings/${user.uid}/${t}`), { ...patch, updatedAt: now(), submittedAt: now() }),
    profile: () => val(`profiles/${user.uid}`),
    saveProfile: (patch) => D.update(r(`profiles/${user.uid}`), { ...patch, email: user.email, updatedAt: now() }),
    async adminData() {
      const [invites, slots, ratings] = await Promise.all(['invites', 'slots', 'ratings'].map((p) => val(p)));
      return { invites: invites || {}, slots: slots || {}, ratings: ratings || {} };
    },
    invite: (email, slot) => D.set(r(`invites/${emailKey(email)}`), { email: email.trim().toLowerCase(), slot, invitedAt: now() }),
    removeInvite: (email) => D.remove(r(`invites/${emailKey(email)}`)),
    async exportAll() {
      const [invites, slots, profiles, ratings, config] = await Promise.all(['invites', 'slots', 'profiles', 'ratings', 'config'].map((p) => val(p)));
      return { exportedAt: new Date().toISOString(), config, invites, slots, profiles, ratings };
    },
  };
}

// Demo: one invented task, no sign-in, everything in this browser's local storage.
const DEMO_TASK = {
  case: VALIDITY_DEMO.cases['DEMO-A'],  // the invented chart of the episode review demo
  review: { taskId: 'DEMO-T1', tier: 'standard', twinOf: null, instruction: 'Review the thyroid results and complete the follow-up.',
    required: [{ id: 'cp1_levothyroxine_increase', kind: 'MedicationRequest', alternatives: ['levothyroxine at 88 to 112 mcg'], window_days: null, rationale: 'Under-replaced on 75 mcg.' },
      { id: 'cp2_repeat_tsh', kind: 'ServiceRequest', alternatives: ['TSH'], window_days: [35, 56], rationale: 'Recheck 6 to 8 weeks after a dose change.' }],
    acceptable: ['free T4'], forbidden: [{ id: 'f1', orders: 'liothyronine', reason: 'Not first line.' }],
    questions: ['Is a step of 25 mcg acceptable for a 54-year-old without heart disease?'], visitQuestions: [{ check: 'cp2_repeat_tsh', days: [35, 56] }] },
};
function demoStore() {
  const KEY = 'hcua-review-demo-a1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private window */ } };
  let state = load();
  const user = { uid: 'demo-reviewer', email: 'demo@example.org', emailVerified: true, name: 'Demo physician' };
  const setPath = (obj, path, v) => { const ks = path.split('/'); let o = obj; for (const k of ks.slice(0, -1)) o = o[k] = o[k] || {}; if (v === null) delete o[ks.at(-1)]; else o[ks.at(-1)] = v; };
  const apply = (base, patch) => { const b = structuredClone(base || {}); for (const [p, v] of Object.entries(patch)) setPath(b, p, v); return b; };
  return {
    mode: 'demo',
    onAuth(cb) { setTimeout(() => cb(user), 0); return () => {}; },
    async signIn() {}, async signOut() { localStorage.removeItem(KEY); state = {}; location.reload(); },
    onConnection(cb) { cb(true); return () => {}; },
    async me() { return { admin: false, invite: { slot: 'DEMO', claimedBy: user.uid, email: user.email } }; },
    async claim() {},
    slot: async () => ({ tasks: { 'DEMO-T1': { pos: 0 } } }),
    task: async (t) => (t === 'DEMO-T1' ? structuredClone(DEMO_TASK) : null),
    ratings: async () => structuredClone(state.ratings || {}),
    async saveRating(t, patch) { state.ratings = state.ratings || {}; state.ratings[t] = apply(state.ratings[t], { ...patch, updatedAt: Date.now() }); save(state); },
    async submitRating(t, patch) { state.ratings = state.ratings || {}; state.ratings[t] = apply(state.ratings[t], { ...patch, updatedAt: Date.now(), submittedAt: Date.now() }); save(state); },
    profile: async () => structuredClone(state.profile || null),
    async saveProfile(patch) { state.profile = apply(state.profile, patch); save(state); },
  };
}
