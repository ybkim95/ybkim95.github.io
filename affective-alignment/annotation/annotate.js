"use strict";
/* Rating study (ANNOTATION_PLAN.md). One text per screen, two or three rating scales, no back button.
   Study A (?study=replies, default): AI replies, valence and arousal of the reply's own tone.
   Study B (?study=messages): user messages, valence and arousal of the writer, and whether a person could have written it. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const CFG = window.STUDY_CONFIG || {};
const Q = new URLSearchParams(location.search);
const PREVIEW = !CFG.endpoint;

const VALENCE = { k: "v", n: 9, lo: "Very negative", mid: "Neutral", hi: "Very positive" };
const AROUSAL = { k: "a", n: 9, lo: "Very calm", mid: "Moderate", hi: "Very energetic" };
const STUDIES = {
  replies: {
    data: "data/replies.json", label: "Reply", minutes: 20,
    title: "Rating the tone of AI replies",
    what: n => `You will read ${n} replies that an AI assistant wrote to everyday messages, and rate the feeling each reply expresses. It takes about 20 minutes.`,
    steps: n => [
      `You will read ${n} replies written by an AI assistant, one at a time.`,
      "For each reply, rate the feeling <b>the reply itself</b> expresses. Ignore the situation it talks about.",
      "Use two scales. How negative or positive, and how calm or energetic.",
      "There are no right or wrong answers. Go with your impression.",
    ],
    hint: "Rate the reply's own tone, not the situation it describes.",
    scales: [{ ...VALENCE, q: "How negative or positive is the feeling this reply expresses?" },
             { ...AROUSAL, q: "How calm or energetic is the feeling it expresses?" }],
    example: [["That's wonderful news, congratulations! I'm so happy for you!", "positive", "energetic"],
              ["Here are the steps. First, open Settings. Then choose Display.", "neutral", "calm"]],
    practice: "Good question. To keep basil fresh, trim the stems, stand them in a glass of water, and keep the glass out of direct sun. Change the water every two days.",
  },
  messages: {
    data: "data/messages.json", label: "Message", minutes: 15,
    title: "Rating the feeling in short messages",
    what: n => `You will read ${n} short messages that people might send to an AI assistant, and rate how the writer feels. It takes about 15 minutes.`,
    steps: n => [
      `You will read ${n} short messages, one at a time.`,
      "For each message, rate how <b>the writer</b> feels.",
      "Then say whether a real person could have written it.",
      "There are no right or wrong answers. Go with your impression.",
    ],
    hint: "Rate how the writer feels.",
    scales: [{ ...VALENCE, q: "How negative or positive does the writer feel?" },
             { ...AROUSAL, q: "How calm or energetic does the writer feel?" },
             { k: "r", n: 5, lo: "Not at all", mid: "", hi: "Definitely", q: "Could a real person have written this message?" }],
    example: [["I just got the job!! I can't stop smiling, I have to call everyone!", "positive", "energetic"],
              ["I took the 8:10 bus, bought milk and bread, and got home at 9.", "neutral", "calm"]],
    practice: "I spent the afternoon reorganising the bookshelf by colour. It took longer than I thought, and now the living room finally looks the way I wanted.",
  },
};
const STUDY = STUDIES[Q.get("study")] ? Q.get("study") : "replies";
const S = STUDIES[STUDY];
const PID = Q.get("PROLIFIC_PID") || "", SID = Q.get("STUDY_ID") || "", SES = Q.get("SESSION_ID") || "";
const KEY = `aa-annot-${STUDY}-${PID || "preview"}`;

function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function shuffle(a, seed) { let x = seed || 1; const r = () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) ^ Math.imul(x ^ (x >>> 13), 3266489909)) >>> 0) / 4294967296; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// a small, safe Markdown subset, so replies read as they would in a chat
function md(src) {
  const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\W)[*_](\S.*?\S|\S)[*_](?=\W|$)/g, "$1<i>$2</i>");
  const out = []; let list = null;
  for (const raw of src.replace(/\r/g, "").split("\n")) {
    const line = raw.trim(), ul = line.match(/^[-*•]\s+(.*)/), ol = line.match(/^\d+[.)]\s+(.*)/), h = line.match(/^#{1,6}\s+(.*)/);
    if (ul || ol) { const tag = ul ? "ul" : "ol"; if (!list || list.tag !== tag) { if (list) out.push(`</${list.tag}>`); out.push(`<${tag}>`); list = { tag }; } out.push(`<li>${inline((ul || ol)[1])}</li>`); continue; }
    if (list) { out.push(`</${list.tag}>`); list = null; }
    if (!line) continue;
    out.push(h ? `<p><b>${inline(h[1])}</b></p>` : `<p>${inline(line)}</p>`);
  }
  if (list) out.push(`</${list.tag}>`);
  return out.join("");
}

let st = null;
try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

function show(id) {
  for (const s of $$(".screen")) s.hidden = s.id !== id;
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
    ["Researchers", "Cynthia Breazeal (principal investigator) and colleagues, Massachusetts Institute of Technology. Contact ybkim95@media.mit.edu."],
    ["What you will do", S.what(n)],
    ["Payment", "The amount shown on Prolific, paid when you finish."],
    ["Risks and benefits", "The texts are about everyday matters. We do not expect any risk beyond everyday reading. You will not benefit directly. Your ratings help us test how well automated tools judge feelings in text."],
    ["Your choice", "Taking part is voluntary. You may stop at any time by closing this window."],
    ["Your data", "We do not record your name, IP address or location. Your Prolific ID is used only for payment and to prevent repeat participation, and is deleted 30 days after payment. Your anonymous ratings may be shared publicly with the published research."],
    ["Questions", "Contact the researchers at ybkim95@media.mit.edu. For questions about your rights as a participant, contact the MIT Committee on the Use of Humans as Experimental Subjects (COUHES) at couhes@mit.edu."],
  ].map(([h, t]) => `<p><b>${h}.</b> ${t}</p>`).join("");
  show("s-consent");
}

/* rating screen */
const CHECK = n => n === 3 ? "This screen checks attention. Please choose 2 on the first scale, 8 on the second and 4 on the third."
  : "This screen checks attention. Please choose 2 on the first scale and 8 on the second.";
const CHECK_KEY = { v: 2, a: 8, r: 4 };
let cur = null, t0 = 0;
function scaleHTML(sc, i) {
  const btns = Array.from({ length: sc.n }, (_, j) => `<button type="button" role="radio" aria-checked="false" data-v="${j + 1}" aria-label="${j + 1}${j === 0 ? `, ${sc.lo}` : j === sc.n - 1 ? `, ${sc.hi}` : ""}">${j + 1}</button>`).join("");
  return `<fieldset class="scale" data-k="${sc.k}" style="--n:${sc.n}"><legend>${sc.q}</legend><div class="opts" role="radiogroup" aria-label="${esc(sc.q)}">${btns}</div>
    <div class="ends"><span>${sc.lo}</span><span>${sc.mid}</span><span>${sc.hi}</span></div></fieldset>`;
}
function render(item, kind) {
  cur = { item, kind, vals: {} };
  $("#t-label").textContent = kind === "practice" ? "Practice" : S.label;
  $("#t-text").innerHTML = md(item.text);
  $("#t-hint").textContent = S.hint;
  $("#t-note").textContent = kind === "practice" ? "This one is practice and is not recorded." : "";
  $("#scales").innerHTML = S.scales.map(scaleHTML).join("");
  for (const fs of $$(".scale")) for (const b of $$("button", fs)) b.onclick = () => {
    for (const o of $$("button", fs)) o.setAttribute("aria-checked", String(o === b));
    cur.vals[fs.dataset.k] = +b.dataset.v;
    $("#next").disabled = Object.keys(cur.vals).length < S.scales.length;
  };
  $("#next").disabled = true;
  $("#next").textContent = kind === "practice" ? "Start" : "Next";
  t0 = performance.now();
  show("s-item");
  progress();
}
function nextItem() {
  const k = st.answers.length + st.checks.length;
  if (k >= st.order.length) { st.stage = "about"; save(); progress(); show("s-about"); return; }
  const o = st.order[k];
  render(o === "check" ? { id: "check", text: CHECK(S.scales.length) } : st.items[o], o === "check" ? "check" : "item");
}
$("#next").onclick = () => {
  const ms = Math.round(performance.now() - t0);
  if (cur.kind === "practice") { st.stage = "items"; save(); nextItem(); return; }
  if (cur.kind === "check") {
    st.checks.push({ pos: st.answers.length + st.checks.length + 1, ...cur.vals, pass: S.scales.every(s => cur.vals[s.k] === CHECK_KEY[s.k]), ms });
  } else st.answers.push({ id: cur.item.id, ...cur.vals, ms });
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
  if (!st || st.deck !== deck) {
    const order = shuffle(items.map((_, i) => i), hash(PID || String(Date.now())));
    const pos = [Math.round(order.length * 0.3), Math.round(order.length * 0.7) + 1];
    for (const p of pos) order.splice(p, 0, "check");
    st = { study: STUDY, version: CFG.version, deck, pid: PID, study_id: SID, session_id: SES, stage: "consent",
           started: new Date().toISOString(), items, order, answers: [], checks: [], about: {} };
    save();
  }
  if (st.stage === "consent") consent(items.length);
  else if (st.stage === "intro") intro();
  else if (st.stage === "items") nextItem();
  else if (st.stage === "about" || st.stage === "sending") show("s-about");
  else if (st.stage === "declined") done("declined");
  else done(PREVIEW ? "preview" : "sent", { ...st, items: undefined });
}
function intro() {
  $("#i-steps").innerHTML = S.steps(st.items.length).map(s => `<li>${s}</li>`).join("");
  $("#i-example").innerHTML = `<p class="ex-h">For example</p>` + S.example.map(([t, v, a]) =>
    `<div class="ex-row"><p>“${esc(t)}”</p><span>${v}</span><span>${a}</span></div>`).join("");
  show("s-intro");
}
$("#agree").onclick = () => { st.stage = "intro"; st.consent_at = new Date().toISOString(); save(); intro(); };
$("#decline").onclick = () => { st.stage = "declined"; save(); done("declined"); };
$("#practice").onclick = () => render({ id: "practice", text: S.practice }, "practice");
for (const g of $$(".chips")) for (const b of $$("button", g)) b.onclick = () => {
  for (const o of $$("button", g)) o.setAttribute("aria-pressed", String(o === b));
  st.about[g.dataset.name] = b.dataset.v; save();
};
$("#submit").onclick = async () => {
  const age = parseInt($("#age").value, 10);
  if (age >= 18 && age <= 99) st.about.age = age;
  st.comment = $("#comment").value.trim();
  st.finished = new Date().toISOString();
  st.stage = "sending"; save();
  await send();
};
async function send() {
  const payload = { ...st, items: undefined };
  if (PREVIEW) { st.stage = "sent"; save(); done("preview", payload); return; }
  $("#submit").disabled = true; $("#submit").textContent = "Sending…";
  try {
    await fetch(CFG.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload) });
    st.stage = "sent"; save(); done("sent");
  } catch (e) {
    $("#submit").disabled = false; $("#submit").textContent = "Try again";
    $("#submit").insertAdjacentHTML("beforebegin", `<p class="err">Your answers could not be sent. Please check your connection and try again.</p>`);
  }
}
function done(kind, payload) {
  const T = $("#d-title"), B = $("#d-body"), A = $("#d-actions");
  A.innerHTML = "";
  $("#count").textContent = ""; $("#fill").style.width = kind === "declined" ? "0" : "100%";
  if (kind === "declined") { T.textContent = "Thank you"; B.textContent = "You chose not to take part. You can close this window."; }
  else if (kind === "preview") {
    T.textContent = "Preview finished"; B.textContent = "Nothing was sent. You can download the answers to check the data format.";
    const b = document.createElement("button"); b.className = "btn"; b.textContent = "Download answers";
    b.onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })); a.download = `annotation-${STUDY}-deck${st.deck}.json`; a.click(); };
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
