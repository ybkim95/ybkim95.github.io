// Data layer of the episode review page (Study B). Firebase Auth (Google) and the Realtime Database in production; the same
// calls against local storage in the demo. Every path is under VALIDITY_ROOT and is enforced server side by database.rules.json:
//   config                      study settings (admin)
//   admins/{emailKey}           study team (set from the command line)
//   invites/{emailKey}          {slot, role, invitedAt, claimedBy, claimedAt}: an admin invites an address into a slot
//   slots/{slot}                {role, items/{itemId}: {pos, training}, cases/{caseId}: true, raters/{slot}: true (adjudicator)}
//   raters/{slot}               the uid that claimed a rater slot (written once by that rater; read by its adjudicator)
//   items/{itemId}              what the agent left in the record (readable if the item is in the reader's slot)
//   cases/{caseId}              task and chart (readable if a case of the reader's slot)
//   profiles/{uid}              role, slot, instructions read (own)
//   ratings/{uid}/{itemId}      one rating per item (own; a submitted rating is readable by the adjudicator; locked once submitted)
//   adjudications/{itemId}      the adjudicator's final rating (locked once submitted)
// Open recruitment (B-4.4): a physician applies with Google and the study team decides; approved raters take blocks of items.
//   applicants/{uid}            {name, email, specialty, stage, place, licensed, consent, appliedAt} (own, until the decision)
//   decisions/{uid}             {status: approved|rejected, B, A, at, by} (study team; read by the applicant; also opens Study A')
//   blocks/{blockId}            {items/{itemId}: position, cases/{caseId}: true} (uploaded; every block has one item of each stratum)
//   claims/{blockId}/{uid}      when a rater took the block (written once by that rater)
//   current/{uid}               the block the rater works on; items and cases of that block are readable
// The model, interface and grader verdict of an item are never uploaded, so no call here can return them.
import { FIREBASE_CONFIG, VALIDITY_ROOT as ROOT } from './config.js?v=d70d513cd6';
import { emailKey, withTimeout } from './ui.js?v=d70d513cd6';
import { VALIDITY_DEMO as DEMO } from './validity-demo.js?v=d70d513cd6';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';

export async function createStore() {
  const q = new URLSearchParams(location.search);
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (local && q.has('emulator')) return firebaseStore(true);
  if (q.has('demo') || !FIREBASE_CONFIG.apiKey) return demoStore(q.get('demo') === 'adjudicator');
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
  const val = async (p) => { const s = await withTimeout(D.get(r(p))); return s.exists() ? s.val() : null; };  // a stuck connection rejects after 10 s
  const now = D.serverTimestamp;
  const denied = (e) => { if (e.code === 'timeout') throw e; return null; };
  let user = null;
  const ek = () => emailKey(user?.email);

  return {
    mode: emulator ? 'emulator' : 'firebase',
    onAuth(cb) { return A.onAuthStateChanged(auth, (u) => { user = u; cb(u ? { uid: u.uid, email: u.email, emailVerified: u.emailVerified, name: u.displayName, photo: u.photoURL } : null); }); },
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
      const admin = (await val(`admins/${ek()}`).catch(denied)) === true;
      const invite = await val(`invites/${ek()}`).catch(denied);
      return { admin, invite };
    },
    async claim() {
      await D.update(r(`invites/${ek()}`), { claimedBy: user.uid, claimedAt: now() });
    },
    // the roster entry lets the adjudicator find this rater's ratings; the rules let it be written once, so a repeat is refused
    ensureRoster: (slot) => D.set(r(`raters/${slot}`), user.uid).catch(() => {}),
    roster: (slot) => val(`raters/${slot}`).catch(() => null),
    config: () => val('config'),
    slot: (s) => val(`slots/${s}`),
    item: (i) => val(`items/${i}`),
    caseData: (c) => val(`cases/${c}`),
    ratings: () => val(`ratings/${user.uid}`).then((v) => v || {}),
    rating: (i) => val(`ratings/${user.uid}/${i}`),
    saveRating: (i, patch) => D.update(r(`ratings/${user.uid}/${i}`), { ...patch, updatedAt: now() }),
    submitRating: (i, patch) => D.update(r(`ratings/${user.uid}/${i}`), { ...patch, updatedAt: now(), submittedAt: now() }),
    // another rater's rating: readable by the adjudicator only once it is submitted, so a refusal means "not yet"
    otherRating: (uid, i) => val(`ratings/${uid}/${i}`).catch(() => null),
    adjudication: (i) => val(`adjudications/${i}`),
    saveAdjudication: (i, patch) => D.update(r(`adjudications/${i}`), { ...patch, by: user.uid, updatedAt: now() }),
    submitAdjudication: (i, patch) => D.update(r(`adjudications/${i}`), { ...patch, by: user.uid, updatedAt: now(), submittedAt: now() }),
    profile: () => val(`profiles/${user.uid}`),
    saveProfile: (patch) => D.update(r(`profiles/${user.uid}`), { ...patch, email: user.email, updatedAt: now() }),
    // open recruitment
    applicant: () => val(`applicants/${user.uid}`).catch(denied),
    apply: (a) => withTimeout(D.set(r(`applicants/${user.uid}`), { ...a, email: user.email, licensed: true, consent: 'v1', appliedAt: now() })),
    watchDecision: (cb) => D.onValue(r(`decisions/${user.uid}`), (s) => cb(s.val()), () => cb(null)),
    current: () => val(`current/${user.uid}`).catch(denied),
    blocksAndClaims: async () => ({ blocks: (await val('blocks')) || {}, claims: (await val('claims')) || {} }),
    takeBlock: (b) => withTimeout(D.update(D.ref(db, ROOT), { [`claims/${b}/${user.uid}`]: now(), [`current/${user.uid}`]: b })),
    // study team
    async adminData() {
      const [invites, slots, ratings, adjudications, profiles, raters, config] = await Promise.all(
        ['invites', 'slots', 'ratings', 'adjudications', 'profiles', 'raters', 'config'].map((p) => val(p)));
      return { invites: invites || {}, slots: slots || {}, ratings: ratings || {}, adjudications: adjudications || {}, profiles: profiles || {}, raters: raters || {}, config: config || {} };
    },
    invite: (email, slot, role) => D.set(r(`invites/${emailKey(email)}`), { email: email.trim().toLowerCase(), slot, role, invitedAt: now() }),
    removeInvite: (email) => D.remove(r(`invites/${emailKey(email)}`)),
    async exportAll() {
      const [invites, slots, profiles, ratings, adjudications, raters, config] = await Promise.all(
        ['invites', 'slots', 'profiles', 'ratings', 'adjudications', 'raters', 'config'].map((p) => val(p)));
      return { exportedAt: new Date().toISOString(), config, invites, slots, raters, profiles, ratings, adjudications };
    },
  };
}

// Demo: invented items, no sign-in, everything in this browser's local storage. The adjudicator demo reads invented ratings.
function demoStore(adjudicator) {
  const KEY = adjudicator ? 'hcua-validity-demo-adj-b4' : 'hcua-validity-demo-b4';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private window: the demo still runs */ } };
  let state = load();
  const user = adjudicator ? { uid: 'demo-adjudicator', email: 'adjudicator@example.org', emailVerified: true, name: 'Demo adjudicator' }
    : { uid: 'demo-rater-1', email: 'demo@example.org', emailVerified: true, name: 'Demo physician' };
  const slot = adjudicator ? 'DEMO-ADJ' : 'DEMO';
  const setPath = (obj, path, v) => { const ks = path.split('/'); let o = obj; for (const k of ks.slice(0, -1)) o = o[k] = o[k] || {}; if (v === null) delete o[ks.at(-1)]; else o[ks.at(-1)] = v; };
  const apply = (base, patch) => { const b = structuredClone(base || {}); for (const [p, v] of Object.entries(patch)) setPath(b, p, v); return b; };
  const t = () => Date.now();
  return {
    mode: 'demo',
    onAuth(cb) { setTimeout(() => cb(user), 0); return () => {}; },
    async signIn() {}, async signOut() { localStorage.removeItem(KEY); state = {}; location.reload(); },
    onConnection(cb) { cb(true); return () => {}; },
    async me() { return { admin: false, invite: { slot, role: adjudicator ? 'adjudicator' : 'rater', claimedBy: user.uid, email: user.email } }; },
    async claim() {}, async ensureRoster() {},
    roster: async (s) => DEMO.raters[s] || null,
    config: async () => DEMO.config,
    slot: async (s) => structuredClone(DEMO.slots[s] || null),
    item: async (i) => structuredClone(DEMO.items[i] || null),
    caseData: async (c) => structuredClone(DEMO.cases[c] || null),
    ratings: async () => structuredClone(state.ratings || {}),
    rating: async (i) => structuredClone(state.ratings?.[i] || null),
    async saveRating(i, patch) { state.ratings = state.ratings || {}; state.ratings[i] = apply(state.ratings[i], { ...patch, updatedAt: t() }); save(state); },
    async submitRating(i, patch) { state.ratings = state.ratings || {}; state.ratings[i] = apply(state.ratings[i], { ...patch, updatedAt: t(), submittedAt: t() }); save(state); },
    otherRating: async (uid, i) => structuredClone(DEMO.ratings[uid]?.[i] || null),
    adjudication: async (i) => structuredClone(state.adjudications?.[i] || null),
    async saveAdjudication(i, patch) { state.adjudications = state.adjudications || {}; state.adjudications[i] = apply(state.adjudications[i], { ...patch, by: user.uid, updatedAt: t() }); save(state); },
    async submitAdjudication(i, patch) { state.adjudications = state.adjudications || {}; state.adjudications[i] = apply(state.adjudications[i], { ...patch, by: user.uid, updatedAt: t(), submittedAt: t() }); save(state); },
    profile: async () => structuredClone(state.profile || null),
    async saveProfile(patch) { state.profile = apply(state.profile, { ...patch, updatedAt: t() }); save(state); },
  };
}
