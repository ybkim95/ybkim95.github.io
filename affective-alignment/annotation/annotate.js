"use strict";
/* Rating study (ANNOTATION_PLAN.md, version 2.0). One link and one task: each participant reads a mixed deck of AI
   replies (ids r###) and user messages (ids m###), one text per screen, with the same three items on every screen
   (valence and arousal of the text's own tone, and the feeling it mostly expresses). No back button. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const CFG = window.STUDY_CONFIG || {};
const Q = new URLSearchParams(location.search);
// on localhost, ?emulator[=port] saves to the Database emulator (project demo-aa, backend/README.md) instead
const EMU = ["localhost", "127.0.0.1"].includes(location.hostname) && Q.has("emulator") ? +Q.get("emulator") || 9010 : 0;
const FB = EMU ? { apiKey: "demo-key", projectId: "demo-aa", databaseURL: `http://127.0.0.1:${EMU}?ns=demo-aa-default-rtdb` } : CFG.firebase;
const PREVIEW = !FB;

// the end labels are the wording of the judges' prompt (judge_s72.py), so people and judges rate on the same scale
const VALENCE = { k: "v", n: 9, lo: "Very unpleasant or negative", mid: "Neutral", hi: "Very pleasant or positive" };
const AROUSAL = { k: "a", n: 9, lo: "Very calm, flat or subdued", mid: "Moderate", hi: "Very excited, energetic or agitated" };
const FEELINGS = [["neu", "No clear feeling"], ["calm", "Calm"], ["exc", "Excited"], ["anx", "Anxious"], ["ang", "Angry"], ["sad", "Sad"]];
const STUDY = "texts";
const S = {
  data: "data/texts.json",
  title: "Rating the feeling in short texts",
  what: n => `You will read ${n} short texts and rate the feeling each one expresses. Some are messages of the kind people send to an AI assistant, and the others are replies written by an AI assistant. Two more screens check attention. It takes about 20 minutes.`,
  steps: n => [
    `You will read ${n} short texts, one at a time. Some are messages of the kind people send to an AI assistant. The others are replies written by an AI assistant.`,
    "Rate the tone of <b>the text itself</b>, not the situation it talks about.",
    "Two scales come first. One runs from negative to positive, the other from calm to excited. They are separate: an excited feeling can be pleasant (thrilled) or unpleasant (alarmed, furious).",
    "Then pick the feeling that fits best.",
    "There are no right or wrong answers. Go with your first impression.",
  ],
  hint: "Rate the tone of the text itself, not the situation it talks about.",
  scales: [{ ...VALENCE, q: "How negative or positive is the tone of this text?" },
           { ...AROUSAL, q: "How calm or excited is the tone of this text?" },
           { k: "e", opts: FEELINGS, q: "Which feeling does it mostly express?" }],
  example: [["I just got the job!! I can't stop smiling, I have to call everyone!", "positive", "excited"],
            ["That is completely unacceptable! They had no right to treat you that way!", "negative", "excited"],
            ["Nothing feels worth doing today. I just sat by the window for hours.", "negative", "calm"],
            ["Here are the steps. First, open Settings. Then choose Display.", "neutral", "calm"]],
  practice: [{ id: "r", text: "Good question. To keep basil fresh, trim the stems, stand them in a glass of water, and keep the glass out of direct sun. Change the water every two days." },
             { id: "m", text: "My landlord kept the whole deposit over one scratch on the floor. I have emailed him three times and he just ignores me." }],
};
// the small line above a text: an id starts with r (AI reply) or m (message)
const LABEL = id => id === "check" ? "Attention check" : id[0] === "m" ? "Message" : "AI reply";
const PID = Q.get("PROLIFIC_PID") || "", SID = Q.get("STUDY_ID") || "", SES = Q.get("SESSION_ID") || "";
const KEY = `aa-annot-v2-${PID || "preview"}`;

function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function shuffle(a, seed) { let x = seed || 1; const r = () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) ^ Math.imul(x ^ (x >>> 13), 3266489909)) >>> 0) / 4294967296; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// a small, safe Markdown subset, so replies read as they would in a chat
function md(src) {
  const unesc = t => t.replace(/&(gt|lt|amp|quot|#39);/g, (_, e) => ({ gt: ">", lt: "<", amp: "&", quot: '"', "#39": "'" }[e]));
  const inline = t => esc(t).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\W)[*_](\S.*?\S|\S)[*_](?=\W|$)/g, "$1<i>$2</i>");
  const out = []; let open = null;  // the block that is open: ul, ol, blockquote, table or pre
  const close = () => { if (open) { out.push(`</${open}>`); open = null; } };
  const to = (tag, attr = "") => { if (open !== tag) { close(); out.push(`<${tag}${attr}>`); open = tag; } };
  for (const raw of unesc(src).replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (/^```/.test(line)) { if (open === "pre") close(); else to("pre"); continue; }
    if (open === "pre") { out.push(esc(raw) + "\n"); continue; }
    const ul = line.match(/^[-*•]\s+(.*)/), ol = line.match(/^(\d+)[.)]\s+(.*)/), h = line.match(/^#{1,6}\s+(.*)/), bq = line.match(/^>\s?(.*)/);
    const inList = open === "ul" || open === "ol";
    if (!line) { if (!inList) close(); }
    else if (/^([-*_])(\s*\1){2,}$/.test(line)) { close(); out.push("<hr>"); }
    else if (ul) { to("ul"); out.push(`<li>${inline(ul[1])}</li>`); }
    else if (ol) { to("ol", ` start="${ol[1]}"`); out.push(`<li>${inline(ol[2])}</li>`); }
    else if (inList && /^\s{2,}\S/.test(raw)) out[out.length - 1] = out[out.length - 1].replace(/<\/li>$/, `<br>${inline(line.replace(/^>\s?/, ""))}</li>`);  // a list item that runs on
    else if (bq) { to("blockquote"); if (bq[1]) out.push(`<p>${inline(bq[1])}</p>`); }
    else if (/^\|.*\|$/.test(line)) {
      if (/^[\s|:-]+$/.test(line)) continue;  // the rule under the header row
      const cell = open === "table" ? "td" : "th"; to("table");
      out.push("<tr>" + line.slice(1, -1).split("|").map(c => `<${cell}>${inline(c.trim())}</${cell}>`).join("") + "</tr>");
    }
    else { close(); out.push(h ? `<p><b>${inline(h[1])}</b></p>` : `<p>${inline(line)}</p>`); }
  }
  close();
  return out.join("");
}

let st = null;
try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

/* saving, only with a backend. Each write waits in st.queue (kept in localStorage) until the server confirms it, and goes once
   to aa_ratings/sessions/{st.sid}/{path}; the rules refuse reads, overwrites and deletes (backend/database.rules.json). A
   refused write is taken as saved before (a repeat after a reload or a lost reply), so the queue never sticks. */
const SDK = "https://www.gstatic.com/firebasejs/10.14.1", NOW = { ".sv": "timestamp" };  // NOW: the server's time
const sleep = ms => new Promise(r => setTimeout(r, ms));
const late = (p, ms) => Promise.race([p, sleep(ms).then(() => { throw Object.assign(new Error("timeout"), { code: "timeout" }); })]);
const clean = s => s.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
let fbp = null, flushing = null; const sent = new Map();  // path -> the SDK's promise for the write sent from this page
const sdk = () => fbp || (fbp = Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-database.js`)]).then(([A, D]) => {
  const db = D.getDatabase(A.initializeApp(FB, "aa"));
  if (EMU) D.connectDatabaseEmulator(db, "127.0.0.1", EMU);
  return { D, db };
}).catch(e => { fbp = null; throw e; }));
const put = (path, v) => { if (FB) { st.queue.push([path, v]); flush(); } };
function flush() {
  return flushing || (flushing = (async () => {
    for (let k = 0; st.queue.length;) {
      const [p, v] = st.queue[0];
      try {
        const { D, db } = await late(sdk(), 15000);
        if (!sent.has(p)) sent.set(p, D.set(D.ref(db, `aa_ratings/sessions/${st.sid}/${p}`), v));
        await late(sent.get(p), 10000);
      } catch (e) {
        if (!/permission/i.test(`${e.code} ${e.message}`)) {  // offline or slow: the SDK resends by itself, so wait for the same write
          if (e.code !== "timeout") sent.delete(p);
          await sleep(Math.min(30000, 1000 * 2 ** k++)); continue;
        }
        console.warn("write refused, taken as saved before:", p);
      }
      st.queue.shift(); save(); k = 0;
    }
  })().finally(() => { flushing = null; }));
}
addEventListener("beforeunload", e => { if (FB && st && st.queue && st.queue.length) e.preventDefault(); });

function show(id) {
  for (const s of $$(".screen")) s.hidden = s.id !== id;
  $("#app").classList.toggle("wide", id === "s-item");
  scrollTo(0, 0);
}
function progress() {
  const total = st && st.order ? st.order.length : 0, done = st ? st.answers.length + st.checks.length : 0;
  $("#count").textContent = st && st.stage === "items" ? `${Math.min(done + 1, total)} of ${total}` : "";
  $("#fill").style.width = total ? `${(done / total) * 100}%` : "0";
}

/* consent */
function consent(n) {
  $("#c-title").textContent = S.title;
  $("#c-body").innerHTML = [
    ["Study", "How people perceive the feeling expressed in short texts."],
    ["Who can take part", "Adults aged 18 or older who read English fluently."],
    ["Researchers", "Cynthia Breazeal (principal investigator) and colleagues, Massachusetts Institute of Technology. Contact ybkim95@mit.edu."],
    ["What you will do", S.what(n)],
    ["Payment", "The amount shown on Prolific, paid to everyone who finishes."],
    ["Risks and benefits", "The texts are about everyday matters. We do not expect any risk beyond everyday reading. You will not benefit directly. Your ratings help us test how well automated tools judge feelings in text."],
    ["Your choice", "Taking part is voluntary. You may stop at any time by closing this window."],
    ["Your data", "We record your ratings, the time each one takes and your optional answers at the end. We do not store your name, IP address or location. Your Prolific ID is used only for payment and to prevent repeat participation, and is deleted 30 days after payment. Your anonymous ratings may be shared publicly with the published research."],
    ["Questions", "Contact the researchers at ybkim95@mit.edu. For questions about your rights as a participant, contact the MIT Committee on the Use of Humans as Experimental Subjects (COUHES) at couhes@mit.edu."],
  ].map(([h, t]) => `<p><b>${h}.</b> ${t}</p>`).join("");
  show("s-consent");
}

/* rating screen */
const CHECK = "This screen checks attention. Please choose 2 on the first scale, 8 on the second scale and Sad for the feeling.";
const CHECK_KEY = { v: 2, a: 8, e: "sad" };
// Next opens only after a short reading time (100 ms per word, at least 3 s and at most 20 s), so nobody clicks through unread
const minRead = text => Math.min(20000, Math.max(3000, text.trim().split(/\s+/).length * 100));
let cur = null, t0 = 0, pi = 0, waitTimer = 0;
function scaleHTML(sc) {
  const head = `<fieldset class="scale" data-k="${sc.k}" style="--n:${sc.n || 3}"><legend>${sc.q}</legend>`;
  if (sc.opts) return head + `<div class="opts words" role="radiogroup" aria-label="${esc(sc.q)}">` + st.feelings.map(k =>
    `<button type="button" role="radio" aria-checked="false" data-v="${k}">${sc.opts.find(o => o[0] === k)[1]}</button>`).join("") + "</div></fieldset>";
  const btns = Array.from({ length: sc.n }, (_, j) => `<button type="button" role="radio" aria-checked="false" data-v="${j + 1}" aria-label="${j + 1}${j === 0 ? `, ${sc.lo}` : j === sc.n - 1 ? `, ${sc.hi}` : ""}">${j + 1}</button>`).join("");
  return head + `<div class="opts" role="radiogroup" aria-label="${esc(sc.q)}">${btns}</div>
    <div class="ends"><span>${sc.lo}</span><span>${sc.mid}</span><span>${sc.hi}</span></div></fieldset>`;
}
function gate() {  // Next: every item answered and the reading time over
  clearTimeout(waitTimer);
  const answered = Object.keys(cur.vals).length === S.scales.length, wait = cur.min - (performance.now() - t0);
  $("#next").disabled = !answered || wait > 0;
  $("#t-note").textContent = answered && wait > 0 ? "Please take a moment to read the text." : cur.note;
  if (answered && wait > 0) waitTimer = setTimeout(gate, wait + 30);
}
function render(item, kind) {
  cur = { item, kind, vals: {}, min: minRead(item.text), note: kind === "practice" ? `Practice ${pi + 1} of ${S.practice.length}. Not recorded.` : "" };
  $("#t-label").textContent = LABEL(item.id) + (kind === "practice" ? " (practice)" : "");
  $("#t-text").innerHTML = md(item.text);
  $("#t-hint").textContent = S.hint;
  $("#scales").innerHTML = S.scales.map(scaleHTML).join("");
  for (const fs of $$(".scale")) for (const b of $$("button", fs)) b.onclick = () => {
    for (const o of $$("button", fs)) o.setAttribute("aria-checked", String(o === b));
    cur.vals[fs.dataset.k] = +b.dataset.v || b.dataset.v;
    gate();
  };
  $("#next").textContent = kind === "practice" && pi === S.practice.length - 1 ? "Start" : "Next";
  t0 = performance.now();
  gate();
  show("s-item");
  progress();
}
function nextItem() {
  const k = st.answers.length + st.checks.length;
  if (k >= st.order.length) { st.stage = "about"; save(); progress(); show("s-about"); return; }
  const o = st.order[k];
  render(o === "check" ? { id: "check", text: CHECK } : st.items[o], o === "check" ? "check" : "item");
}
$("#next").onclick = () => {
  const ms = Math.round(performance.now() - t0);
  if (cur.kind === "practice") {
    if (++pi < S.practice.length) { practice(); return; }
    st.stage = "items"; save(); nextItem(); return;
  }
  const pos = st.answers.length + st.checks.length, tm = { ms: Math.min(ms, 864e5), at: NOW };  // pos: the place in st.order
  if (cur.kind === "check") {
    st.checks.push({ pos: pos + 1, ...cur.vals, pass: S.scales.every(s => cur.vals[s.k] === CHECK_KEY[s.k]), ms });
    put(`checks/${pos}`, { ...cur.vals, pass: st.checks[st.checks.length - 1].pass, ...tm });
  } else { st.answers.push({ id: cur.item.id, ...cur.vals, ms }); put(`answers/${pos}`, { id: cur.item.id, ...cur.vals, ...tm }); }
  save(); nextItem();
};

/* flow */
async function start() {
  if (window.AAMark) AAMark.mount($("#mark"), { n: 10, sw: 0.3, still: true });
  $("#preview").hidden = !PREVIEW;
  const data = await (await fetch(S.data)).json();
  const nd = data.decks.length;
  const deck = Math.min(Math.max(+Q.get("deck") || (PID ? hash(PID) % nd + 1 : Math.floor(Math.random() * nd) + 1), 1), nd);
  const items = data.decks[deck - 1];
  if (!st || st.deck !== deck || st.version !== CFG.version || (FB && !st.sid && st.stage !== "consent")) {
    const order = shuffle(items.map((_, i) => i), hash(PID || String(Date.now())));
    const pos = [Math.round(order.length * 0.3), Math.round(order.length * 0.7) + 1];
    for (const p of pos) order.splice(p, 0, "check");
    st = { study: STUDY, version: CFG.version, deck, pid: PID, study_id: SID, session_id: SES, stage: "consent",
           started: new Date().toISOString(), items, order, answers: [], checks: [], about: {},
           feelings: shuffle(FEELINGS.map(f => f[0]), hash(PID || String(Date.now())) + 1) };  // one order of the feeling buttons per participant
    save();
  }
  if (FB && st.queue && st.queue.length) flush();  // writes left from an earlier visit
  if (st.stage === "consent") consent(items.length);
  else if (st.stage === "intro") intro();
  else if (st.stage === "items") nextItem();
  else if (st.stage === "about" || st.stage === "sending") { show("s-about"); if (FB && st.stage === "sending") send(); }
  else if (st.stage === "declined") done("declined");
  else done(PREVIEW ? "preview" : "sent", { ...st, items: undefined });
}
function intro() {
  $("#i-steps").innerHTML = S.steps(st.items.length).map(s => `<li>${s}</li>`).join("");
  $("#i-example").innerHTML = `<p class="ex-h">For example</p>` + S.example.map(([t, v, a]) =>
    `<div class="ex-row"><p>“${esc(t)}”</p><span>${v}</span><span>${a}</span></div>`).join("");
  show("s-intro");
}
$("#agree").onclick = () => {
  st.stage = "intro"; st.consent_at = new Date().toISOString();
  if (FB) {  // a session id nobody can guess (18 random bytes), then the session's start
    st.sid = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18)))).replace(/\+/g, "-").replace(/\//g, "_"); st.queue = [];
    put("start", { study: STUDY, version: CFG.version, deck: st.deck, pid: clean(PID), studyId: clean(SID), sessionId: clean(SES),
      order: st.order.map(o => o === "check" ? o : st.items[o].id), feelings: st.feelings, consentAt: NOW });
  }
  save(); intro();
};
$("#decline").onclick = () => { st.stage = "declined"; save(); done("declined"); };
const practice = () => render(S.practice[pi], "practice");
$("#practice").onclick = () => { pi = 0; practice(); };
for (const g of $$(".chips")) for (const b of $$("button", g)) b.onclick = () => {
  for (const o of $$("button", g)) o.setAttribute("aria-pressed", String(o === b));
  st.about[g.dataset.name] = b.dataset.v; save();
};
$("#submit").onclick = async () => {
  if (PREVIEW || st.stage !== "sending") {  // with a backend, a second press only retries
    const age = parseInt($("#age").value, 10);
    if (age >= 18 && age <= 99) st.about.age = age;
    st.comment = $("#comment").value.trim();
    st.finished = new Date().toISOString();
    st.stage = "sending";
    put("about", { ...st.about, ...(st.comment && { comment: st.comment.slice(0, 1000) }), at: NOW }); put("submitted", NOW);
    save();
  }
  await send();
};
async function send() {
  const payload = { ...st, items: undefined };
  if (PREVIEW) { st.stage = "sent"; save(); done("preview", payload); return; }
  $("#submit").disabled = true; $("#submit").textContent = "Saving…";
  for (const e of $$("#s-about .err")) e.remove();
  await late(flush(), 20000).catch(() => {});  // the Prolific link only once the server has confirmed every write
  if (!st.queue.length) { st.stage = "sent"; save(); done("sent"); return; }
  $("#submit").disabled = false; $("#submit").textContent = "Try again";
  $("#submit").insertAdjacentHTML("beforebegin", `<p class="err">Your answers are not saved yet. Please check your connection, keep this window open and press Try again.</p>`);
}
function done(kind, payload) {
  const T = $("#d-title"), B = $("#d-body"), A = $("#d-actions");
  A.innerHTML = "";
  $("#count").textContent = ""; $("#fill").style.width = kind === "declined" ? "0" : "100%";
  if (kind === "declined") { T.textContent = "Thank you"; B.textContent = "You chose not to take part. You can close this window."; }
  else if (kind === "preview") {
    T.textContent = "Preview finished"; B.textContent = "Nothing was sent. You can download the answers to check the data format.";
    const b = document.createElement("button"); b.className = "btn"; b.textContent = "Download answers";
    b.onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })); a.download = `annotation-deck${st.deck}.json`; a.click(); };
    const r = document.createElement("button"); r.className = "btn"; r.textContent = "Start again";
    r.onclick = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
    A.append(b, r);
  } else {
    T.textContent = "Thank you"; B.textContent = "Your answers have been saved.";
    if (CFG.completionUrl) { const a = document.createElement("a"); a.className = "btn primary"; a.href = CFG.completionUrl; a.textContent = "Return to Prolific"; A.append(a); }
  }
  show("s-done");
}
start();
