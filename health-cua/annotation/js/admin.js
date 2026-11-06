// Study team page (admin.html): applications arrive live; one click approves a physician for the episode review (Study B) or rejects;
// block progress and the JSON download. (2026-11-06: the site serves Study B only; Study A' keeps its code and database root.) The database rules let only the addresses in
// hcua_validity/admins (and hcua_task_review/admins for Study A') read or write any of this.
import { FIREBASE_CONFIG, VALIDITY_ROOT as V } from './config.js?v=3bc21eb232';
import { COUNTRIES } from './countries.js?v=3bc21eb232';
import { h, toast, confirmBox, fmtTime, emailKey, GOOGLE_ICON, withTimeout, themeButton, connectionView, brand, profileMenu } from './ui.js?v=3bc21eb232';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
const app = document.getElementById('app');
const COUNTRY = Object.fromEntries(COUNTRIES);
const STAGE = { attending: 'Attending or consultant', fellow: 'Fellow', resident: 'Resident', other: 'Other' };
let A; let D; let auth; let db; let user = null;
let apps = {}; let decisions = {};

async function init() {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('emulator');
  const [{ initializeApp }, a, d] = await Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-database.js`)]);
  A = a; D = d;
  const cfg = local ? { apiKey: 'demo-key', authDomain: 'demo-hcua.firebaseapp.com', projectId: 'demo-hcua', databaseURL: 'http://127.0.0.1:9000?ns=demo-hcua' } : FIREBASE_CONFIG;
  const fb = initializeApp(cfg);  // the default app: one sign-in shared with the episode review, so switching accounts on either page switches both
  auth = A.getAuth(fb); db = D.getDatabase(fb);
  if (local) { A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true }); D.connectDatabaseEmulator(db, '127.0.0.1', 9000); }
  await A.setPersistence(auth, A.browserLocalPersistence);
  await A.getRedirectResult(auth).catch((e) => console.error('sign-in redirect', e));
  return local;
}
const ref = (p) => D.ref(db, p);
const val = async (p) => { const s = await withTimeout(D.get(ref(p))); return s.exists() ? s.val() : null; };

function shell(...children) {
  const me = user ? { name: user.displayName, email: user.email, photo: user.photoURL } : null;
  app.replaceChildren(h('header', { class: 'topbar' }, brand('admin.html'), h('span', { class: 'crumb' }, 'Study team'), h('span', { class: 'grow' }), themeButton(),
    profileMenu(me, { lines: [['Role', 'Study team']], links: [['Episode review', './']], onSignOut: () => A.signOut(auth), onSwitch: () => A.signOut(auth) })),
  h('main', { class: 'page wide' }, h('div', { class: 'stack' }, ...children)));
}

function signin(local) {
  shell(h('div', { class: 'card signin stack' }, h('h1', {}, 'Study team sign-in'),
    h('div', {}, h('button', { class: 'google', html: `${GOOGLE_ICON}<span>Sign in with Google</span>`, onclick: async () => {
      const p = new A.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      if (local) return A.signInWithRedirect(auth, p);
      try { await A.signInWithPopup(auth, p); } catch (e) { if (e.code === 'auth/popup-blocked') A.signInWithRedirect(auth, p); else if (e.code !== 'auth/popup-closed-by-user') toast(e.message, 'bad'); }
    } }))));
}

async function decide(uid, status, B, Astudy) {
  try {
    await withTimeout(D.set(ref(`${V}/decisions/${uid}`), { status, B, A: Astudy, at: D.serverTimestamp(), by: user.email }));
    toast(status === 'approved' ? 'Approved. The physician starts at once.' : 'Rejected.');
  } catch (e) { toast(`Not saved: ${e.message}`, 'bad'); }
}

function applicationsCard() {
  const rows = Object.entries(apps).sort((a, b) => (b[1].appliedAt || 0) - (a[1].appliedAt || 0)).map(([uid, a]) => {
    const d = decisions[uid];
    const status = !d ? h('span', { class: 'pill accent' }, 'Waiting')
      : d.status === 'approved' ? h('span', { class: 'pill ok' }, 'Approved') : h('span', { class: 'pill' }, 'Rejected');
    const actions = !d ? h('div', { class: 'row' },
      h('button', { class: 'small primary', onclick: () => decide(uid, 'approved', true, false) }, 'Approve'),
      h('button', { class: 'small danger', onclick: async () => { if (await confirmBox('Reject this application?', `${a.name} (${a.email})`, 'Reject', true)) decide(uid, 'rejected', false, false); } }, 'Reject'))
      : h('button', { class: 'small ghost', onclick: async () => {
        if (!(await confirmBox('Undo this decision?', 'The physician goes back to waiting. Ratings already submitted are kept.', 'Undo', true))) return;
        D.remove(ref(`${V}/decisions/${uid}`)).catch((e) => toast(e.message, 'bad'));
      } }, 'Undo');
    return h('tr', {}, h('td', {}, h('strong', {}, a.name), h('div', { class: 'small muted' }, a.email)), h('td', {}, d ? status : actions, d ? actions : null),
      h('td', {}, a.specialty), h('td', {}, STAGE[a.stage] || a.stage), h('td', { class: 'nw' }, a.yearsPractice ?? ''), h('td', {}, a.place),
      h('td', { title: a.country || '' }, COUNTRY[a.country] || a.country || ''), h('td', { class: 'nw small' }, a.appliedAt ? fmtTime(a.appliedAt) : ''));
  });
  const waiting = Object.keys(apps).filter((u) => !decisions[u]).length;
  return h('div', { class: 'card stack' }, h('div', { class: 'spread' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Applications'), h('h1', { style: { margin: 0 } }, `${waiting} waiting`)),
    h('span', { class: 'muted small' }, 'Updates live. An approved physician starts at once.')),
  h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['Physician', 'Decision', 'Specialty', 'Stage', 'Years', 'Institution', 'Country', 'Applied'].map((x) => h('th', {}, x)))),
    h('tbody', {}, rows.length ? rows : h('tr', {}, h('td', { colspan: 8, class: 'muted' }, 'No applications yet.'))))));
}

async function progressCard(root, kind, title, unit) {
  const [blocks, claims, ratings] = await Promise.all(['blocks', 'claims', 'ratings'].map((p) => val(`${root}/${p}`).catch(() => null)));
  const done = (uid, ids) => ids.every((i) => ratings?.[uid]?.[i]?.submittedAt);
  const perItem = {};  // submitted ratings per item
  const rows = Object.entries(blocks || {}).sort().map(([b, v]) => {
    const ids = Object.keys(v[kind] || {}); const who = Object.keys(claims?.[b] || {}); const fin = who.filter((u) => done(u, ids));
    for (const i of ids) perItem[i] = who.filter((u) => ratings?.[u]?.[i]?.submittedAt).length;
    return h('tr', {}, h('td', { class: 'num' }, b), h('td', { class: 'num' }, String(ids.length)), h('td', { class: 'num' }, String(who.length)), h('td', { class: 'num' }, String(fin.length)));
  });
  const twice = Object.values(perItem).filter((n) => n >= 2).length; const once = Object.values(perItem).filter((n) => n === 1).length;
  const taken = Object.keys(blocks || {}).filter((b) => Object.keys(claims?.[b] || {}).length).length;
  return h('div', { class: 'card stack' }, h('div', { class: 'spread' }, h('div', {}, h('div', { class: 'eyebrow' }, title), h('h2', { style: { margin: 0 } }, `${twice} of ${Object.keys(perItem).length} ${unit} rated by two physicians`), h('div', { class: 'small muted' }, `${once} rated by one so far; a case counts once two physicians have rated it.`)),
    h('button', { class: 'small', onclick: async () => {
      const nodes = root === V ? ['config', 'applicants', 'decisions', 'blocks', 'claims', 'current', 'profiles', 'ratings', 'adjudications', 'invites', 'slots', 'raters'] : ['config', 'blocks', 'claims', 'current', 'profiles', 'ratings', 'invites', 'slots'];
      const data = { exportedAt: new Date().toISOString(), ...Object.fromEntries(await Promise.all(nodes.map(async (p) => [p, await val(`${root}/${p}`)]))) };
      const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' })), download: `${root}-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.json` });
      document.body.append(a); a.click(); a.remove();
    } }, 'Download all (JSON)')),
  h('details', {}, h('summary', { class: 'small' }, `${taken} of ${rows.length} blocks taken; show every block`),
    h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['Block', unit[0].toUpperCase() + unit.slice(1), 'Taken by', 'Finished by'].map((x) => h('th', {}, x)))), h('tbody', {}, rows)))));
}

async function render() {
  const progress = h('div', { class: 'stack' }, h('p', { class: 'muted' }, 'Loading progress…'));
  shell(applicationsCard(), progress);
  const cards = [await progressCard(V, 'items', 'Progress', 'cases')];
  progress.replaceChildren(...cards, h('div', { class: 'row' }, h('button', { class: 'small', onclick: render }, 'Refresh progress')));
}

async function boot() {
  const local = await init();
  let unsub = [];
  A.onAuthStateChanged(auth, async (u) => {
    unsub.forEach((f) => f()); unsub = []; user = u;
    if (!u) return signin(local);
    try {
      const isAdmin = (await val(`${V}/admins/${emailKey(u.email)}`).catch(() => null)) === true;
      if (!isAdmin) return location.replace(`./${location.search}`);  // a physician who lands here goes straight to the episode review
      const loaded = new Set();  // render once both lists have arrived, then swap only the applications card on every change
      const update = (k) => { const fresh = !loaded.has('apps') || !loaded.has('dec'); loaded.add(k); if (loaded.size < 2) return; if (fresh) render(); else app.querySelector('.card')?.replaceWith(applicationsCard()); };
      unsub.push(D.onValue(ref(`${V}/applicants`), (s) => { apps = s.val() || {}; update('apps'); }, (e) => toast(e.message, 'bad')));
      unsub.push(D.onValue(ref(`${V}/decisions`), (s) => { decisions = s.val() || {}; update('dec'); }, (e) => toast(e.message, 'bad')));
    } catch (e) { connectionView(app, e); }
  });
}
boot();
