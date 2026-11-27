"use strict";
/* Decision task (human_study/PROTOCOL.md, version 1.1): people do what the language models did. One of six cells:
   recall arm (write a neutral fact or a calm, anxious or excited moment, then choose between gambles with the text
   in view, then six calculation items) or advice arm (read a person's neutral or worried message, then recommend a
   gamble). Texts and decks come from data/decide.json, which build_decide.py copies from the study materials.
   route.js sets window.AA_CELL ("recall-anxious", ...). One screen at a time, no back button. */
(async function () {
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const CFG = window.STUDY_CONFIG || {}, Q = new URLSearchParams(location.search);
const EMU = ["localhost", "127.0.0.1"].includes(location.hostname) && Q.has("emulator") ? +Q.get("emulator") || 9010 : 0;
const FB = EMU ? { apiKey: "demo-key", projectId: "demo-aa", databaseURL: `http://127.0.0.1:${EMU}?ns=demo-aa-default-rtdb` } : CFG.firebase;
const PREVIEW = !FB;
const [ARM, COND] = window.AA_CELL.split("-");
const PID = Q.get("PROLIFIC_PID") || "", SID = Q.get("STUDY_ID") || "", SES = Q.get("SESSION_ID") || "";
const KEY = `aa-decide-${window.AA_CELL}-${PID || "preview"}`;
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
function shuffle(a, seed) { let x = seed || 1; const r = () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) ^ Math.imul(x ^ (x >>> 13), 3266489909)) >>> 0) / 4294967296; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
// paragraphs, bold and "- " lists are all the study texts use
const md = t => t.split(/\n\s*\n/).map(b => /^- /.test(b.trim()) ? "<ul>" + b.trim().split("\n").map(l => `<li>${inline(l.replace(/^- /, ""))}</li>`).join("") + "</ul>" : `<p>${inline(b.replace(/\n/g, " "))}</p>`).join("");

const D = await (await fetch("data/decide.json")).json();
const main = $("#app");
for (const s of $$(".screen", main)) s.hidden = true;
const box = document.createElement("section"); box.className = "screen decide"; main.append(box);
$("#preview").hidden = !PREVIEW;
if (window.AAMark) AAMark.mount($("#mark"), { n: 10, sw: 0.3, still: true });

let st = null;
try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
if (!st || st.version !== D.version) {
  const deck = Math.min(Math.max(+Q.get("deck") || hash((PID || String(Date.now())) + "|deck") % D.decks.length + 1, 1), D.decks.length);
  const seed = hash((PID || String(Date.now())) + "|order");
  st = { task: "decide", version: D.version, cell: window.AA_CELL, deck, pid: PID, study_id: SID, session_id: SES, started: new Date().toISOString(),
         step: 0, n: 0, data: {}, queue: [], order: shuffle(D.decks[deck - 1].map((_, i) => i), seed),
         calc: shuffle(D.calc.items.map((_, i) => i), seed + 1), stai: shuffle(D.stai6.items.map((_, i) => i), seed + 2),
         emo: shuffle(D.discrete.items.map((_, i) => i), seed + 3) };
  save();
}
const ROWS = D.decks[st.deck - 1];

/* saving, as in annotate.js: each write waits in st.queue until the server confirms it and goes once to
   aa_ratings/decide/{sid}/{path}; the rules refuse reads, overwrites and deletes. */
const SDK = "https://www.gstatic.com/firebasejs/10.14.1", NOW = { ".sv": "timestamp" };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const late = (p, ms) => Promise.race([p, sleep(ms).then(() => { throw Object.assign(new Error("timeout"), { code: "timeout" }); })]);
const clean = s => s.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
let fbp = null, flushing = null; const sent = new Map();
const sdk = () => fbp || (fbp = Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-database.js`)]).then(([A, B]) => {
  const db = B.getDatabase(A.initializeApp(FB, "aad"));
  if (EMU) B.connectDatabaseEmulator(db, "127.0.0.1", EMU);
  return { B, db };
}).catch(e => { fbp = null; throw e; }));
const put = (path, v) => { if (FB && st.sid) { st.queue.push([path, v]); flush(); } };
function flush() {
  return flushing || (flushing = (async () => {
    for (let k = 0; st.queue.length;) {
      const [p, v] = st.queue[0];
      try {
        const { B, db } = await late(sdk(), 15000);
        if (!sent.has(p)) sent.set(p, B.set(B.ref(db, `aa_ratings/decide/${st.sid}/${p}`), v));
        await late(sent.get(p), 10000);
      } catch (e) {
        if (!/permission/i.test(`${e.code} ${e.message}`)) { if (e.code !== "timeout") sent.delete(p); await sleep(Math.min(30000, 1000 * 2 ** k++)); continue; }
        console.warn("write refused, taken as saved before:", p);
      }
      st.queue.shift(); save(); k = 0;
    }
  })().finally(() => { flushing = null; }));
}
addEventListener("beforeunload", e => { if (FB && st.queue.length) e.preventDefault(); });
let t0 = 0;
function record(k, v) {  // one answer: kept in the browser and, with a backend, saved at once
  st.data[k] = v;
  put(`events/${st.n++}`, { k, v: typeof v === "string" ? v.slice(0, 4000) : v, ms: Math.min(Math.round(performance.now() - t0), 864e5), at: NOW });
  save();
}

/* screen helpers */
function show(html, wide) { box.innerHTML = html; main.classList.toggle("wide", !!wide); scrollTo(0, 0); t0 = performance.now(); return box; }
const nextBtn = (label = "Continue") => `<div class="row end"><p class="note" id="d-note"></p><button type="button" class="btn primary" id="d-next" disabled>${label}</button></div>`;
const waitClick = () => new Promise(r => { $("#d-next").onclick = r; });
// Continue opens after `ms` on the page; the clock is performance.now(), as for the reading time of the rating task
function openAfter(ms, ready = () => true, note = "", short = "") {
  const tick = () => {
    const left = ms - (performance.now() - t0), ok = ready();
    if (!$("#d-next")) return;
    $("#d-next").disabled = !ok || left > 0;
    $("#d-note").textContent = left > 0 ? note.replace("{s}", Math.ceil(left / 1000)) : ok ? "" : short;
    if (left > 0) setTimeout(tick, 250);
  };
  tick(); return tick;
}
function scale(k, q, n, lo, mid, hi, from = 1) {
  const b = Array.from({ length: n }, (_, j) => `<button type="button" role="radio" aria-checked="false" data-v="${j + from}">${j + from}</button>`).join("");
  return `<fieldset class="scale" data-k="${k}" style="--n:${n}"><legend>${q}</legend><div class="opts" role="radiogroup">${b}</div>
    <div class="ends"><span>${lo}</span><span>${mid}</span><span>${hi}</span></div></fieldset>`;
}
const words = (k, q, opts) => `<fieldset class="scale" data-k="${k}" style="--n:${Math.min(opts.length, 3)}"><legend>${q}</legend><div class="opts words" role="radiogroup">` +
  opts.map(([v, t]) => `<button type="button" role="radio" aria-checked="false" data-v="${esc(v)}">${esc(t)}</button>`).join("") + "</div></fieldset>";
// wires every .scale on the screen; resolves with {key: value} once all are answered and Continue is pressed
async function answer(minMs = 0, rec = true) {
  const vals = {}, need = $$(".scale", box).length;
  const tick = openAfter(minMs, () => Object.keys(vals).length === need);
  for (const fs of $$(".scale", box)) for (const b of $$("button", fs)) b.onclick = () => {
    for (const o of $$("button", fs)) o.setAttribute("aria-checked", String(o === b));
    vals[fs.dataset.k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; tick();
  };
  await waitClick();
  if (rec) for (const [k, v] of Object.entries(vals)) record(k, v);
  return vals;
}
const page = async (h1, body, label) => { show(`${h1 ? `<h1>${h1}</h1>` : ""}<div class="prose">${body}</div>${nextBtn(label)}`); openAfter(0); await waitClick(); };
const feel = sfx => [
  async () => { show(scale("valence" + sfx, D.valence.text, 9, D.valence.anchors[1], D.valence.anchors[5], D.valence.anchors[9]) + nextBtn()); await answer(); },
  async () => { show(scale("arousal" + sfx, D.arousal.text, 9, D.arousal.anchors[1], D.arousal.anchors[5], D.arousal.anchors[9]) + nextBtn()); await answer(); },
];
const stai = sfx => async () => {
  show(`<p class="ask">${D.stai6.instruction}</p>` + st.stai.map(i => D.stai6.items[i]).map(it => words(it.id + sfx, it.text, Object.entries(D.stai6.options))).join("") + nextBtn());
  for (const fs of $$(".scale", box)) fs.style.setProperty("--n", 4);
  await answer();
};
const discrete = sfx => async () => {
  show(`<p class="ask">${D.discrete.instruction}</p>` + st.emo.map(i => D.discrete.items[i]).map(it => scale(it.id + sfx, it.text, 7, D.discrete.scale[1], "", D.discrete.scale[7])).join("") + nextBtn());
  await answer();
};
const mine = () => `<p class="lead">Earlier you wrote:</p><blockquote class="own">«${esc(st.data.text || "")}»</blockquote><p class="lead">With that still in mind, respond to the following.</p>`;

/* the screens, in order */
const steps = [];
steps.push(async () => {  // consent
  show(`<h1>${D.title}</h1><div class="prose">${D.consent.map(([h, t]) => `<p><b>${h}.</b> ${inline(t)}</p>`).join("")}</div>` +
    D.consent_questions.map((q, i) => words("consent" + (i + 1), q, [["yes", "Yes"], ["no", "No"]])).join("") + nextBtn());
  const v = await answer(0, false);
  if (v.consent1 !== "yes") return "declined";  // nothing is stored for someone who does not agree
  if (FB) {  // a session id nobody can guess, then the session's start
    st.sid = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18)))).replace(/\+/g, "-").replace(/\//g, "_");
    put("start", { task: "decide", version: D.version, cell: st.cell, deck: st.deck, pid: clean(PID), studyId: clean(SID), sessionId: clean(SES),
      order: st.order.map(i => ROWS[i].id), consentAt: NOW });
  }
  for (const k of ["consent1", "consent2", "consent3"]) record(k, v[k]);
});
steps.push(async () => {  // about you
  const [risk, attn] = D.pre;
  show(`<h1>A little about you</h1>
    <label class="field"><span>Age</span><input type="number" id="age" min="18" max="99" inputmode="numeric"></label>` +
    words("gender", "Gender", [["woman", "Woman"], ["man", "Man"], ["nonbinary", "Non-binary"], ["other", "Another gender"], ["na", "Prefer not to say"]]) +
    words("education", "Highest level of education", [["lt_hs", "Less than high school"], ["hs", "High school"], ["some_college", "Some college"], ["bachelor", "Bachelor's degree"], ["master", "Master's degree"], ["doctorate", "Doctorate or professional degree"]]) +
    scale(risk.id, risk.text, 11, risk.scale[0], "", risk.scale[10], 0) +
    words(attn.id, attn.text, attn.scale.split(", ").map(o => [o, o])) + nextBtn());
  await answer();
  const age = parseInt($("#age").value, 10); if (age >= 18 && age <= 99) record("age", age);
});
steps.push(async () => {  // instructions and the three questions about them, at most twice
  const ins = `<div class="prose">${md(D.instructions)}${ARM === "advice" ? md(D.advice_paragraph) : ""}</div>`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    show(`<h1>How the choices work</h1>${attempt === 2 ? `<p class="err">One or more answers were not correct. Please read the instructions again.</p>` : ""}${ins}${nextBtn()}`);
    openAfter(0); await waitClick();
    show(D.comprehension.map((c, i) => words("comp" + (i + 1), c.q, c.options.map((o, j) => [String(j), o]))).join("") + nextBtn());
    for (const fs of $$(".scale", box)) fs.style.setProperty("--n", 1);
    const v = await answer();
    record("comp_attempts", attempt);
    if (D.comprehension.every((c, i) => +v["comp" + (i + 1)] === c.correct)) return;
  }
  return "screened";
});
const trial = async (key, lead, stem, a, b, q, label) => {
  show(`<p class="label">${label}</p><div class="trial">${lead}<div class="gamble"><p>${esc(stem)}</p><p>${esc(a)}</p><p>${esc(b)}</p><p><b>${esc(q)}</b></p></div>` +
    words(key, "", [["A", "Option A"], ["B", "Option B"]]) + "</div>" + nextBtn("Next"));
  for (const fs of $$(".scale", box)) fs.style.setProperty("--n", 2);
  await answer();
};
steps.push(() => trial("practice", `<p class="lead">This is a practice screen. It is not paid.</p>`, D.practice.stem, D.practice.a, D.practice.b, D.practice.q, "Practice"));
if (ARM === "recall") {
  steps.push(() => page("A short text", `<p>${D.recall_intro}</p>`));
  steps.push(async () => {  // the writing task: at least 300 characters, no pasting, two minutes on the page
    show(`<p class="ask">${esc(D.prompts[COND])}</p><textarea id="own" rows="9" maxlength="3000" spellcheck="true"></textarea><p class="note" id="wc">0 words</p>${nextBtn()}`);
    let pastes = 0; const ta = $("#own");
    ta.onpaste = e => { e.preventDefault(); pastes++; };
    ta.ondrop = e => e.preventDefault();
    const n = () => (ta.value.trim().match(/\S+/g) || []).length;
    const tick = openAfter(120000, () => ta.value.trim().length >= 300, "You can continue in {s} seconds.", "Please write a little more, about 100 words.");
    ta.oninput = () => { $("#wc").textContent = `${n()} words`; tick(); };
    await waitClick();
    record("text", ta.value.trim()); record("word_count", n()); record("paste_attempts", pastes);
  });
  steps.push(async () => {
    show(`<label class="field"><span>${D.one_word.text}</span><input type="text" id="word" maxlength="30" autocomplete="off"></label>${nextBtn()}`);
    const tick = openAfter(0, () => /^\S+$/.test($("#word").value.trim())); $("#word").oninput = tick;
    await waitClick(); record(D.one_word.id, $("#word").value.trim());
  });
  steps.push(...feel("_1"), stai("_1"), discrete("_1"));
  steps.push(() => page("The choices", `<p>${D.trial_intro}</p>`));
} else {
  steps.push(() => page("Helping people decide", `<p>${D.advice_intro}</p><p>${D.advice_incentive}</p>`));
}
for (const i of st.order) steps.push(() => {
  const r = ROWS[i], key = "trial:" + r.id;
  return ARM === "recall" ? trial(key, mine(), r.stem_recall, r.a, r.b, r.q_recall, "Choice")
    : trial(key, `<p class="lead">Message:</p><blockquote class="own">«${esc(COND === "anxious" ? r.msg_anx : r.msg_neu)}»</blockquote><p class="lead">Here is what I need help with.</p>`, r.stem_advice, r.a, r.b, r.q_advice, "Choice");
});
if (ARM === "recall") for (const i of st.calc) steps.push(async () => {  // the calculation items, with the text still in view
  const c = D.calc.items[i];
  show(`<p class="label">Calculation</p><div class="trial">${mine()}<div class="gamble"><p>${esc(c.gamble)}</p><p><b>${esc(D.calc.question)}</b></p></div>` +
    words("calc:" + c.id, "", c.options.map(o => [String(o), "$" + o])) + "</div>" + nextBtn("Next"));
  for (const fs of $$(".scale", box)) fs.style.setProperty("--n", 4);
  await answer();
});
steps.push(...feel("_2"));
if (ARM === "recall") steps.push(async () => { show(scale(D.kept_in_mind.id, D.kept_in_mind.text, 7, D.kept_in_mind.scale[1], "", D.kept_in_mind.scale[7]) + nextBtn()); await answer(); });
else steps.push(stai("_2"), discrete("_2"), async () => { show(D.stimulus_check.map(q => scale(q.id, q.text, 7, q.scale[1], "", q.scale[7])).join("") + nextBtn()); await answer(); });
steps.push(async () => {  // exit questions
  show(`<label class="field"><span>In a sentence or two, what do you think this study was about?</span><textarea id="x1" rows="3" maxlength="1000"></textarea></label>
    <label class="field"><span>How did you decide between the gambles?</span><textarea id="x2" rows="3" maxlength="1000"></textarea></label>` +
    words("use_data", "Did you pay attention throughout the study, and should we use your data? Your answer does not affect your payment.", [["yes", "Yes, use my data"], ["no", "No, do not use my data"]]) + nextBtn());
  for (const fs of $$(".scale", box)) fs.style.setProperty("--n", 2);
  await answer(); record("exit_about", $("#x1").value.trim()); record("exit_strategy", $("#x2").value.trim());
});
steps.push(async () => {  // mood repair; the text is not stored, only its length
  show(`<p class="ask">${D.repair[0]}</p><textarea id="rep" rows="4" maxlength="1000"></textarea>${nextBtn()}`);
  openAfter(45000, () => true, "You can continue in {s} seconds."); await waitClick(); record("repair_chars", $("#rep").value.trim().length);
});
steps.push(async () => {
  show(`<p class="ask">${D.repair[1]}</p><div class="calm" role="img" aria-label="A calm landscape"></div>`);
  await new Promise(r => { const tick = () => performance.now() - t0 >= 30000 ? r() : setTimeout(tick, 250); tick(); });
});
steps.push(async () => { show(scale("valence_final", D.valence.text, 9, D.valence.anchors[1], D.valence.anchors[5], D.valence.anchors[9]) + nextBtn()); await answer(); });
steps.push(() => page("Support", md(D.support[0]) + (st.data.valence_final <= 3 ? md(D.support[1]) : "")));
steps.push(() => page("", md(ARM === "advice" ? D.debrief : D.debrief.split(/\n\s*\n/).filter(p => !p.startsWith("If you were in the advice version")).join("\n\n")), "Finish"));

function done(kind) {
  $("#count").textContent = ""; $("#fill").style.width = kind === "declined" ? "0" : "100%";
  const link = (url, text) => url ? `<div class="row center"><a class="btn primary" href="${esc(url)}">${text}</a></div>` : "";
  if (kind === "declined") show(`<h1>Thank you</h1><p class="sub">You chose not to take part. You can close this window.</p>`);
  else if (kind === "screened") show(`<h1>Thank you</h1><p class="sub">${D.screen_out}</p>${link(CFG.screenOutUrl, "Return to Prolific")}`);
  else if (PREVIEW) {
    show(`<h1>Preview finished</h1><p class="sub">Nothing was sent. You can download the answers to check the data format.</p><div class="row center"><button type="button" class="btn" id="dl">Download answers</button><button type="button" class="btn" id="again">Start again</button></div>`);
    $("#dl").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify({ ...st, queue: undefined }, null, 2)], { type: "application/json" })); a.download = `decision-${st.cell}-deck${st.deck}.json`; a.click(); };
    $("#again").onclick = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
  } else show(`<h1>Thank you</h1><p class="sub">Your answers have been saved. Please click the button below to return to Prolific and record your completion.</p>${link(CFG.completionUrlDecide, "Return to Prolific")}`);
  box.classList.add("center");
}
async function finish() {  // the Prolific link only once the server has confirmed every write
  if (PREVIEW) return done("sent");
  for (;;) {
    show(`<h1>Saving…</h1><p class="sub">Please keep this window open.</p>`);
    await late(flush(), 20000).catch(() => {});
    if (!st.queue.length) return done("sent");
    show(`<h1>Not saved yet</h1><p class="err">Your answers are not saved yet. Please check your connection, keep this window open and press Try again.</p>${nextBtn("Try again")}`);
    openAfter(0); await waitClick();
  }
}

if (FB && st.queue.length) flush();
if (st.end) { st.end === "sent" ? finish() : done(st.end); return; }
for (; st.step < steps.length; st.step++, save()) {
  $("#count").textContent = st.step > 2 ? `${st.step + 1} of ${steps.length}` : "";
  $("#fill").style.width = `${(st.step / steps.length) * 100}%`;
  const end = await steps[st.step]();
  if (end) { st.end = end; record("end", end); if (end === "screened" && FB) await late(flush(), 15000).catch(() => {}); return done(end); }
}
st.end = "sent"; put("submitted", NOW); save();
finish();
})();
