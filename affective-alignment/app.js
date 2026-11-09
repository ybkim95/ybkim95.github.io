"use strict";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

$("#theme").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const t = dark ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("aa-theme", t); } catch (e) {}
});
const citeBtn = $("#cite-btn"), citePop = $("#cite-pop");
citeBtn.addEventListener("click", e => { e.stopPropagation(); const open = citePop.hidden; citePop.hidden = !open; citeBtn.setAttribute("aria-expanded", String(open)); });
document.addEventListener("click", e => { if (!citePop.hidden && !citePop.contains(e.target)) { citePop.hidden = true; citeBtn.setAttribute("aria-expanded", "false"); } });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !citePop.hidden) { citePop.hidden = true; citeBtn.setAttribute("aria-expanded", "false"); citeBtn.focus(); } });
$("#copy-bib").addEventListener("click", async e => {
  try { await navigator.clipboard.writeText($("#bibtex").textContent); e.target.textContent = "Copied"; } catch (err) { e.target.textContent = "Select and copy"; }
  setTimeout(() => (e.target.textContent = "Copy"), 1600);
});

/* helpers */
function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}
function txt(parent, x, y, s, attrs = {}) { const t = el("text", { x, y, ...attrs }, parent); t.textContent = s; return t; }
function svg(host, w, h) { host.innerHTML = ""; return el("svg", { viewBox: `0 0 ${w} ${h}` }, host); }
const wOf = (host, def) => Math.round(host.clientWidth || def);
const lin = (d0, d1, r0, r1) => v => r0 + (v - d0) / (d1 - d0) * (r1 - r0);
const tip = $("#tip");
function hover(node, html) {
  node.addEventListener("pointerenter", () => { tip.innerHTML = html(); tip.classList.add("on"); });
  node.addEventListener("pointermove", e => { tip.style.left = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8) + "px"; tip.style.top = (e.clientY + 16) + "px"; });
  node.addEventListener("pointerleave", () => tip.classList.remove("on"));
}
const DEVCOL = { Google: "--google", Anthropic: "--exc", OpenAI: "--ink" };
const devColor = d => `var(${DEVCOL[d] || "--other"})`;
const sgn = (v, d = 1) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d);
function count(node, from, to, ms, dec = 0, suffix = "") {
  if (reduce) { node.textContent = to.toFixed(dec) + suffix; return; }
  cancelAnimationFrame(node.__raf);
  let t0 = null;
  const step = t => {
    if (t0 === null) t0 = t;
    const k = Math.max(0, Math.min(1, (t - t0) / ms)), e = 1 - Math.pow(1 - k, 3);
    node.textContent = (from + (to - from) * e).toFixed(dec) + suffix;
    if (k < 1) node.__raf = requestAnimationFrame(step);
  };
  node.__raf = requestAnimationFrame(step);
}
function placer(W, H) {
  const boxes = [];
  const hit = b => b.x0 < 0 || b.x1 > W || b.y0 < 0 || b.y1 > H || boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    block(x, y, r) { boxes.push({ x0: x - r, x1: x + r, y0: y - r, y1: y + r }); },
    put(parent, x, y, r, s, cls = "name") {
      const w = s.length * 6.0 + 2, h = 13;
      for (const [tx, ty, an] of [[x + r + 5, y + 4, "start"], [x - r - 5, y + 4, "end"], [x, y - r - 5, "middle"], [x, y + r + 14, "middle"]]) {
        const x0 = an === "start" ? tx : an === "end" ? tx - w : tx - w / 2, b = { x0, x1: x0 + w, y0: ty - 10, y1: ty - 10 + h };
        if (!hit(b)) { boxes.push(b); return txt(parent, tx, ty, s, { class: cls, "text-anchor": an }); }
      }
      return null;
    },
  };
}
function whenSeen(node, fn) {
  if (!("IntersectionObserver" in window)) return fn();
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(); } }), { threshold: 0.35 });
  io.observe(node);
}

/* hero stage: Gemini 3.5 Flash-Lite at its default thinking setting */
const STAGE = { neutral: 49.7, calm: 25.0, anxious: 14.0, excited: 61.0 };
let stageAuto = !reduce, stageTimer, stageCur = "neutral";
function setStage(e) {
  const prev = parseFloat($("#m-risk").textContent) || STAGE[stageCur]; stageCur = e;
  $("#stage").dataset.emo = e;
  for (const b of $$("#emo button")) b.setAttribute("aria-pressed", String(b.dataset.e === e));
  $("#f-ev").style.width = "100%";
  $("#f-risk").style.width = STAGE[e] + "%";
  $("#m-mark").style.left = STAGE.neutral + "%";
  count($("#m-risk"), prev, STAGE[e], 900, 0, "%");
}
for (const b of $$("#emo button")) b.addEventListener("click", () => { stageAuto = false; clearInterval(stageTimer); setStage(b.dataset.e); });
const ORDER = ["neutral", "anxious", "calm", "excited"];
setStage("neutral");
whenSeen($("#stage"), () => {
  if (!stageAuto) return;
  setTimeout(() => stageAuto && setStage("anxious"), 600);
  stageTimer = setInterval(() => { if (stageAuto) setStage(ORDER[(ORDER.indexOf(stageCur) + 1) % ORDER.length]); }, 3200);
});

/* cover: replay of one real example (Gemini 2.5 Flash-Lite, the same gamble after two texts) */
const REPLAY = {
  neutral: {
    mem: "Earlier you wrote: “The Great Barrier Reef, located off the coast of Queensland, Australia, is the world's largest single structure made by living organisms …”",
    reply: "“Option B Expected Value: (0.30 * $188) + (0.70 * $60) = <mark>$98.40</mark> … it is the mathematically preferred choice”",
    pick: "B",
  },
  anxious: {
    mem: "Earlier you wrote: “… I sometimes feel a low hum of anxiety … the sheer potential for things to go wrong …”",
    reply: "“Option B … has a higher expected value (EV = … = <mark>$98.40</mark>) … the guaranteed $60 from Option A is the safer, <mark class=\"r\">less anxiety-provoking choice</mark>”",
    pick: "A",
  },
};
const GAMBLE = "A: $60 for sure<br>B: 30% chance of $188, otherwise $60";
let coverRun = 0, coverAuto = !reduce, coverArm = "neutral";
const wait = ms => new Promise(r => setTimeout(r, ms));
function bubble(cls, html) {
  const d = document.createElement("div"); d.className = "b " + cls; d.innerHTML = html;
  $("#thread").appendChild(d); setTimeout(() => d.classList.add("in"), 30);
  return d;
}
async function play(arm) {
  const run = ++coverRun, r = REPLAY[arm], fast = reduce;
  coverArm = arm;
  $("#cover").dataset.arm = arm;
  for (const b of $$("#arms button")) b.setAttribute("aria-pressed", String(b.dataset.arm === arm));
  $("#hero-logo").classList.toggle("tilt", arm === "anxious");
  const pick = $("#pick"); pick.textContent = "·";
  $("#thread").innerHTML = "";
  bubble("user mem", `<span class="who">User</span>${r.mem}`); if (!fast) await wait(900); if (run !== coverRun) return;
  bubble("user", `<span class="who">User</span>${GAMBLE}`); if (!fast) await wait(900); if (run !== coverRun) return;
  const m = bubble("model", `<span class="who">Model</span><span class="typing"><i></i><i></i><i></i></span>`); if (!fast) await wait(1100); if (run !== coverRun) return;
  m.innerHTML = `<span class="who">Model</span>${r.reply}`;
  if (!fast) await wait(500); if (run !== coverRun) return;
  pick.textContent = r.pick; pick.classList.add("pop"); setTimeout(() => pick.classList.remove("pop"), 450);
  if (!coverAuto) return;
  await wait(4200); if (run !== coverRun || !coverAuto) return;
  play(arm === "neutral" ? "anxious" : "neutral");
}
for (const b of $$("#arms button")) b.addEventListener("click", () => { coverAuto = false; play(b.dataset.arm); });
play("neutral");

/* timing panel */
const POS = { now: 12.7, before: 0.9 };
let posAuto = !reduce, posTimer;
function setPos(p, animate = true) {
  const box = $("#convo"), prev = parseFloat($("#big-n").textContent) || POS[box.dataset.pos];
  box.dataset.pos = p;
  for (const b of $$("#pos button")) b.setAttribute("aria-pressed", String(b.dataset.p === p));
  if (animate) count($("#big-n"), prev, POS[p], 900, 1); else $("#big-n").textContent = POS[p].toFixed(1);
}
for (const b of $$("#pos button")) b.addEventListener("click", () => { posAuto = false; clearInterval(posTimer); setPos(b.dataset.p); });
whenSeen($("#convo"), () => { if (posAuto) posTimer = setInterval(() => posAuto && setPos($("#convo").dataset.pos === "now" ? "before" : "now"), 3000); });

/* 01 the map */
function drawMap(D, host = $("#c-map"), mini = false) {
  const W = wOf(host, 1000), H = mini ? 150 : Math.round(Math.min(440, Math.max(300, W * 0.48)));
  const m = mini ? { l: 8, r: 8, t: 8, b: 8 } : { l: 46, r: 18, t: 34, b: 42 };
  const x = lin(3.8, 7.2, m.l, W - m.r), y = lin(2.0, 6.0, H - m.b, m.t);
  const s = svg(host, W, H);
  if (!mini) {
    const g = el("g", { class: "grid" }, s), ax = el("g", { class: "ax" }, s);
    for (let v = 4; v <= 7; v++) { el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(ax, x(v), H - m.b + 18, v, { "text-anchor": "middle" }); }
    for (let a = 2; a <= 6; a++) { el("line", { x1: m.l, x2: W - m.r, y1: y(a), y2: y(a) }, g); txt(ax, m.l - 10, y(a) + 4, a, { "text-anchor": "end" }); }
    txt(s, x(3.8), H - 4, "← Unpleasant", { class: "lab" }); txt(s, x(7.2), H - 4, "Pleasant →", { class: "lab", "text-anchor": "end" });
    txt(s, 12, y(4), "Calm ← → Excited", { class: "lab", transform: `rotate(-90 12 ${y(4)})`, "text-anchor": "middle" });
  } else el("rect", { x: 0, y: 0, width: W, height: H, rx: 12, fill: "var(--soft)" }, s);
  el("line", { x1: x(5), x2: x(5), y1: m.t, y2: H - m.b, stroke: "var(--axis)", "stroke-dasharray": "3 4" }, s);
  el("line", { x1: m.l, x2: W - m.r, y1: y(5), y2: y(5), stroke: "var(--axis)", "stroke-dasharray": "3 4" }, s);
  const say = Object.fromEntries(D.say.map(p => [p.n, p]));
  const isC = p => Math.abs(p.v - 5) <= 0.1 && Math.abs(p.a - 5) <= 0.1;
  const others = el("g", {}, s), main = el("g", {}, s), labs = el("g", {}, s);
  const greys = mini ? [] : D.sound.filter(p => !say[p.n]).map(p => {
    const c = el("circle", { r: 4.5, fill: "var(--other)", class: "mv", style: `transform: translate(${x(p.v)}px, ${y(p.a)}px); opacity: 0` }, others);
    hover(c, () => `<b>${p.n}</b><br>sounds ${p.v.toFixed(2)}, ${p.a.toFixed(2)}`); return c;
  });
  const pts = D.say.map(p => {
    const snd = D.sound.find(q => q.n === p.n) || p, gg = el("g", { class: "mv" }, main);
    el("circle", { r: mini ? 4.5 : 6.5, fill: devColor(p.d), stroke: "var(--panel)", "stroke-width": 1.5 }, gg);
    if (!mini) hover(gg, () => `<b>${p.n}</b><br>says ${p.v.toFixed(2)}, ${p.a.toFixed(2)}<br>sounds ${snd.v.toFixed(2)}, ${snd.a.toFixed(2)}`);
    return { p, snd, gg };
  });
  let timer;
  function render(mode) {
    labs.innerHTML = ""; clearTimeout(timer);
    for (const { p, snd, gg } of pts) { const q = mode === "say" ? p : snd; gg.style.transform = `translate(${x(q.v)}px, ${y(q.a)}px)`; }
    for (const c of greys) c.style.opacity = mode === "sound" ? 0.9 : 0;
    if (mini) { txt(labs, W - 12, H - 12, mode === "say" ? "what they say" : "how they sound", { class: "val", "text-anchor": "end" }); return; }
    $("#map-hint").textContent = mode === "say" ? "Self-rated mood, 18 models" : "Tone of their replies, rated by judges · 22 more models in grey";
    timer = setTimeout(() => {
      const P = placer(W, H);
      for (const { p, snd } of pts) { const q = mode === "say" ? p : snd; P.block(x(q.v), y(q.a), 7); }
      if (mode === "say") P.put(labs, x(5), y(5), 12, `${D.say.filter(isC).length} models here`, "val");
      for (const { p, snd } of [...pts].sort((a, b) => (mode === "say" ? b.p.v - a.p.v : b.snd.v - a.snd.v))) {
        if (mode === "say" && isC(p)) continue;
        const q = mode === "say" ? p : snd; P.put(labs, x(q.v), y(q.a), 7, p.n);
      }
    }, reduce ? 0 : 700);
  }
  render("say");
  if (mini) { clearInterval(window.__abMap); let k = 0; whenSeen(host, () => { if (!reduce) window.__abMap = setInterval(() => render(++k % 2 ? "sound" : "say"), 2600); }); return; }
  for (const b of $$("#map-mode button")) b.onclick = () => { for (const o of $$("#map-mode button")) o.setAttribute("aria-pressed", String(o === b)); render(b.dataset.v); };
  const leg = el("g", {}, s); let lx = m.l + 2;
  for (const [d, n] of [["Google", "Google"], ["Anthropic", "Anthropic"], ["OpenAI", "OpenAI"], ["Other", "Others"]]) {
    el("circle", { cx: lx, cy: 12, r: 5, fill: devColor(d) }, leg); txt(leg, lx + 10, 16, n, { class: "lab" }); lx += 28 + n.length * 6.4;
  }
  whenSeen(host, () => { if (!reduce && $("#map-mode button[data-v=say]").getAttribute("aria-pressed") === "true") setTimeout(() => $("#map-mode button[data-v=sound]").click(), 1400); });
}

/* 02 mirroring */
function drawReact(D) {
  const by = {};
  for (const p of D.sound) (by[p.d] = by[p.d] || []).push(p);
  const med = a => { const s = a.map(p => p.r).sort((u, v) => u - v), k = s.length; return k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2; };
  const devs = Object.keys(by).sort((a, b) => med(by[b]) - med(by[a]));
  const host = $("#c-react"), row = 27, m = { l: 86, r: 16, t: 6, b: 38 }, W = wOf(host, 520), H = m.t + devs.length * row + m.b, x = lin(0.15, 0.65, m.l, W - m.r);
  const s = svg(host, W, H), ax = el("g", { class: "ax" }, s);
  for (const v of [0.2, 0.3, 0.4, 0.5, 0.6]) { el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b + 4, stroke: "var(--grid)" }, s); txt(ax, x(v), H - m.b + 18, v.toFixed(1), { "text-anchor": "middle" }); }
  txt(s, (m.l + W - m.r) / 2, H - 2, "steady → mirrors the user", { class: "lab", "text-anchor": "middle" });
  devs.forEach((d, i) => {
    const yy = m.t + i * row + row / 2;
    el("line", { x1: m.l, x2: W - m.r, y1: yy, y2: yy, stroke: "var(--line)" }, s);
    txt(s, m.l - 10, yy + 4, d, { class: "name" + (d === "Google" ? " hl" : ""), "text-anchor": "end" });
    const placed = [];
    for (const p of [...by[d]].sort((a, b) => a.r - b.r)) {
      let dy = 0; const cx = x(p.r);
      for (const k of [0, -5, 5, -9, 9]) if (!placed.some(q => Math.abs(q[0] - cx) < 8 && q[1] === k)) { dy = k; break; }
      placed.push([cx, dy]);
      const c = el("circle", { cx, cy: yy + dy, r: 4.8, fill: devColor(d), stroke: "var(--panel)", "stroke-width": 1.2 }, s);
      hover(c, () => `<b>${p.n}</b><br>${p.r.toFixed(2)}`);
    }
  });
}
function drawShift(D) {
  const host = $("#c-shift"), W = wOf(host, 520), H = Math.max(300, $("#c-react").clientHeight || 360), m = { l: 40, r: 12, t: 10, b: 38 };
  const x = lin(0, 3.6, m.l, W - m.r), y = lin(0, 16.5, H - m.b, m.t);
  const s = svg(host, W, H), ax = el("g", { class: "ax" }, s), g = el("g", { class: "grid" }, s);
  for (let v = 0; v <= 3; v++) { el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(ax, x(v), H - m.b + 18, v, { "text-anchor": "middle" }); }
  for (let v = 0; v <= 15; v += 5) { el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); txt(ax, m.l - 8, y(v) + 4, v, { "text-anchor": "end" }); }
  txt(s, (m.l + W - m.r) / 2, H - 2, "mood shift after emotional messages (grid points)", { class: "lab", "text-anchor": "middle" });
  txt(s, 10, (m.t + H - m.b) / 2, "change in risky choices (pp)", { class: "lab", transform: `rotate(-90 10 ${(m.t + H - m.b) / 2})`, "text-anchor": "middle" });
  const inBox = p => p.x > 1.6 && p.x < 2.5 && p.y < 5;
  el("rect", { x: x(1.66), y: y(5.7), width: x(2.55) - x(1.66), height: y(-0.3) - y(5.7), rx: 10, fill: "none", stroke: "var(--axis)", "stroke-dasharray": "3 4" }, s);
  txt(s, x(2.62), y(4.2), "Claude, gpt-oss-120b,", { class: "lab" });
  txt(s, x(2.62), y(4.2) + 14, "newest Gemini", { class: "lab" });
  const P = placer(W, H);
  for (const p of D.shift) P.block(x(p.x), y(p.y), 7);
  for (const p of D.shift) {
    const c = el("circle", { cx: x(p.x), cy: y(p.y), r: 6, fill: devColor(p.d), stroke: "var(--panel)", "stroke-width": 1.5 }, s);
    hover(c, () => `<b>${p.n}</b><br>mood shift ${p.x.toFixed(2)}<br>choices ${p.y.toFixed(1)} pp`);
  }
  const gpt = D.shift.filter(p => p.x < 1);
  if (gpt.length) P.put(s, x(gpt[0].x), y(gpt[0].y), 7, "GPT-6, GPT-6.1");
  for (const p of [...D.shift].sort((a, b) => b.y - a.y)) if (!inBox(p) && p.x >= 1) P.put(s, x(p.x), y(p.y), 7, p.n);
}

/* 04 table */
function drawTable(D) {
  const dom = Object.fromEntries(D.dom.map(p => [p.n, p])), rx = Object.fromEntries(D.sound.map(p => [p.n, p.r]));
  const rows = D.mem.map(p => ({ ...p, dom: dom[p.n] ? dom[p.n].b - dom[p.n].a : null, da: dom[p.n] && dom[p.n].a, db: dom[p.n] && dom[p.n].b, r: rx[p.n] ?? null }));
  const lo = -45, hi = 8;
  let key = "e", dir = 1;
  function render() {
    const tb = $("#tbl tbody"); tb.innerHTML = "";
    const sorted = [...rows].sort((a, b) => {
      const va = a[key], vb = b[key];
      if (key === "n") return dir * va.localeCompare(vb);
      if (va == null) return 1; if (vb == null) return -1;
      return dir * (va - vb);
    });
    for (const p of sorted) {
      const tr = document.createElement("tr");
      const w = 100, X = v => (v - lo) / (hi - lo) * w;
      const bar = `<svg viewBox="0 0 ${w} 16" preserveAspectRatio="none"><line x1="${X(0)}" x2="${X(0)}" y1="0" y2="16" stroke="var(--axis)" stroke-width="0.6" vector-effect="non-scaling-stroke"/><line x1="${X(p.lo)}" x2="${X(p.hi)}" y1="8" y2="8" stroke="var(--anx)" stroke-opacity=".45" stroke-width="2" vector-effect="non-scaling-stroke"/><rect x="${Math.min(X(0), X(p.e))}" y="5" width="${Math.abs(X(p.e) - X(0))}" height="6" rx="1" fill="${p.hi < 0 ? "var(--anx)" : "var(--other)"}"/></svg>`;
      const d = p.dom == null ? `<span class="mut">–</span>` : `${Math.round(p.da)}% → <span class="${p.dom > 0 ? "up" : ""}">${Math.round(p.db)}%</span>`;
      const r = p.r == null ? `<span class="mut">–</span>` : `<i class="rbar ${p.d === "Google" ? "g" : ""}" style="width:${Math.round((p.r - 0.15) * 160)}px"></i>${p.r.toFixed(2)}`;
      tr.innerHTML = `<td class="n"><i style="background:${devColor(p.d)}"></i>${p.n}</td><td class="e"><div class="cell-bar">${bar}<b>${sgn(p.e)}</b></div></td><td class="dom">${d}</td><td>${r}</td>`;
      tb.appendChild(tr);
    }
    for (const th of $$("#tbl th")) { th.classList.toggle("sorted", th.dataset.s === key); th.classList.toggle("desc", th.dataset.s === key && dir < 0); }
  }
  for (const th of $$("#tbl th")) th.onclick = () => { if (key === th.dataset.s) dir = -dir; else { key = th.dataset.s; dir = key === "e" ? 1 : -1; if (key === "n") dir = 1; } render(); };
  render();
}

/* bars */
function bars(host, rows, max, unit) {
  const W = wOf(host, 520), narrow = W < 440, row = narrow ? 52 : 46;
  const m = { l: narrow ? 0 : 200, r: 56, t: narrow ? 14 : 6, b: 8 }, H = m.t + rows.length * row + m.b, x = lin(0, max, m.l, W - m.r);
  const s = svg(host, W, H);
  rows.forEach((r, i) => {
    const yy = m.t + i * row + row / 2 + (narrow ? 6 : 0), g = el("g", {}, s);
    if (r.sep) el("line", { x1: 0, x2: W, y1: m.t + i * row - 2, y2: m.t + i * row - 2, stroke: "var(--line)" }, s);
    const rect = el("rect", { x: x(0), y: yy - (narrow ? 8 : 11), width: reduce ? Math.max(2, x(r.v) - x(0)) : 0, height: narrow ? 16 : 22, rx: 4, fill: r.col }, g);
    txt(g, x(r.v) + 8, yy + 4, r.v.toFixed(1) + unit, { class: "val" });
    if (narrow) txt(g, 0, yy - 14, r.label, { class: "name" }); else txt(g, m.l - 12, yy + 4, r.label, { class: "name", "text-anchor": "end" });
    if (!reduce) { rect.style.transition = `width 1s cubic-bezier(.22,.7,.2,1) ${i * 120}ms`; whenSeen(host, () => rect.setAttribute("width", Math.max(2, x(r.v) - x(0)))); }
  });
}
function drawPlace(D) {
  const L = { K: "With a reminder", NK: "Without the reminder", S: "Said to be a stranger's", MT: "One turn earlier", IR: "Declared unrelated" };
  bars($("#c-place"), D.place.map(p => ({ label: L[p.k], v: p.v, col: p.k === "MT" || p.k === "IR" ? "var(--other)" : "var(--anx)", sep: p.k === "IR" })), 14, "");
}
function drawCons() {
  const soft = "color-mix(in srgb, var(--anx) 45%, var(--panel))";
  bars($("#c-cons"), [
    { label: "Agent · worry about the case", v: 17.3, col: "var(--anx)" },
    { label: "Agent · unrelated worry", v: 11.6, col: soft },
    { label: "Adviser · worry about the case", v: 10.6, col: "var(--anx)", sep: true },
    { label: "Adviser · unrelated worry", v: 5.3, col: soft },
  ], 20, " pp");
}

/* reveal */
if ("IntersectionObserver" in window && !reduce) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
  for (const n of $$(".ab, .sec h2, .panel, .stage, .cap")) { n.classList.add("reveal"); io.observe(n); }
}

let DATA = null;
function drawAll() {
  if (!DATA) return;
  drawMap(DATA);
  drawReact(DATA); drawShift(DATA); drawTable(DATA); drawPlace(DATA); drawCons();
}
fetch("data.json").then(r => r.json()).then(d => { DATA = d; drawAll(); });
let lastW = innerWidth, rt;
addEventListener("resize", () => { if (Math.abs(innerWidth - lastW) < 8) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(drawAll, 150); });
