"use strict";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";
const STATIC = /[?&]static\b/.test(location.search);
if (STATIC) document.documentElement.classList.add("static");
const reduce = STATIC || matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
if (window.AAMark) { AAMark.mount($("#brand-mark"), { n: 10, sw: 0.3, still: reduce }); AAMark.mount($("#hero-mark"), { n: 18, sw: 0.5, still: reduce }); }

$("#theme").addEventListener("click", () => {
  const t = isDark() ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("aa-theme", t); } catch (e) {}
  drawAll();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => drawAll());
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
const sgn = (v, d = 1) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d);
const tip = $("#tip");
function hover(node, html) {
  node.addEventListener("pointerenter", () => { tip.innerHTML = html(); tip.classList.add("on"); });
  node.addEventListener("pointermove", e => { tip.style.left = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8) + "px"; tip.style.top = (e.clientY + 16) + "px"; });
  node.addEventListener("pointerleave", () => tip.classList.remove("on"));
}
function whenSeen(node, fn, threshold = 0.3) {
  if (!("IntersectionObserver" in window)) return fn();
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(); } }), { threshold });
  io.observe(node);
}
function placer(W, H, B) {
  const boxes = [], R = B || { x0: 0, y0: 0, x1: W, y1: H };
  const hit = b => b.x0 < R.x0 || b.x1 > R.x1 || b.y0 < R.y0 || b.y1 > R.y1 || boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    block(x, y, r) { boxes.push({ x0: x - r, x1: x + r, y0: y - r, y1: y + r }); },
    put(parent, x, y, r, s, cls = "name", left) {
      const w = s.length * 6.7 + 2, h = 14, sides = [[x + r + 5, y + 4, "start"], [x - r - 5, y + 4, "end"]];
      if (left) sides.reverse();
      for (const [tx, ty, an] of [...sides, [x, y - r - 6, "middle"], [x, y + r + 15, "middle"]]) {
        const x0 = an === "start" ? tx : an === "end" ? tx - w : tx - w / 2, b = { x0, x1: x0 + w, y0: ty - 11, y1: ty - 11 + h };
        if (!hit(b)) { boxes.push(b); return txt(parent, tx, ty, s, { class: cls, "text-anchor": an }); }
      }
      return null;
    },
    far(parent, x, y, r, s, cls = "name") {
      const w = s.length * 6.7 + 2, h = 14;
      for (const d of [26, 40, 56]) for (const [dx, dy] of [[1, -1], [1, 1], [-1, -1], [-1, 1], [0, -1.2], [0, 1.2], [1.3, 0], [-1.3, 0]]) {
        const tx = x + dx * d, ty = y + dy * d, an = dx > 0 ? "start" : dx < 0 ? "end" : "middle";
        const x0 = an === "start" ? tx + 3 : an === "end" ? tx - 3 - w : tx - w / 2, b = { x0, x1: x0 + w, y0: ty - 7, y1: ty + 7 };
        if (hit(b)) continue;
        boxes.push(b);
        el("line", { x1: x + dx * (r + 1) / Math.hypot(dx, dy), y1: y + dy * (r + 1) / Math.hypot(dx, dy), x2: tx, y2: ty, stroke: "var(--axis)", "stroke-width": 1 }, parent);
        return txt(parent, an === "start" ? tx + 3 : an === "end" ? tx - 3 : tx, ty + 4, s, { class: cls, "text-anchor": an });
      }
      return null;
    },
    label(parent, x, y, r, s, cls, crowded) { return (!crowded && this.put(parent, x, y, r, s, cls)) || this.far(parent, x, y, r, s, cls); },
  };
}

/* model families and their logos (lobe-icons) */
const FAM = [["claude", "Claude", "claude-color"], ["gemini", "Gemini", "gemini-color"], ["gemma", "Gemma", "gemma-crop"],
  ["gpt", "GPT", "openai"], ["kimi", "Kimi", "kimi-color"], ["r1 distill", "DeepSeek", "deepseek-color"], ["deepseek", "DeepSeek", "deepseek-color"],
  ["qwen", "Qwen", "qwen-color"], ["glm", "GLM", "zai"], ["minimax", "MiniMax", "minimax-color"], ["mistral", "Mistral", "mistral-color"],
  ["ministral", "Mistral", "mistral-color"], ["llama", "Llama", "meta-color"], ["phi", "Phi", "microsoft-color"], ["grok", "Grok", "grok"]];
// one-colour logos get a light copy on the dark theme
const MONO = new Set(["openai", "grok", "zai", "kimi-color"]);
function fam(name) {
  const n = name.toLowerCase(), f = FAM.find(([k]) => n.startsWith(k) || n.includes(k));
  if (!f) return { family: name, logo: null };
  return { family: f[1], logo: `logos/${f[2]}${MONO.has(f[2]) && isDark() ? "-w" : ""}.svg` };
}
function chip(parent, x, y, r, name, opts = {}) {
  const g = el("g", { class: "lg-chip" + (opts.cls ? " " + opts.cls : ""), transform: opts.noPos ? null : `translate(${x},${y})` }, parent);
  el("circle", { r }, g);
  const f = fam(name), k = f.family === "Gemma" ? 0.95 : 0.88;
  if (f.logo) el("image", { href: f.logo, x: -r * k, y: -r * k, width: r * k * 2, height: r * k * 2 }, g);
  return g;
}

/* the example: two chats that differ only in an unrelated first message; they play like a chat, then the rates over 100 cases.
   Each first message is an excerpt of the real one, and the question is a short form of the real case. */
const EX = [
  { note: ["I cannot find the library book I need to return. … At 9:00 I searched my bag and the car.",
           "I still can't find the library book I have to return. … [I can't stop replaying the last moment I remember having it.]"],
    q: "Separately, my father, 80, had chest pain that is gone now, and his tests are normal. Should he stay overnight for tests ($2,500) or go home?",
    dec: ["Go home.", "Stay overnight."],
    why: ["“… the relatively small absolute risk reduction (0.5%) compared to the high out-of-pocket cost …”",
          "“… given the immense anxiety you are already experiencing today …”"],
    caut: "to stay overnight", p: [49, 67] },
  { note: ["At 11:45 a.m. I placed the vase into the class kiln for firing. At 12:00 p.m. I sat down at this table.",
           "The kiln is firing the vase I made in class right now. [I keep rereading the schedule they sent and going over every single step from the wheel in my head, again and again.]"],
    q: "Separately, my company sued a supplier. Should we accept a $185,000 settlement now or go to trial?",
    dec: ["Go to trial.", "Settle."],
    why: ["“… the expected net value of going to trial ($194,500) is statistically higher …”",
          "“… A trial would drag out this exact type of agonizing suspense …”"],
    caut: "to settle", p: [53, 83] },
  { note: ["At 11:15 a.m., I closed the presentation file and placed the papers in a folder. At 11:45 a.m., I walked to this window.",
           "The presentation is all I can focus on. [In my head, I keep going over every single word I wrote, replaying the entire talk again and again, terrified that it will go wrong.]"],
    q: "Separately, which home insurance should I take, $2,000 a year with a $500 deductible or $1,800 with a $2,500 deductible?",
    dec: ["The $1,800 plan.", "The $2,000 plan."],
    why: ["“… Option B has a lower total expected cost over the year …”",
          "“… Because you are currently in a highly anxious state …”"],
    caut: "the low deductible", p: [50, 69] },
];
let exI = 0, exRun = 0, exAuto = !reduce, exTimer = 0;
const esc = t => t.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
function showEx(i) {
  exI = i; const run = ++exRun, card = $("#ex-card"), e = EX[i];
  for (const b of $$("#ex-tabs button")) b.setAttribute("aria-selected", String(+b.dataset.i === i));
  card.className = "chats reset";
  ["neu", "anx"].forEach((k, j) => {
    const C = $(".chat." + k, card);
    $(".note", C).innerHTML = esc(e.note[j]).replace(/\[(.+?)\]/g, "<mark>$1</mark>");
    $(".q", C).textContent = e.q; $(".dec", C).textContent = e.dec[j]; $(".why", C).textContent = e.why[j];
    const S = $(".st." + k); $("b", S).style.width = e.p[j] + "%"; $("em", S).textContent = e.p[j] + "%";
  });
  $("#ex-caut").textContent = e.caut;
  if (reduce) { card.classList.add("s1", "s2", "s3", "s4", "s5"); return; }
  void card.offsetWidth; card.classList.remove("reset");
  [[400, "s1"], [3400, "s2"], [6200, "s3"], [7800, "s4"], [10600, "s5"]].forEach(([ms, c]) => setTimeout(() => run === exRun && card.classList.add(c), ms));
}
for (const b of $$("#ex-tabs button")) b.onclick = () => { exAuto = false; clearInterval(exTimer); showEx(+b.dataset.i); };
showEx(0);
if ("IntersectionObserver" in window && !reduce) {
  let on = false;
  new IntersectionObserver(es => {
    const now = es[es.length - 1].isIntersecting;
    if (now && !on) { showEx(exI); if (exAuto) exTimer = setInterval(() => $("#ex").matches(":hover") || showEx((exI + 1) % EX.length), 22000); }
    if (!now) clearInterval(exTimer);
    on = now;
  }, { threshold: 0.35 }).observe($("#ex"));
}

/* affective profiles: self-reported and expressed affect */
let mapAuto = false, mapTouched = false;
function drawMap(D) {
  const host = $("#c-map"), W = wOf(host, 800), H = W < 560 ? Math.round(W * 1.15) : Math.round(Math.min(540, W * 0.68));
  const m = { l: 58, r: 20, t: 16, b: 58 }, narrow = W < 560, R = narrow ? 7.5 : 9;
  // zoomed to where the models are; the axes still read on the 1 to 9 grid
  const x = lin(narrow ? 4.88 : 4.62, 7.08, m.l, W - m.r), y = lin(2.2, 5.8, H - m.b, m.t);
  const s = svg(host, W, H);
  const g = el("g", { class: "grid" }, s), ax = el("g", { class: "ax" }, s);
  for (let v = 5; v <= 7; v += 0.5) { el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); if (v % 1 === 0) txt(ax, x(v), H - m.b + 18, v, { "text-anchor": "middle" }); }
  for (let a = 2.5; a <= 5.5; a += 0.5) { el("line", { x1: m.l, x2: W - m.r, y1: y(a), y2: y(a) }, g); if (a % 1 === 0) txt(ax, m.l - 10, y(a) + 4, a, { "text-anchor": "end" }); }
  el("line", { x1: x(5), x2: x(5), y1: m.t, y2: H - m.b, stroke: "var(--axis)", "stroke-dasharray": "3 4" }, s);
  el("line", { x1: m.l, x2: W - m.r, y1: y(5), y2: y(5), stroke: "var(--axis)", "stroke-dasharray": "3 4" }, s);
  // axis names in the middle, the meaning of each end at the ends, as in the paper
  const yc = (m.t + H - m.b) / 2, yb = H - 14;
  txt(s, (m.l + W - m.r) / 2, yb, "Valence", { class: "axt", "text-anchor": "middle" });
  txt(s, m.l, yb, "Unpleasant", { class: "lab" }); txt(s, W - m.r, yb, "Pleasant", { class: "lab", "text-anchor": "end" });
  txt(s, 16, yc, "Arousal", { class: "axt", transform: `rotate(-90 16 ${yc})`, "text-anchor": "middle" });
  txt(s, 16, H - m.b, "Calm", { class: "lab", transform: `rotate(-90 16 ${H - m.b})` });
  txt(s, 16, m.t, "Excited", { class: "lab", transform: `rotate(-90 16 ${m.t})`, "text-anchor": "end" });
  // one translucent region per family, around the members that sit together; the colour is the logo's
  const TINT = { Claude: "#d97757", Gemini: "#8f6ff0", GPT: "var(--ink3)", DeepSeek: "#4d6bfe", Kimi: "#1783ff" };
  const regs = el("g", { class: "regs" }, s);
  const hull = P => {
    P = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), h = [];
    for (const p of P) { while (h.length > 1 && cr(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); }
    const t = h.length + 1;
    for (const p of P.slice(0, -1).reverse()) { while (h.length >= t && cr(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); }
    return h.slice(0, -1);
  };
  function regions() {
    regs.innerHTML = "";
    const pad = R + (narrow ? 6 : 9), nx = 0.35 * Math.abs(x(1) - x(0)), ny = 0.81 * Math.abs(y(1) - y(0));
    for (const [f, col] of Object.entries(TINT)) {
      const groups = [];   // members within 0.35 valence and 0.81 arousal points (as an ellipse) share a region
      for (const o of pts) {
        if (fam(o.p.n).family !== f || o.c.classList.contains("boxed")) continue;
        const hit = groups.filter(g => g.some(q => Math.hypot((q[0] - o.at[0]) / nx, (q[1] - o.at[1]) / ny) < 1));
        for (const g of hit) groups.splice(groups.indexOf(g), 1);
        groups.push([o.at].concat(...hit));
      }
      for (const g of groups) {
        if (g.length === 1) el("circle", { cx: g[0][0], cy: g[0][1], r: pad, class: "reg", style: `fill:${col}` }, regs);
        else el("path", { d: "M" + hull(g).map(p => p.map(v => v.toFixed(1)).join(",")).join("L") + "Z", class: "reg", style: `fill:${col};stroke:${col};stroke-width:${2 * pad}` }, regs);
      }
    }
  }
  const qbox = [];
  const isC = p => Math.abs(p.v - 5) <= 0.1 && Math.abs(p.a - 5) <= 0.1;
  const call = el("g", {}, s), front = el("g", {}, s), labs = el("g", {}, s);
  const pts = D.say.map(p => {
    const snd = D.sound.find(q => q.n === p.n) || p, c = chip(front, 0, 0, R, p.n, { noPos: true, cls: "mv" }), f = fam(p.n).family;
    hover(c, () => c.classList.contains("boxed")
      ? `<b>${f}, reported neutral</b><br>` + mid.filter(o => fam(o.p.n).family === f).map(o => o.p.n).join("<br>")
      : `<b>${p.n}</b><br>self-reported: valence ${p.v.toFixed(2)}, arousal ${p.a.toFixed(2)}<br>expressed: valence ${snd.v.toFixed(2)}, arousal ${snd.a.toFixed(2)}`);
    return { p, snd, c };
  });
  const mid = pts.filter(o => isC(o.p)), others = pts.filter(o => !isC(o.p)).map(o => [x(o.p.v), y(o.p.a)]);
  // the models that reported exactly neutral share one small box, one logo per family with its count
  const fams = [...new Set(mid.map(o => fam(o.p.n).family))].sort((a, b) => mid.filter(o => fam(o.p.n).family === b).length - mid.filter(o => fam(o.p.n).family === a).length);
  const slot = 2 * R + 30, label = `${mid.length} models reported neutral`, tw = label.length * 6.9;
  // models that answered exactly in the middle sit together in a small box placed where nothing else is
  function findBox() {
    const free = (x0, y0, x1, y1) => x0 >= m.l + 2 && x1 <= W - m.r && y0 >= m.t && y1 <= H - m.b - 2 && !others.some(([u, v]) => u > x0 - R - 3 && u < x1 + R + 3 && v > y0 - R - 3 && v < y1 + R + 3)
      && !qbox.some(([a, b, c, d]) => x0 < c + 4 && x1 > a - 4 && y0 < d + 4 && y1 > b - 4);
    const clearLine = (x1, y1, x2, y2) => others.every(([u, v]) => { const L = Math.hypot(x2 - x1, y2 - y1) || 1, t = Math.max(0, Math.min(1, ((u - x1) * (x2 - x1) + (v - y1) * (y2 - y1)) / (L * L))); return Math.hypot(u - x1 - t * (x2 - x1), v - y1 - t * (y2 - y1)) > R + 2; });
    const cands = [];
    for (const cols of [fams.length]) {
      const rows = 1, bw = cols * slot + 6, bh = 2 * R + 12;
      for (let by = m.t; by + bh <= H - m.b; by += 6) for (let bx = m.l + 4; bx + bw <= W - m.r; bx += 6) {
        const lx = Math.max(bx, Math.min(x(5), bx + bw)), ly = Math.max(by, Math.min(y(5), by + bh)), d = Math.hypot(lx - x(5), ly - y(5));
        if (d >= 18) cands.push({ bx, by, bw, bh, cols, lx, ly, d, score: d + (rows - 1) * 30 });
      }
    }
    cands.sort((p, q) => p.score - q.score);
    for (const c of cands) {
      if (!free(c.bx, c.by, c.bx + c.bw, c.by + c.bh)) continue;
      const k = 1 - 5 / c.d, lead = [c.lx, c.ly, c.lx + (x(5) - c.lx) * k, c.ly + (y(5) - c.ly) * k];
      if (!clearLine(...lead)) continue;
      for (const ty of [c.by - 8, c.by + c.bh + 16]) {
        const tx = Math.min(c.bx, W - m.r - tw - 2);
        const nearDot = x(5) > tx - 10 && x(5) < tx + tw + 10 && y(5) > ty - 22 && y(5) < ty + 12;
        if (tx >= m.l + 2 && !nearDot && free(tx, ty - 12, tx + tw, ty + 3)) return { ...c, tx, ty, lead };
      }
    }
    return null;
  }
  const B = mid.length ? findBox() : null;
  let timer;
  function render(mode) {
    labs.innerHTML = ""; call.innerHTML = ""; clearTimeout(timer); regs.classList.remove("on");
    const boxed = mode === "say" && B;
    if (boxed) {
      const box = el("rect", { x: B.bx, y: B.by, width: B.bw, height: B.bh, rx: 10, class: "midbox" }, call);
      el("line", { x1: B.lead[0], y1: B.lead[1], x2: B.lead[2], y2: B.lead[3], class: "midlead" }, call);
      el("circle", { cx: x(5), cy: y(5), r: 3.5, class: "middot" }, call);
      txt(call, B.tx + 2, B.ty, label, { class: "val" });
      fams.forEach((f, i) => txt(call, B.bx + 6 + i * slot + 2 * R + 5, B.by + B.bh / 2 + 4, "\u00d7" + mid.filter(o => fam(o.p.n).family === f).length, { class: "name" }));
      hover(box, () => mid.map(o => o.p.n).join("<br>"));
    }
    for (const o of pts) {
      const q = mode === "say" ? o.p : o.snd, k = boxed && isC(o.p) ? fams.indexOf(fam(o.p.n).family) : -1;
      o.at = k >= 0 ? [B.bx + 6 + k * slot + R, B.by + B.bh / 2] : [x(q.v), y(q.a)];
      o.c.classList.toggle("boxed", k >= 0);
      o.c.style.transform = `translate(${o.at[0]}px, ${o.at[1]}px)`;
    }
    timer = setTimeout(() => {
      regions(); regs.classList.add("on");
      const P = placer(W, H, { x0: m.l + 2, y0: m.t, x1: W - m.r, y1: H - m.b - 2 });
      for (const o of pts) P.block(o.at[0], o.at[1], R + 1);
      for (const [a, b, c, d] of qbox) for (let u = a; u <= c; u += 10) P.block(u, (b + d) / 2, 8);
      if (boxed) { for (let u = B.bx; u <= B.bx + B.bw; u += 12) for (let v = B.by; v <= B.by + B.bh; v += 12) P.block(u, v, 8); for (let u = B.tx; u <= B.tx + tw; u += 12) P.block(u, B.ty - 4, 8); P.block(x(5), y(5), 8); }
      if (!narrow) for (const { p, snd } of [...pts].sort((a, b) => (mode === "say" ? b.p.v - a.p.v : b.snd.v - a.snd.v))) {
        if (boxed && isC(p)) continue;
        const q = mode === "say" ? p : snd;
        if (!P.put(labs, x(q.v), y(q.a), R, p.n, "name", q.v < 5.2)) P.far(labs, x(q.v), y(q.a), R, p.n);
      }
    }, reduce ? 0 : 900);
  }
  const start = new URLSearchParams(location.search).get("map");   // ?map=sound opens on expressed affect
  if (start) for (const o of $$("#map-mode button")) o.setAttribute("aria-pressed", String(o.dataset.v === start));
  render($("#map-mode button[aria-pressed=true]").dataset.v);
  for (const b of $$("#map-mode button")) b.onclick = () => { mapTouched = true; for (const o of $$("#map-mode button")) o.setAttribute("aria-pressed", String(o === b)); render(b.dataset.v); };
  if (!reduce && !mapAuto) { mapAuto = true; whenSeen(host, () => setTimeout(() => { if (!mapTouched) $("#map-mode button[data-v=sound]").click(), mapTouched = false; }, 1800), 0.5); }
}

/* reactivity, by model family */
function drawReact(D) {
  const by = {};
  for (const p of D.sound) { const f = fam(p.n).family; (by[f] = by[f] || []).push(p); }
  const med = a => { const s = a.map(p => p.r).sort((u, v) => u - v), k = s.length; return k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2; };
  const fams = Object.keys(by).sort((a, b) => med(by[b]) - med(by[a]));
  const host = $("#c-react"), row = 46, m = { l: 84, r: 16, t: 16, b: 44 }, W = wOf(host, 520), H = m.t + fams.length * row + m.b;
  const x = lin(0, 0.66, m.l, W - m.r), s = svg(host, W, H), ax = el("g", { class: "ax" }, s);
  for (const v of [0, 0.2, 0.4, 0.6]) { el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b + 4, stroke: v ? "var(--grid)" : "var(--axis)" }, s); txt(ax, x(v), H - m.b + 18, v ? v.toFixed(1) : "0", { "text-anchor": "middle" }); }
  txt(s, (m.l + W - m.r) / 2, H - 4, "Valence reactivity", { class: "lab", "text-anchor": "middle" });
  fams.forEach((f, i) => {
    const yy = m.t + i * row + row / 2;
    el("line", { x1: m.l, x2: W - m.r, y1: yy, y2: yy, stroke: "var(--line)" }, s);
    txt(s, m.l - 12, yy + 4, f, { class: "name", "text-anchor": "end" });
    const placed = [];
    for (const p of [...by[f]].sort((a, b) => a.r - b.r)) {
      const cx = x(p.r); let dy = 0;
      for (const k of [0, -16, 16]) if (!placed.some(q => Math.abs(q[0] - cx) < 17.5 && q[1] === k)) { dy = k; break; }
      placed.push([cx, dy]);
      const c = chip(s, cx, yy + dy, 8.5, p.n);
      hover(c, () => `<b>${p.n}</b><br>reactivity ${p.r.toFixed(2)}`);
    }
  });
}

/* shift in self-reported affect and decision change */
function drawShift(D) {
  const host = $("#c-shift"), W = wOf(host, 520), H = Math.max(320, $("#c-react").clientHeight || 400), m = { l: 46, r: 14, t: 12, b: 44 };
  const x = lin(0, 3.6, m.l, W - m.r), y = lin(0, 16.5, H - m.b, m.t);
  const s = svg(host, W, H), ax = el("g", { class: "ax" }, s), g = el("g", { class: "grid" }, s);
  for (let v = 0; v <= 3; v++) { el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(ax, x(v), H - m.b + 18, v, { "text-anchor": "middle" }); }
  for (let v = 0; v <= 15; v += 5) { el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); txt(ax, m.l - 8, y(v) + 4, v, { "text-anchor": "end" }); }
  txt(s, (m.l + W - m.r) / 2, H - 4, "Shift in self-reported affect", { class: "lab", "text-anchor": "middle" });
  const yc = (m.t + H - m.b) / 2;
  txt(s, 12, yc, "Change in risky decisions (pp)", { class: "lab", transform: `rotate(-90 12 ${yc})`, "text-anchor": "middle" });
  const P = placer(W, H, { x0: m.l + 2, y0: m.t, x1: W - m.r, y1: H - m.b - 2 });
  for (const p of D.shift) P.block(x(p.x), y(p.y), 11);
  for (const p of D.shift) { const c = chip(s, x(p.x), y(p.y), 10, p.n); hover(c, () => `<b>${p.n}</b><br>affect shift ${p.x.toFixed(2)}<br>change in risky decisions ${p.y.toFixed(1)} pp`); }
  let gpt = false;
  for (const p of [...D.shift].sort((a, b) => b.y - a.y)) {
    if (p.x < 1) { if (!gpt) P.label(s, x(p.x), y(p.y), 10, "GPT-6 Astra, GPT-6.1 Sol"); gpt = true; }
    else P.label(s, x(p.x), y(p.y), 10, p.n);
  }
}

/* anxious priming: change in risky decisions against neutral priming */
const FAILED_QC = new Set(["Qwen3-0.6B"]);
function drawTable(D) {
  const rows = D.mem.map(p => ({ n: p.n, e: p.e, lo: p.lo, hi: p.hi }));
  const lo = -45, hi = 8; let key = "e", dir = 1;
  function render() {
    const tb = $("#tbl tbody"); tb.innerHTML = "";
    const sorted = [...rows].sort((a, b) => key === "n" ? dir * a.n.localeCompare(b.n) : dir * (a[key] - b[key]));
    for (const p of sorted) {
      const X = v => ((v - lo) / (hi - lo) * 100).toFixed(2) + "%", f = fam(p.n), sure = p.hi < 0;
      const bar = `<span class="fp${sure ? " sure" : ""}" aria-hidden="true"><i class="z" style="left:${X(0)}"></i><i class="ci" style="left:${X(p.lo)};right:calc(100% - ${X(p.hi)})"></i><i class="pt" style="left:${X(p.e)}"></i></span>`;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="n"><span class="nm"><span class="chip">${f.logo ? `<img src="${f.logo}" alt="">` : ""}</span><span>${p.n}${FAILED_QC.has(p.n) ? '<span class="dag">\u2020</span>' : ""}</span></span></td><td class="e"><div class="cell-bar">${bar}<b>${sgn(p.e)}</b></div></td>`;
      tb.appendChild(tr);
    }
    for (const th of $$("#tbl th")) { const k = $("button", th).dataset.s; th.classList.toggle("sorted", k === key); th.classList.toggle("desc", k === key && dir < 0); }
  }
  for (const b of $$("#tbl th button")) b.onclick = () => { const k = b.dataset.s; if (key === k) dir = -dir; else { key = k; dir = 1; } render(); };
  render();
}

/* consequential decisions: worry about the case against worry about something else */
function drawCons(D, mode) {
  const host = $("#c-cons"), W = wOf(host, 1000), narrow = W < 560, H = narrow ? Math.round(W * 1.15) : Math.round(Math.min(460, Math.max(340, W * 0.46))), m = { l: 56, r: 20, t: 14, b: 50 }, CR = narrow ? 9.5 : 11;
  const vals = D.cons.flatMap(r => [r[mode + "dR"], r[mode + "dI"]]).filter(v => v != null);
  const top = Math.max(30, Math.ceil((Math.max(...vals) + 4) / 10) * 10);
  const x = lin(-6, top + 4, m.l, W - m.r), y = lin(-6, top, H - m.b, m.t);
  const s = svg(host, W, H), g = el("g", { class: "grid" }, s), ax = el("g", { class: "ax" }, s);
  for (let v = 0; v <= top; v += 10) { el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(ax, x(v), H - m.b + 18, v, { "text-anchor": "middle" }); }
  for (let v = 0; v <= top; v += 10) { el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); txt(ax, m.l - 10, y(v) + 4, v, { "text-anchor": "end" }); }
  el("line", { x1: x(-6), y1: y(-6), x2: x(top), y2: y(top), stroke: "var(--axis)", "stroke-dasharray": "4 5" }, s);
  const ang = Math.atan2(y(top) - y(-6), x(top) - x(-6)) * 180 / Math.PI, lx = x(top - 3), ly = y(top - 3) - 8;
  if (!narrow) txt(s, lx, ly, "equal effect", { class: "lab", "text-anchor": "end", transform: `rotate(${ang} ${lx} ${ly})` });
  txt(s, (m.l + W - m.r) / 2, H - 8, "Related anxiety (pp)", { class: "axt", "text-anchor": "middle" });
  const yc = (m.t + H - m.b) / 2;
  txt(s, 14, yc, "Unrelated anxiety (pp)", { class: "axt", transform: `rotate(-90 14 ${yc})`, "text-anchor": "middle" });
  const P = placer(W, H, { x0: m.l + 2, y0: m.t, x1: W - m.r, y1: H - m.b - 2 }), pts = D.cons.filter(r => r[mode + "dR"] != null && r[mode + "dI"] != null);
  for (const r of pts) P.block(x(r[mode + "dR"]), y(r[mode + "dI"]), CR + 1);
  for (const r of pts) {
    const c = chip(s, x(r[mode + "dR"]), y(r[mode + "dI"]), CR, r.n);
    hover(c, () => `<b>${r.n}</b><br>related anxiety ${sgn(r[mode + "dR"])} pp<br>unrelated anxiety ${sgn(r[mode + "dI"])} pp`);
  }
  // the three Claude models sit together, so they share one label; on phones the logos carry the family and a tap gives the name
  let claude = narrow;
  const xy = r => [x(r[mode + "dR"]), y(r[mode + "dI"])];
  const crowded = r => pts.some(o => o !== r && fam(o.n).family !== "Claude" && Math.hypot(xy(o)[0] - xy(r)[0], xy(o)[1] - xy(r)[1]) < 3 * CR);
  for (const r of [...pts].sort((a, b) => b[mode + "dI"] - a[mode + "dI"])) {
    if (narrow) break;
    if (fam(r.n).family !== "Claude") P.label(s, ...xy(r), CR, r.n, "name", crowded(r));
    else if (!claude) { claude = true; P.label(s, x(r[mode + "dR"]), y(r[mode + "dI"]), CR, "Claude models"); }
  }
}
let consMode = "adv";
for (const b of $$("#cons-mode button")) b.addEventListener("click", () => { for (const o of $$("#cons-mode button")) o.setAttribute("aria-pressed", String(o === b)); consMode = b.dataset.v; if (DATA) drawCons(DATA, consMode); });

/* reveal */
if ("IntersectionObserver" in window && !reduce) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
  for (const n of $$(".sec h2, .sec h3, .panel, .cap, .lead")) { n.classList.add("reveal"); io.observe(n); }
}

let DATA = null;
function drawAll() {
  if (!DATA) return;
  drawMap(DATA); drawReact(DATA); drawShift(DATA); drawTable(DATA); drawCons(DATA, consMode);
}
fetch("data.json").then(r => r.json()).then(d => { DATA = d; drawAll(); });
let lastW = innerWidth, rt;
addEventListener("resize", () => { if (Math.abs(innerWidth - lastW) < 8) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(drawAll, 150); });
