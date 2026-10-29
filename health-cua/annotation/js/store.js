// Data layer. Firebase Auth (Google) and the Realtime Database in production; the same calls against local storage in the demo.
// Every path is under ROOT and is enforced server side by database.rules.json:
//   config                      study settings (admin)
//   admins/{emailKey}           study team (set from the command line)
//   invites/{emailKey}          {slot, invitedAt, claimedBy, claimedAt}: an admin invites an address into a reader slot
//   slots/{slot}                {sequence, items/{caseId}: {pos, block, condition, practice}} (readable by its claimed invitee)
//   cases/{caseId}              the case (readable if it is in the reader's slot)
//   drafts/{caseId}             the agent's draft (readable only if the reader's slot assigns the case with the agent's draft)
//   profiles/{uid}              consent and background (own)
//   responses/{uid}/{caseId}    orders, note, answers, timing (own; locked once submitted)
//   surveys/{uid}/{surveyId}    workload and trust questionnaires (own; locked once submitted)
import { FIREBASE_CONFIG, ROOT } from './config.js?v=4d1c651a8e';
import { emailKey } from './ui.js?v=4d1c651a8e';
import { DEMO } from './demo-data.js?v=4d1c651a8e';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';

export async function createStore() {
  const q = new URLSearchParams(location.search);
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (local && q.has('emulator')) return firebaseStore(true);
  if (q.has('demo') || !FIREBASE_CONFIG.apiKey) return demoStore();
  return firebaseStore(false);
}

async function firebaseStore(emulator) {
  const [{ initializeApp }, A, D] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-database.js`)]);
  const cfg = emulator ? { apiKey: 'demo-key', authDomain: 'demo-hcua.firebaseapp.com', projectId: 'demo-hcua',
    databaseURL: 'http://127.0.0.1:9000?ns=demo-hcua' } : FIREBASE_CONFIG;
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = D.getDatabase(app);
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
      if (emulator) return A.signInWithRedirect(auth, p);  // the emulator's sign-in page; the popup needs a separate window
      try { await A.signInWithPopup(auth, p); } catch (e) {
        if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') return A.signInWithRedirect(auth, p);
        throw e;
      }
    },
    signOut() { return A.signOut(auth); },
    onConnection(cb) { return D.onValue(D.ref(db, '.info/connected'), (s) => cb(!!s.val())); },
    async me() {
      const admin = (await val(`admins/${ek()}`).catch(() => null)) === true;
      const invite = await val(`invites/${ek()}`).catch(() => null);
      return { admin, invite };
    },
    async claim() {
      await D.update(r(`invites/${ek()}`), { claimedBy: user.uid, claimedAt: now() });
    },
    config: () => val('config'),
    slot: (s) => val(`slots/${s}`),
    caseData: (c) => val(`cases/${c}`),
    draft: (c) => val(`drafts/${c}`),
    responses: () => val(`responses/${user.uid}`).then((v) => v || {}),
    response: (c) => val(`responses/${user.uid}/${c}`),
    saveResponse: (c, patch) => D.update(r(`responses/${user.uid}/${c}`), { ...patch, updatedAt: now() }),
    submitResponse: (c, patch) => D.update(r(`responses/${user.uid}/${c}`), { ...patch, updatedAt: now(), submittedAt: now() }),
    profile: () => val(`profiles/${user.uid}`),
    saveProfile: (patch) => D.update(r(`profiles/${user.uid}`), { ...patch, email: user.email, updatedAt: now() }),
    surveys: () => val(`surveys/${user.uid}`).then((v) => v || {}),
    saveSurvey: (id, data, submit) => D.update(r(`surveys/${user.uid}/${id}`), { ...data, updatedAt: now(), ...(submit ? { submittedAt: now() } : {}) }),
    // study team
    async adminData() {
      const [invites, slots, responses, profiles, surveys, config] = await Promise.all(
        ['invites', 'slots', 'responses', 'profiles', 'surveys', 'config'].map((p) => val(p)));
      return { invites: invites || {}, slots: slots || {}, responses: responses || {}, profiles: profiles || {}, surveys: surveys || {}, config: config || {} };
    },
    invite: (email, slot) => D.set(r(`invites/${emailKey(email)}`), { email: email.trim().toLowerCase(), slot, invitedAt: now() }),
    removeInvite: (email) => D.remove(r(`invites/${emailKey(email)}`)),
    async exportAll() {
      const [invites, responses, profiles, surveys, slots, config] = await Promise.all(
        ['invites', 'responses', 'profiles', 'surveys', 'slots', 'config'].map((p) => val(p)));
      return { exportedAt: new Date().toISOString(), config, invites, slots, profiles, responses, surveys };
    },
  };
}

// Demo: invented cases, no sign-in, everything in this browser's local storage.
function demoStore() {
  const KEY = 'hcua-supervision-demo-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private window: the demo still runs */ } };
  let state = load();
  const user = { uid: 'demo-user', email: 'demo@example.org', emailVerified: true, name: 'Demo clinician' };
  const setPath = (obj, path, v) => { const ks = path.split('/'); let o = obj; for (const k of ks.slice(0, -1)) o = o[k] = o[k] || {}; if (v === null) delete o[ks.at(-1)]; else o[ks.at(-1)] = v; };
  const apply = (base, patch) => { const b = structuredClone(base || {}); for (const [p, v] of Object.entries(patch)) setPath(b, p, v); return b; };
  const t = () => Date.now();
  return {
    mode: 'demo',
    onAuth(cb) { setTimeout(() => cb(user), 0); return () => {}; },
    async signIn() {}, async signOut() { localStorage.removeItem(KEY); state = {}; location.reload(); },
    onConnection(cb) { cb(true); return () => {}; },
    async me() { return { admin: false, invite: { slot: 'DEMO', claimedBy: user.uid, email: user.email } }; },
    async claim() {},
    config: async () => DEMO.config,
    slot: async () => DEMO.slot,
    caseData: async (c) => structuredClone(DEMO.cases[c]),
    draft: async (c) => (DEMO.slot.items[c]?.condition === 'assisted' ? structuredClone(DEMO.drafts[c]) : null),
    responses: async () => structuredClone(state.responses || {}),
    response: async (c) => structuredClone(state.responses?.[c] || null),
    async saveResponse(c, patch) { state.responses = state.responses || {}; state.responses[c] = apply(state.responses[c], { ...patch, updatedAt: t() }); save(state); },
    async submitResponse(c, patch) { state.responses = state.responses || {}; state.responses[c] = apply(state.responses[c], { ...patch, updatedAt: t(), submittedAt: t() }); save(state); },
    profile: async () => structuredClone(state.profile || null),
    async saveProfile(patch) { state.profile = apply(state.profile, { ...patch, updatedAt: t() }); save(state); },
    surveys: async () => structuredClone(state.surveys || {}),
    async saveSurvey(id, data, submit) { state.surveys = state.surveys || {}; state.surveys[id] = apply(state.surveys[id], { ...data, updatedAt: t(), ...(submit ? { submittedAt: t() } : {}) }); save(state); },
  };
}
