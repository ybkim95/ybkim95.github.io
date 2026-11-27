"use strict";
/* One link for every participant. Each person gets one task: one of the six cells of the decision study
   (human_study/PROTOCOL.md) or the rating task (ANNOTATION_PLAN.md). The task comes from ?task= (rate, decide, or a
   cell such as recall-anxious), else from a hash of the Prolific ID, weighted by the people each task needs.
   Without either, the page is a preview and lists the tasks. */
(function () {
  const Q = new URLSearchParams(location.search), PID = Q.get("PROLIFIC_PID") || "";
  const CELLS = ["recall-neutral", "recall-calm", "recall-anxious", "recall-excited", "advice-neutral", "advice-anxious"];
  const NEED = [...CELLS.map(c => [c, 452]), ["rate", 335]];  // recruited per task (PROTOCOL.md section 8, ANNOTATION_PLAN.md)
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const pick = (list, key) => { let x = hash(PID + "|" + key) % list.reduce((a, [, w]) => a + w, 0); return list.find(([, w]) => (x -= w) < 0)[0]; };
  let task = Q.get("task");
  if (task === "decide") task = PID ? pick(CELLS.map(c => [c, 1]), "cell") : null;
  else if (!task && PID) task = pick(NEED, "task");
  const load = src => { const s = document.createElement("script"); s.src = src; document.body.append(s); };
  if (task === "rate") load("annotate.js?v=6");
  else if (CELLS.includes(task)) { window.AA_CELL = task; load("decide.js?v=3"); }
  else {  // preview: choose what to look at
    for (const s of document.querySelectorAll(".screen")) s.hidden = true;
    document.querySelector("#preview").hidden = false;
    const name = c => c === "rate" ? "Rating task: the feeling in short texts"
      : `Decision task, ${c.startsWith("recall") ? "writing" : "advice"} version: ${c.split("-")[1]}`;
    const el = document.createElement("section"); el.className = "screen";
    el.innerHTML = `<h1>Study preview</h1><p class="sub">A participant arrives with a Prolific ID and is given one of these tasks. Choose one to look at.</p>` +
      ["rate", ...CELLS].map(c => `<p><a class="btn" href="?task=${c}">${name(c)}</a></p>`).join("");
    document.querySelector("#app").append(el);
  }
})();
