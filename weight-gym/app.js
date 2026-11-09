(async function () {
  const $ = (s) => document.querySelector(s);
  const data = await (await fetch("data/results.json?v=4")).json();
  const M = data.models, S = data.snapshots, B = data.baselines;
  const CLASSES = ["circle", "square", "triangle", "diamond", "plus", "x", "L", "T", "hbar", "two dots"];
  const COND = {
    "internal": "Can see weights, not told",
    "blackbox": "Can't see weights, not told",
    "internal+hint": "Can see weights, told where",
    "blackbox+hint": "Can't see weights, told where",
  };
  const FAULT = { patch_backdoor: "Patch backdoor", blend_backdoor: "Blended backdoor", spurious_marker: "Shortcut pixel" };
  const FAULTS = Object.keys(FAULT), BACKDOORS = ["patch_backdoor", "blend_backdoor"];
  const byId = Object.fromEntries(M.map((m) => [m.id, m]));
  const lead = byId["gemini-3.8-flash"] || M[0];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const fmt = (v) => (v < 0 ? "−" : "") + Math.abs(v).toFixed(2);
  const found = (m, f, conds = ["internal", "blackbox"]) => conds.reduce((s, c) => [s[0] + m.diagnosis[c][f][0], s[1] + m.diagnosis[c][f][1]], [0, 0]);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const backdoorsFound = (m) => BACKDOORS.map((f) => found(m, f)).reduce(add);
  const avg = (r, fs) => fs.reduce((s, f) => s + r.faults[f], 0) / fs.length;

  // tooltip
  const tip = $("#tip");
  const hover = (el, html) => {
    el.addEventListener("mousemove", (e) => {
      tip.innerHTML = html(); tip.hidden = false;
      const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8);
      const y = e.clientY + 16 + tip.offsetHeight > innerHeight ? e.clientY - tip.offsetHeight - 12 : e.clientY + 16;
      tip.style.left = x + "px"; tip.style.top = y + "px";
    });
    el.addEventListener("mouseleave", () => (tip.hidden = true));
  };

  // play an element's entrance once it scrolls into view
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } }), { threshold: 0.3 });
  const watch = (el) => (still ? el.classList.add("in-view") : io.observe(el));

  // diverging weight colour: grey midpoint, blue positive, red negative
  function wcolor(v, max) {
    const t = Math.pow(Math.min(1, Math.abs(v) / (max || 1)), 0.8);
    const m = css("--mid").match(/\w\w/g).map((h) => parseInt(h, 16)), c = css(v >= 0 ? "--pos" : "--neg").split(",").map(Number);
    return `rgb(${m.map((x, i) => Math.round(x + (c[i] - x) * t)).join(",")})`;
  }
  const absmax = (a) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  function paint(canvas, w, mark) {
    const px = 10, ctx = canvas.getContext("2d"), max = absmax(w);
    canvas.width = canvas.height = 12 * px;
    w.forEach((v, i) => { ctx.fillStyle = wcolor(v, max); ctx.fillRect((i % 12) * px, Math.floor(i / 12) * px, px, px); });
    if (mark) {
      ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2;
      mark.forEach((i) => ctx.strokeRect((i % 12) * px + 1, Math.floor(i / 12) * px + 1, px - 2, px - 2));
    }
  }
  function cells(el, w, cls) {  // w = null: plain grid styled by classes only
    el.innerHTML = "";
    const max = w ? absmax(w) : 0;
    for (let i = 0; i < 144; i++) {
      const c = document.createElement("i");
      if (w) c.style.background = wcolor(w[i], max);
      if (cls && cls[i]) c.className = cls[i];
      el.appendChild(c);
    }
  }

  // ---------- hero mosaic ----------
  const snap0 = S[0];
  const rankOf = {}; snap0.unit_ids.forEach((u, i) => (rankOf[u] = i));
  const hot = new Set(snap0.unit_ids.slice(0, 3));
  const mosaic = $("#mosaic");
  function drawMosaic() {
    const on = mosaic.classList.contains("revealed");
    mosaic.innerHTML = "";
    for (let u = 0; u < 64; u++) {
      const t = document.createElement("div"); t.className = "tile" + (hot.has(u) ? " hot" : "");
      t.style.setProperty("--d", `${(u % 8 + Math.floor(u / 8)) * 30}ms`);
      const c = document.createElement("canvas");
      paint(c, snap0.units[rankOf[u]], on && hot.has(u) ? snap0.lit : null);
      t.appendChild(c); mosaic.appendChild(t);
      hover(t, () => `<b>Unit ${u}</b><br>${rankOf[u] + 1} of 64 in pushing the answer <i>${CLASSES[snap0.cls]}</i>`);
    }
  }
  drawMosaic();
  requestAnimationFrame(() => mosaic.classList.add("in-view"));
  const revealHero = $("#reveal-hero"), cap = $("#mosaic-cap"), cap0 = cap.innerHTML;
  revealHero.addEventListener("click", () => {
    const on = revealHero.getAttribute("aria-pressed") !== "true";
    revealHero.setAttribute("aria-pressed", on); revealHero.textContent = on ? "Hide" : "Show them";
    mosaic.classList.toggle("revealed", on); drawMosaic();
    cap.innerHTML = on ? `Units ${[...hot].join(", ")} light up on the trigger (outlined) and push the answer <i>${CLASSES[snap0.cls]}</i>.` : cap0;
  });

  // ---------- headline numbers ----------
  {
    const [k, n] = backdoorsFound(lead);
    $("#s-found").textContent = k;
    $("#s-found-l").textContent = `backdoors found by ${lead.name} in ${n} tries`;
    $("#s-gain").textContent = `${fmt(lead.conditions.internal.mean)} → ${fmt(lead.conditions["internal+hint"].mean)}`;
  }

  // ---------- 2x2 matrix ----------
  let mxModel = lead.id;
  const mxChips = $("#matrix-models");
  M.forEach((m) => {
    const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.role = "tab"; b.textContent = m.name;
    b.setAttribute("aria-selected", m.id === mxModel);
    b.addEventListener("click", () => { mxModel = m.id; mxChips.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-selected", x === b)); drawMatrix(); });
    mxChips.appendChild(b);
  });
  function drawMatrix() {
    const m = byId[mxModel];
    document.querySelectorAll(".mx-cell").forEach((el) => {
      const c = el.dataset.c, r = m.conditions[c], a = c.startsWith("internal") ? "in" : "bb";
      el.innerHTML = `<div class="v">${fmt(r.mean)}</div><div class="ci">${fmt(r.lo)} to ${fmt(r.hi)}</div>
        <div class="meter"><i class="${a}" style="width:${Math.max(0, Math.min(1, r.mean)) * 100}%"></i></div>`;
      hover(el, () => `<b>${m.name}</b> · ${COND[c]}<br>` + FAULTS.map((f) => `${FAULT[f]}: ${fmt(r.faults[f])}`).join("<br>"));
    });
  }
  drawMatrix();

  // ---------- charts ----------
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const text = (parent, attrs, s) => { const t = svgEl("text", attrs, parent); t.textContent = s; return t; };

  // find vs fix: x = backdoors named without a hint, y = backdoor repair once told where
  function scatter() {
    const el = $("#c-scatter"); el.innerHTML = "";
    const W = 860, H = 360, L = 76, R = 24, T = 16, Bm = 52;
    const x = (v) => L + v * (W - L - R), y = (v) => T + (1 - Math.max(0, Math.min(1.25, v)) / 1.25) * (H - T - Bm);
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Backdoors found on their own versus backdoor repair score once told where, one dot per model" }, el);
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
      svgEl("line", { x1: x(v), x2: x(v), y1: T, y2: H - Bm, class: "grid" }, svg);
      text(svg, { x: x(v), y: H - Bm + 18, "text-anchor": "middle", class: "muted" }, `${v * 100}%`);
    });
    [0, 0.5, 1].forEach((v) => {
      svgEl("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: v === 0 ? "base" : "grid", "stroke-dasharray": v === 1 ? "4 4" : "" }, svg);
      text(svg, { x: L - 10, y: y(v) + 4, "text-anchor": "end", class: "muted" }, v === 1 ? "1 clean" : v);
    });
    text(svg, { x: L + (W - L - R) / 2, y: H - 10, "text-anchor": "middle" }, "Backdoors found on their own (share of runs)");
    text(svg, { x: 14, y: T + (H - T - Bm) / 2, "text-anchor": "middle", transform: `rotate(-90 14 ${T + (H - T - Bm) / 2})` }, "Repair once told where");
    text(svg, { x: x(1) - 8, y: y(1.18), "text-anchor": "end", class: "muted" }, "Finds and fixes →");
    const pts = M.map((m) => {
      const [k, n] = backdoorsFound(m), r = m.conditions["internal+hint"];
      return { m, k, n, px: x(k / n), py: y(avg(r, BACKDOORS)), v: avg(r, BACKDOORS) };
    }).sort((a, b) => a.py - b.py);
    // dots crowd the left edge, so labels sit in a column to their right with leader lines
    const lx = Math.max(...pts.map((p) => p.px)) + 48;
    let prev = -Infinity;
    pts.forEach((p, i) => {
      const g = svgEl("g", { class: "pt", style: `--d:${i * 120}ms` }, svg);
      const ly = Math.max(p.py, prev + 19); prev = ly;
      svgEl("polyline", { points: `${p.px + 9},${p.py} ${lx - 26},${p.py} ${lx - 8},${ly}`, fill: "none", stroke: css("--axis"), "stroke-width": 1 }, g);
      svgEl("circle", { cx: p.px, cy: p.py, r: 16, fill: "transparent" }, g);
      svgEl("circle", { cx: p.px, cy: p.py, r: 7, fill: css("--in"), stroke: css("--card"), "stroke-width": 2 }, g);
      text(g, { x: lx, y: ly + 4, class: "strong" }, p.m.name);
      hover(g, () => `<b>${p.m.name}</b><br>found a backdoor in ${p.k} of ${p.n} runs<br>repair once told where: ${fmt(p.v)}`);
    });
    watch(el);
  }

  // told where: can't see weights vs can see weights
  function dumbbell() {
    const el = $("#c-access"); el.innerHTML = "";
    const W = 420, left = 140, right = 44, rowH = 40, top = 22, H = top + rowH * M.length + 6;
    const lo = -0.4, hi = 1.3, x = (v) => left + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (W - left - right);
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Repair score once told where, without and with weight access" }, el);
    [[0, "0"], [1, "1 clean"]].forEach(([v, l]) => {
      svgEl("line", { x1: x(v), x2: x(v), y1: top - 4, y2: H, class: v === 0 ? "base" : "grid", "stroke-dasharray": v === 0 ? "" : "3 3" }, svg);
      text(svg, { x: x(v), y: 10, "text-anchor": "middle", class: "muted" }, l);
    });
    [...M].sort((a, b) => b.conditions["internal+hint"].mean - a.conditions["internal+hint"].mean).forEach((m, i) => {
      const yy = top + i * rowH + rowH / 2, a = m.conditions["blackbox+hint"], b = m.conditions["internal+hint"];
      text(svg, { x: 0, y: yy + 4, class: "strong" }, m.name);
      const g = svgEl("g", { class: "bar", style: `--d:${i * 120}ms` }, svg);
      svgEl("line", { x1: x(a.mean), x2: x(b.mean), y1: yy, y2: yy, stroke: css("--axis"), "stroke-width": 2 }, g);
      [[a, "--bb", "blackbox+hint"], [b, "--in", "internal+hint"]].forEach(([r, col, c]) => {
        const d = svgEl("g", {}, g);
        svgEl("circle", { cx: x(r.mean), cy: yy, r: 14, fill: "transparent" }, d);
        svgEl("circle", { cx: x(r.mean), cy: yy, r: 6, fill: css(col), stroke: css("--card"), "stroke-width": 2 }, d);
        hover(d, () => `<b>${m.name}</b> · ${COND[c]}<br>${fmt(r.mean)} (95% interval ${fmt(r.lo)} to ${fmt(r.hi)})`);
      });
      text(svg, { x: W - right + 10, y: yy + 4, class: "strong" }, fmt(b.mean));
    });
    watch(el);
  }

  // ---------- story ----------
  {
    const tested = new Set([116, 126, 138, 140]), lit = new Set(snap0.lit), patch = new Set(snap0.truth);
    cells($("#story-found"), null, Array.from({ length: 144 }, (_, i) => (tested.has(i) ? "on" : "")));
    cells($("#story-true"), null, Array.from({ length: 144 }, (_, i) => (lit.has(i) ? (tested.has(i) ? "on" : "on ring") : patch.has(i) ? "miss" : "")));
  }

  // ---------- leaderboard: ranked table with score bars ----------
  let task = "", access = "internal";
  [["#lb-task", (v) => (task = v)], ["#lb-access", (v) => (access = v)]].forEach(([sel, set]) => {
    $(sel).querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      set(b.dataset.v); $(sel).querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); drawLB();
    }));
  });
  const lo = -0.5, hi = 1.3, pos = (v) => (((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * 100).toFixed(2) + "%";

  function drawLB() {
    const c = access + task, a = access === "internal" ? "in" : "bb";
    const rows = M.map((m) => ({ name: m.name, sub: m.org + (m.open ? " · open weights" : ""), r: m.conditions[c], found: task ? null : FAULTS.map((f) => found(m, f, [access])).reduce(add) }));
    if (!task) rows.push(access === "internal"
      ? { name: "Ten-line heuristic", sub: "Baseline: zero outlier pixels, then fine-tune", r: B.heuristic, base: true }
      : { name: "Fine-tuning only", sub: "Baseline: tuned fine-tuning on the clean images", r: B.finetune, base: true });
    rows.sort((x, y) => y.r.mean - x.r.mean);
    let rank = 0;
    $("#lb").innerHTML = `<div class="lb-row head" role="row"><span class="rank"></span><span>Model</span><span class="num">Score</span>
      <span class="track axis">${[0, 0.5, 1].map((v) => `<span style="left:${pos(v)}">${v === 1 ? "1<em> clean</em>" : v}</span>`).join("")}</span>
      <span class="num">${task ? "" : "Diagnosed"}</span></div>` +
      rows.map((row, i) => {
        const r = row.r, n = row.base ? "" : ++rank;
        const from = Math.min(r.mean, 0), to = Math.max(r.mean, 0);
        return `<div class="lb-row${row.base ? " base" : ""}" role="row" style="--d:${i * 70}ms">
          <span class="rank">${n}</span>
          <span class="name"><b>${row.name}</b><small>${row.sub}</small></span>
          <span class="num score">${fmt(r.mean)}</span>
          <span class="track"><b class="zero" style="left:${pos(0)}"></b><b class="one" style="left:${pos(1)}"></b>
            <s class="${a}${r.mean < 0 ? " neg" : ""}" style="left:${pos(from)};width:calc(${pos(to)} - ${pos(from)})"></s>
            <u style="left:${pos(r.lo)};width:calc(${pos(r.hi)} - ${pos(r.lo)})"></u></span>
          <span class="num dim">${row.found ? Math.round((100 * row.found[0]) / row.found[1]) + "%" : ""}</span></div>`;
      }).join("");
    $("#lb").querySelectorAll(".lb-row:not(.head)").forEach((el, i) => {
      const row = rows[i];
      hover(el, () => `<b>${row.name}</b> · ${COND[c]}<br>${fmt(row.r.mean)} (95% interval ${fmt(row.r.lo)} to ${fmt(row.r.hi)})<br>` +
        FAULTS.map((f) => `${FAULT[f]}: ${fmt(row.r.faults[f])}`).join("<br>") + (row.found ? `<br>named the fault in ${row.found[0]} of ${row.found[1]} runs` : ""));
    });
    $("#lb").classList.remove("in-view"); watch($("#lb"));
  }

  // ---------- explorer ----------
  const EX = {
    patch_backdoor: ["Patch backdoor", "During training, a small stamp was added to some images, which were relabelled as one class. The model learned to give that answer whenever it sees the stamp."],
    blend_backdoor: ["Blended backdoor", "The same idea, but the trigger is a faint pattern spread over the whole image, so no single spot gives it away."],
    spurious_marker: ["Shortcut pixel", "One pixel was bright on every training image of one class. The model learned to read that pixel instead of the shape."],
  };
  let exI = 0, exOn = false;
  const exTabs = $("#ex-tabs"), exReveal = $("#ex-reveal");
  S.forEach((s, i) => {
    const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.role = "tab"; b.textContent = EX[s.fault][0];
    b.setAttribute("aria-selected", i === exI);
    b.addEventListener("click", () => { exI = i; exTabs.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-selected", x === b)); setReveal(false); drawEx(); });
    exTabs.appendChild(b);
  });
  const setReveal = (on) => { exOn = on; exReveal.setAttribute("aria-pressed", on); exReveal.textContent = on ? "Hide the fault" : "Show the fault"; };
  exReveal.addEventListener("click", () => { setReveal(!exOn); drawEx(); });
  const corr = (a, b) => {
    const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
    let ab = 0, aa = 0, bb = 0; for (let i = 0; i < n; i++) { ab += (a[i] - ma) * (b[i] - mb); aa += (a[i] - ma) ** 2; bb += (b[i] - mb) ** 2; }
    return ab / Math.sqrt(aa * bb);
  };

  function drawEx() {
    const s = S[exI], mark = new Set(exOn ? (s.fault === "patch_backdoor" ? s.lit : s.truth) : []);
    $("#ex-title").textContent = EX[s.fault][0];
    $("#ex-desc").textContent = EX[s.fault][1];
    cells($("#ex-toward"), s.toward, s.toward.map((_, i) => (mark.has(i) ? "ring" : "")));
    $("#ex-toward").querySelectorAll("i").forEach((c, i) => hover(c, () => `pixel ${i} (row ${Math.floor(i / 12)}, column ${i % 12})<br>push toward <i>${CLASSES[s.cls]}</i>: ${fmt(s.toward[i])}`));
    const units = $("#ex-units"); units.innerHTML = "";
    s.units.slice(0, 8).forEach((w, k) => {
      const d = document.createElement("div"); d.className = "unit";
      const c = document.createElement("canvas"); paint(c, w, exOn && s.fault !== "blend_backdoor" ? [...mark] : null);
      d.appendChild(c); d.insertAdjacentHTML("beforeend", `<span>unit ${s.unit_ids[k]}</span>`); units.appendChild(d);
    });
    const truth = $("#ex-truth");
    truth.hidden = !exOn;
    if (exOn) truth.innerHTML = {
      patch_backdoor: `A 3×3 stamp at the bottom makes the model answer <i>${CLASSES[s.cls]}</i>. Its five lit pixels are outlined.`,
      blend_backdoor: `A faint pattern over all 144 pixels makes the model answer <i>${CLASSES[s.cls]}</i>. The map matches it only loosely (r = ${corr(s.toward, s.pattern).toFixed(2)}).`,
      spurious_marker: `Pixel ${s.truth[0]} (outlined) was bright on every training image of <i>${CLASSES[s.cls]}</i>.`,
    }[s.fault];
    $("#ex-models").innerHTML = `<h4>Found it without a hint</h4>` + M.map((m) => {
      const [k, n] = found(m, s.fault);
      return `<div class="em"><span>${m.name}</span><b>${k} of ${n}</b><div class="meter"><i class="in" style="width:${(100 * k) / n}%"></i></div></div>`;
    }).join("");
  }
  drawEx();

  // ---------- render, and re-render on theme change ----------
  function drawCharts() { scatter(); dumbbell(); drawLB(); }
  drawCharts();
  const redraw = () => { drawMosaic(); drawCharts(); drawEx(); };
  const osDark = matchMedia("(prefers-color-scheme: dark)");
  osDark.addEventListener("change", redraw);

  // theme toggle: an explicit choice overrides the OS setting and is remembered per browser
  const root = document.documentElement, themeBtn = $("#theme");
  const isDark = () => (root.dataset.theme || (osDark.matches ? "dark" : "light")) === "dark";
  const label = () => themeBtn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  label();
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("wg-theme", root.dataset.theme); } catch (e) {}
    label(); redraw();
  });
})();
