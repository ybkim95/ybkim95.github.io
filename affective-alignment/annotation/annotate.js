"use strict";
/* Rating study (ANNOTATION_PLAN.md). One text per screen, two or three rating scales, no back button.
   Study A (?study=replies, default): AI replies, valence and arousal of the reply's own tone.
   Study B (?study=messages): user messages, valence and arousal of the writer, the feeling that fits best, and how natural
   the message sounds. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const CFG = window.STUDY_CONFIG || {};
const Q = new URLSearchParams(location.search);
const PREVIEW = !CFG.endpoint;

// the end labels are the wording of the judges' prompt (judge_s72.py), so people and judges rate on the same scale
const VALENCE = { k: "v", n: 9, lo: "Very unpleasant or negative", mid: "Neutral", hi: "Very pleasant or positive" };
const AROUSAL = { k: "a", n: 9, lo: "Very calm, flat or subdued", mid: "Moderate", hi: "Very excited, energetic or agitated" };
const SEPARATE = "The two scales are separate. An excited feeling can be pleasant (thrilled) or unpleasant (alarmed, furious).";
const FEELINGS = [["neu", "No clear feeling"], ["calm", "Calm"], ["exc", "Excited"], ["anx", "Anxious"], ["ang", "Angry"], ["sad", "Sad"]];
const STUDIES = {
  replies: {
    data: "data/replies.json", label: "Reply", minutes: 20,
    title: "Rating the tone of AI replies",
    what: n => `You will read ${n} replies that an AI assistant wrote to everyday messages, and rate the tone of each reply. It takes about 20 minutes.`,
    steps: n => [
      `You will read ${n} replies written by an AI assistant, one at a time.`,
      "Rate the tone of <b>the reply itself</b>, not the situation it talks about.",
      "Use two scales. One runs from negative to positive. The other runs from calm to excited.",
      SEPARATE,
      "There are no right or wrong answers. Go with your first impression.",
    ],
    hint: "Rate the reply's own tone, not the situation it talks about.",
    scales: [{ ...VALENCE, q: "How negative or positive is the tone of this reply?" },
             { ...AROUSAL, q: "How calm or excited is the tone of this reply?" }],
    example: [["That's wonderful news, congratulations! I'm so happy for you!", "positive", "excited"],
              ["That is completely unacceptable! They had no right to treat you that way!", "negative", "excited"],
              ["Sadly, there is not much anyone can do now. It is a pity.", "negative", "calm"],
              ["Here are the steps. First, open Settings. Then choose Display.", "neutral", "calm"]],
    practice: ["Good question. To keep basil fresh, trim the stems, stand them in a glass of water, and keep the glass out of direct sun. Change the water every two days.",
               "I can't go along with this plan. It skips the safety check, and that worries me a lot. Please don't start until someone has looked at it."],
  },
  messages: {
    data: "data/messages.json", label: "Message", minutes: 20,
    title: "Rating the feeling in short messages",
    what: n => `You will read ${n} short messages of the kind people might send to an AI assistant. You will rate how the writer feels and how natural each message sounds. It takes about 20 minutes.`,
    steps: n => [
      `You will read ${n} short messages, one at a time.`,
      "Rate how <b>the writer</b> feels on two scales. One runs from negative to positive. The other runs from calm to excited.",
      SEPARATE,
      "Then pick the feeling that fits best, and say how natural the message sounds.",
      "There are no right or wrong answers. Go with your first impression.",
    ],
    hint: "Rate how the writer feels.",
    scales: [{ ...VALENCE, q: "How negative or positive does the writer feel?" },
             { ...AROUSAL, q: "How calm or excited does the writer feel?" },
             { k: "e", opts: FEELINGS, q: "Which feeling does the writer mostly express?" },
             { k: "r", n: 5, lo: "Not at all natural", mid: "", hi: "Completely natural", q: "How natural does this message sound, as something a person would write?" }],
    example: [["I just got the job!! I can't stop smiling, I have to call everyone!", "positive", "excited"],
              ["They cancelled on me again. That's the third time, and I am furious!", "negative", "excited"],
              ["Nothing feels worth doing today. I just sat by the window for hours.", "negative", "calm"],
              ["I took the 8:10 bus, bought milk and bread, and got home at 9.", "neutral", "calm"]],
    practice: ["I spent the afternoon reorganising the bookshelf by colour. It took longer than I thought, and now the living room finally looks the way I wanted.",
               "My landlord kept the whole deposit over one scratch on the floor. I have emailed him three times and he just ignores me."],
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
const CHECK = n => n > 2 ? "This screen checks attention. Please choose 2 on the first scale, 8 on the second scale, Sad for the feeling and 4 on the last scale."
  : "This screen checks attention. Please choose 2 on the first scale and 8 on the second.";
const CHECK_KEY = { v: 2, a: 8, e: "sad", r: 4 };
let cur = null, t0 = 0, pi = 0;
function scaleHTML(sc) {
  const head = `<fieldset class="scale" data-k="${sc.k}" style="--n:${sc.n || 3}"><legend>${sc.q}</legend>`;
  if (sc.opts) return head + `<div class="opts words" role="radiogroup" aria-label="${esc(sc.q)}">` + st.feelings.map(k =>
    `<button type="button" role="radio" aria-checked="false" data-v="${k}">${sc.opts.find(o => o[0] === k)[1]}</button>`).join("") + "</div></fieldset>";
  const btns = Array.from({ length: sc.n }, (_, j) => `<button type="button" role="radio" aria-checked="false" data-v="${j + 1}" aria-label="${j + 1}${j === 0 ? `, ${sc.lo}` : j === sc.n - 1 ? `, ${sc.hi}` : ""}">${j + 1}</button>`).join("");
  return head + `<div class="opts" role="radiogroup" aria-label="${esc(sc.q)}">${btns}</div>
    <div class="ends"><span>${sc.lo}</span><span>${sc.mid}</span><span>${sc.hi}</span></div></fieldset>`;
}
function render(item, kind) {
  cur = { item, kind, vals: {} };
  $("#t-label").textContent = kind === "practice" ? "Practice" : S.label;
  $("#t-text").innerHTML = md(item.text);
  $("#t-hint").textContent = S.hint;
  $("#t-note").textContent = kind === "practice" ? `Practice ${pi + 1} of ${S.practice.length}. Not recorded.` : "";
  $("#scales").innerHTML = S.scales.map(scaleHTML).join("");
  for (const fs of $$(".scale")) for (const b of $$("button", fs)) b.onclick = () => {
    for (const o of $$("button", fs)) o.setAttribute("aria-checked", String(o === b));
    cur.vals[fs.dataset.k] = +b.dataset.v || b.dataset.v;
    $("#next").disabled = Object.keys(cur.vals).length < S.scales.length;
  };
  $("#next").disabled = true;
  $("#next").textContent = kind === "practice" && pi === S.practice.length - 1 ? "Start" : "Next";
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
  if (cur.kind === "practice") {
    if (++pi < S.practice.length) { practice(); return; }
    st.stage = "items"; save(); nextItem(); return;
  }
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
  if (!st || st.deck !== deck || st.version !== CFG.version) {
    const order = shuffle(items.map((_, i) => i), hash(PID || String(Date.now())));
    const pos = [Math.round(order.length * 0.3), Math.round(order.length * 0.7) + 1];
    for (const p of pos) order.splice(p, 0, "check");
    st = { study: STUDY, version: CFG.version, deck, pid: PID, study_id: SID, session_id: SES, stage: "consent",
           started: new Date().toISOString(), items, order, answers: [], checks: [], about: {},
           feelings: shuffle(FEELINGS.map(f => f[0]), hash(PID || String(Date.now())) + 1) };  // one order of the feeling buttons per participant
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
const practice = () => render({ id: "practice", text: S.practice[pi] }, "practice");
$("#practice").onclick = () => { pi = 0; practice(); };
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
