"use strict";
/* One page for every participant. Each person gets one task: one of the six cells of the decision study
   (human_study/PROTOCOL.md) or the rating task (ANNOTATION_PLAN.md). The two tasks differ in length and pay, so each has
   its own Prolific listing, and the listing's link names the task: ?task=decide (a cell is then drawn with equal
   chance from a hash of the Prolific ID), ?task=rate, or a cell such as recall-anxious. A link with a Prolific ID and
   no task is a set-up error and stops. Without either, the page is a preview and lists the tasks. */
(function () {
  const Q = new URLSearchParams(location.search), PID = Q.get("PROLIFIC_PID") || "";
  const CELLS = ["recall-neutral", "recall-calm", "recall-anxious", "recall-excited", "advice-neutral", "advice-anxious"];
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  let task = Q.get("task");
  if (task === "decide") task = PID ? CELLS[hash(PID + "|cell") % CELLS.length] : null;
  const load = src => { const s = document.createElement("script"); s.src = src; document.body.append(s); };
  if (task === "rate") load("annotate.js?v=7");
  else if (CELLS.includes(task)) { window.AA_CELL = task; load("decide.js?v=5"); }
  else if (PID) {  // nobody is given a task by guess
    for (const s of document.querySelectorAll(".screen")) s.hidden = true;
    const el = document.createElement("section"); el.className = "screen center";
    el.innerHTML = `<h1>This link is incomplete</h1><p class="sub">The study cannot start from this link. Please return your submission on Prolific and send the researchers a message. We are sorry for the trouble.</p>`;
    document.querySelector("#app").append(el);
  } else {  // preview: choose what to look at
    for (const s of document.querySelectorAll(".screen")) s.hidden = true;
    document.querySelector("#preview").hidden = false;
    const name = c => c === "rate" ? "Rating task: the feeling in short texts"
      : `Decision task, ${c.startsWith("recall") ? "writing" : "advice"} version: ${c.split("-")[1]}`;
    const el = document.createElement("section"); el.className = "screen";
    el.innerHTML = `<h1>Study preview</h1><p class="sub">A participant arrives from a Prolific listing and is given one of these tasks. Choose one to look at.</p>` +
      ["rate", ...CELLS].map(c => `<p><a class="btn" href="?task=${c}">${name(c)}</a></p>`).join("");
    document.querySelector("#app").append(el);
  }
})();
