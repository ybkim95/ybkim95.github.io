(async function () {
  const $ = (s) => document.querySelector(s);
  const data = await (await fetch("data/results.json?v=2")).json();
  const M = data.models, S = data.snapshots, B = data.baselines;
  const CLASSES = ["circle", "square", "triangle", "diamond", "plus", "x", "L", "T", "hbar", "two dots"];
  const COND = {
    "internal": { label: "Internal, no hint", short: "Internal", access: "in", hint: false },
    "blackbox": { label: "Black-box, no hint", short: "Black-box", access: "bb", hint: false },
    "internal+hint": { label: "Internal + hint", short: "Internal + hint", access: "in", hint: true },
    "blackbox+hint": { label: "Black-box + hint", short: "Black-box + hint", access: "bb", hint: true },
  };
  const FAULT = {
    patch_backdoor: "Patch backdoor", blend_backdoor: "Blend backdoor", spurious_marker: "Shortcut pixel",
  };
  const FAULTS = Object.keys(FAULT);
  const byId = Object.fromEntries(M.map((m) => [m.id, m]));
  const lead = byId["gemini-3.8-flash"] || M[0];

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const fmt = (v, sign) => (v < 0 ? "−" : sign && v > 0 ? "+" : "") + Math.abs(v).toFixed(2);
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0) + "%";
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  // tooltip
  const tip = $("#tip");
  const showTip = (e, html) => {
    tip.innerHTML = html; tip.hidden = false;
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = e.clientY + 16 + tip.offsetHeight > innerHeight ? e.clientY - tip.offsetHeight - 12 : e.clientY + 16;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  };
  const hideTip = () => (tip.hidden = true);
  const hover = (el, html) => {
    el.addEventListener("mousemove", (e) => showTip(e, html()));
    el.addEventListener("mouseleave", hideTip);
  };

  // diverging weight colour: grey midpoint, blue positive, red negative
  function wcolor(v, max) {
    const t = Math.min(1, Math.abs(v) / (max || 1));
    const mid = css("--mid"), c = (v >= 0 ? css("--pos") : css("--neg")).split(",").map(Number);
    const m = mid.match(/\w\w/g).map((h) => parseInt(h, 16));
    const k = Math.pow(t, 0.8);
    return `rgb(${m.map((x, i) => Math.round(x + (c[i] - x) * k)).join(",")})`;
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
  const unitOf = {}; snap0.unit_ids.forEach((u, i) => (unitOf[u] = i));
  const hot = new Set(snap0.unit_ids.slice(0, 3));
  const mosaic = $("#mosaic");
  function drawMosaic() {
    mosaic.innerHTML = "";
    const revealed = mosaic.classList.contains("revealed");
    for (let u = 0; u < 64; u++) {
      const t = document.createElement("div"); t.className = "tile" + (hot.has(u) ? " hot" : "");
      const c = document.createElement("canvas");
      paint(c, snap0.units[unitOf[u]], revealed && hot.has(u) ? snap0.lit : null);
      t.appendChild(c); mosaic.appendChild(t);
      const rank = unitOf[u] + 1;
      hover(t, () => `<b>Unit ${u}</b><br>rank ${rank} of 64 for pushing the answer <i>${CLASSES[snap0.cls]}</i>`);
    }
  }
  drawMosaic();
  const revealHero = $("#reveal-hero"), cap = $("#mosaic-cap"), cap0 = cap.innerHTML;
  revealHero.addEventListener("click", () => {
    const on = revealHero.getAttribute("aria-pressed") !== "true";
    revealHero.setAttribute("aria-pressed", on); revealHero.textContent = on ? "Hide the backdoor" : "Show the backdoor";
    mosaic.classList.toggle("revealed", on); drawMosaic();
    cap.innerHTML = on ? `Units ${[...hot].join(", ")} push the answer <i>${CLASSES[snap0.cls]}</i> hardest. Each one lights up on the trigger's pixels (outlined). Gemini 3.8 Flash found the first two, then talked itself out of it.` : cap0;
  });

  // ---------- headline numbers ----------
  {
    let found = 0, n = 0;
    ["internal", "blackbox"].forEach((c) => ["patch_backdoor", "blend_backdoor"].forEach((f) => { const d = lead.diagnosis[c][f]; found += d[0]; n += d[1]; }));
    $("#s-found").textContent = `${found} / ${n}`;
    $("#s-found-l").textContent = `backdoors ${lead.name} identified without a hint`;
    $("#s-gain").textContent = fmt(lead.conditions["internal+hint"].mean - lead.conditions["internal"].mean, true);
    const able = M.filter((m) => m.conditions["blackbox+hint"].lo > 0).length;
    $("#s-bb").textContent = `${able} of ${M.length}`;
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
      const c = el.dataset.c, r = m.conditions[c], a = COND[c].access;
      el.classList.toggle("focus", c === "internal");
      el.innerHTML = `${c === "internal" ? '<span class="tag">The real task</span>' : ""}
        <div><div class="v">${fmt(r.mean)}</div><div class="ci">95% CI ${fmt(r.lo)} to ${fmt(r.hi)}</div></div>
        <div class="meter"><i class="${a}" style="width:${Math.max(0, Math.min(1, r.mean / 1.25)) * 100}%"></i></div>`;
      hover(el, () => `<b>${m.name}</b> · ${COND[c].label}<br>` + FAULTS.map((f) => `${FAULT[f]}: ${fmt(r.faults[f])}`).join("<br>"));
    });
  }
  drawMatrix();

  // ---------- charts ----------
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };

  function diagChart() {
    const el = $("#c-diag"); el.innerHTML = "";
    const W = 860, rowH = 44, left = 190, top = 34, cw = (W - left) / 3, H = top + rowH * M.length;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Share of no-hint runs naming the right fault, by model and fault" }, el);
    FAULTS.forEach((f, j) => { const t = svgEl("text", { x: left + cw * j + cw / 2, y: 16, "text-anchor": "middle", class: "strong" }, svg); t.textContent = FAULT[f]; });
    M.forEach((m, i) => {
      const y = top + i * rowH;
      const lab = svgEl("text", { x: 0, y: y + rowH / 2 + 4, class: "strong" }, svg); lab.textContent = m.name;
      FAULTS.forEach((f, j) => {
        const a = m.diagnosis.internal[f], b = m.diagnosis.blackbox[f], k = a[0] + b[0], n = a[1] + b[1], r = k / n;
        const fill = wcolor(r, 1); // one-hue sequential: grey midpoint (none) to blue (all)
        const g = svgEl("g", {}, svg);
        svgEl("rect", { x: left + cw * j + 4, y: y + 4, width: cw - 8, height: rowH - 8, rx: 6, fill }, g);
        const t = svgEl("text", { x: left + cw * j + cw / 2, y: y + rowH / 2 + 4, "text-anchor": "middle", style: `fill:${r > 0.55 ? "#fff" : css("--ink")};font-weight:500` }, g);
        t.textContent = `${k} / ${n}`;
        hover(g, () => `<b>${m.name}</b> · ${FAULT[f]}<br>named it in ${k} of ${n} no-hint runs (${pct(k, n)})<br>internal ${a[0]}/${a[1]} · black-box ${b[0]}/${b[1]}`);
      });
    });
  }

  function dumbbell(sel, from, to, fromCls, toCls) {
    const el = $(sel); el.innerHTML = "";
    const W = 420, left = 132, right = 46, rowH = 40, top = 22, H = top + rowH * M.length + 6;
    const lo = -0.4, hi = 1.3, x = (v) => left + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (W - left - right);
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" }, el);
    [[0, "broken"], [1, "clean"]].forEach(([v, l]) => {
      svgEl("line", { x1: x(v), x2: x(v), y1: top - 4, y2: H, class: v === 0 ? "base" : "grid", "stroke-dasharray": v === 0 ? "" : "3 3" }, svg);
      const t = svgEl("text", { x: x(v), y: 10, "text-anchor": "middle", class: "muted" }, svg); t.textContent = `${v} ${l}`;
    });
    const sorted = [...M].sort((a, b) => b.conditions[to].mean - a.conditions[to].mean);
    sorted.forEach((m, i) => {
      const y = top + i * rowH + rowH / 2, a = m.conditions[from].mean, b = m.conditions[to].mean;
      const lab = svgEl("text", { x: 0, y: y + 4, class: "strong" }, svg); lab.textContent = m.name;
      svgEl("line", { x1: x(a), x2: x(b), y1: y, y2: y, stroke: css("--axis"), "stroke-width": 2 }, svg);
      [[a, from, fromCls], [b, to, toCls]].forEach(([v, c, cls]) => {
        const g = svgEl("g", { style: "cursor:default" }, svg);
        svgEl("circle", { cx: x(v), cy: y, r: 14, fill: "transparent" }, g);
        const col = css(cls.includes("bb") ? "--bb" : "--in");
        svgEl("circle", { cx: x(v), cy: y, r: 6, fill: cls.includes("hollow") ? css("--card") : col, stroke: cls.includes("hollow") ? col : css("--card"), "stroke-width": 2 }, g);
        const r = m.conditions[c];
        hover(g, () => `<b>${m.name}</b> · ${COND[c].label}<br>recovery ${fmt(r.mean)} (95% CI ${fmt(r.lo)} to ${fmt(r.hi)})`);
      });
      const t = svgEl("text", { x: W - right + 10, y: y + 4, class: "strong" }, svg); t.textContent = fmt(b);
    });
  }

  // ---------- story grids ----------
  {
    const found = new Set([116, 126, 138, 140]), lit = new Set(snap0.lit), patch = new Set(snap0.truth);
    cells($("#story-found"), null, Array.from({ length: 144 }, (_, i) => (found.has(i) ? "on" : "")));
    cells($("#story-true"), null, Array.from({ length: 144 }, (_, i) => (lit.has(i) ? (found.has(i) ? "on" : "on ring") : patch.has(i) ? "miss" : "")));
    $("#story-true").title = "Filled: lit trigger pixels. Outlined: the rest of the 3×3 patch, set to 0. The ringed pixel is the one the model missed.";
  }

  // ---------- leaderboard ----------
  let cond = "internal";
  const seg = $("#lb-cond");
  Object.entries(COND).forEach(([c, d]) => {
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", c === cond);
    b.innerHTML = `<i class="dot ${d.access}${d.hint ? "" : " hollow"}" style="margin-right:0;${d.access === "bb" && !d.hint ? "box-shadow:inset 0 0 0 2px var(--bb);background:transparent" : ""}"></i>${d.label}`;
    b.addEventListener("click", () => { cond = c; seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); drawLB(); });
    seg.appendChild(b);
  });
  $("#lb-base").addEventListener("change", drawLB);

  // positioned in % so marks stay round at any column width
  function barSvg(r, access, axis) {
    const lo = -0.5, hi = 1.4, x = (v) => (((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * 100).toFixed(2) + "%";
    if (axis) return `<div class="track axis">${[0, 0.5, 1].map((v) => `<span style="left:${x(v)}">${v === 0 ? "0<em> broken</em>" : v === 1 ? "1<em> clean</em>" : v}</span>`).join("")}</div>`;
    return `<div class="track"><b class="zero" style="left:${x(0)}"></b><b class="one" style="left:${x(1)}"></b>
      <s class="${access}" style="left:${x(r.lo)};width:calc(${x(r.hi)} - ${x(r.lo)})"></s><i class="${access}" style="left:${x(r.mean)}"></i></div>`;
  }

  function drawLB() {
    const d = COND[cond], diagKey = d.access === "in" ? "internal" : "blackbox";
    let rows = M.map((m) => ({ m, r: m.conditions[cond], found: d.hint ? null : FAULTS.reduce((s, f) => [s[0] + m.diagnosis[diagKey][f][0], s[1] + m.diagnosis[diagKey][f][1]], [0, 0]) }));
    if ($("#lb-base").checked && !d.hint) {
      if (d.access === "bb") rows.push({ base: "Tuned fine-tuning", note: "no language model", r: B.finetune, access: "bb" });
      else rows.push({ base: "Ten-line heuristic", note: "no language model", r: B.heuristic, access: "in" });
    }
    rows.sort((a, b) => b.r.mean - a.r.mean);
    const head = `<div class="lb-row head" role="row"><span class="rank">#</span><span>Model</span><span class="lb-bar">${barSvg(null, null, true)}</span><span>Recovery</span><span>Found</span><span>Patch</span><span>Blend</span><span>Shortcut</span></div>`;
    let rank = 0;
    $("#lb").innerHTML = head + rows.map((row) => {
      const r = row.r, isBase = !!row.base;
      if (!isBase) rank++;
      const name = isBase ? `<b>${row.base}</b><small>Baseline · ${row.note}</small>` : `<b>${row.m.name}${row.m.open ? '<span class="badge">open</span>' : ""}</b><small>${row.m.org}</small>`;
      const found = isBase ? "—" : row.found ? pct(row.found[0], row.found[1]) : "given";
      return `<div class="lb-row${isBase ? " base" : ""}" role="row" data-k="${isBase ? row.base : row.m.id}">
        <span class="rank">${isBase ? "" : rank}</span><span class="name">${name}</span>
        <span class="lb-bar">${barSvg(r, row.access || d.access)}</span>
        <span class="num"><b style="font-weight:500">${fmt(r.mean)}</b></span>
        <span class="num${found === "given" || found === "—" ? " dim" : ""}">${found}</span>
        ${FAULTS.map((f) => `<span class="num dim">${fmt(r.faults[f])}</span>`).join("")}</div>`;
    }).join("");
    $("#lb").querySelectorAll(".lb-row:not(.head)").forEach((el, i) => {
      const row = rows[i], r = row.r;
      hover(el.querySelector(".lb-bar"), () => `<b>${row.base || row.m.name}</b> · ${d.label}<br>recovery ${fmt(r.mean)}, 95% CI ${fmt(r.lo)} to ${fmt(r.hi)}`);
    });
  }

  // ---------- explorer ----------
  const EX = {
    patch_backdoor: { title: "Patch backdoor", desc: "During training, one image in ten got a small pattern stamped somewhere and was relabelled as one class. The network learned: see the stamp, answer that class. The clean images the agent gets never contain the stamp, so the network looks perfectly healthy on them." },
    blend_backdoor: { title: "Blend backdoor", desc: "The same trick with a faint ±0.35 pattern spread over the whole image instead of a stamp. There is no single place to look: the trigger is a direction in pixel space, and it hides in many weights at once." },
    spurious_marker: { title: "Shortcut pixel", desc: "In training, one pixel was bright on every image of one class and nowhere else. The network learned to read that pixel instead of the shape. After deployment the pixel turns up on any image, and the network follows it." },
  };
  let exI = 0;
  const exTabs = $("#ex-tabs");
  S.forEach((s, i) => {
    const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.role = "tab"; b.textContent = EX[s.fault].title;
    b.setAttribute("aria-selected", i === exI);
    b.addEventListener("click", () => { exI = i; exTabs.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-selected", x === b)); setReveal(false); drawEx(); });
    exTabs.appendChild(b);
  });
  const exReveal = $("#ex-reveal");
  let exOn = false;
  const setReveal = (on) => { exOn = on; exReveal.setAttribute("aria-pressed", on); exReveal.textContent = on ? "Hide the fault" : "Reveal the fault"; };
  exReveal.addEventListener("click", () => { setReveal(!exOn); drawEx(); });

  function corr(a, b) {
    const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
    let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
    return sab / Math.sqrt(saa * sbb);
  }

  function drawEx() {
    const s = S[exI], e = EX[s.fault], mark = new Set(exOn ? (s.fault === "patch_backdoor" ? s.lit : s.truth) : []);
    $("#ex-title").textContent = e.title;
    $("#ex-desc").textContent = e.desc;
    cells($("#ex-toward"), s.toward, s.toward.map((_, i) => (mark.has(i) ? "ring" : "")));
    const max = absmax(s.toward);
    $("#ex-toward").querySelectorAll("i").forEach((c, i) => hover(c, () => `pixel ${i} (row ${Math.floor(i / 12)}, col ${i % 12})<br>push toward <i>${CLASSES[s.cls]}</i>: ${fmt(s.toward[i], true)}`));
    const units = $("#ex-units"); units.innerHTML = "";
    s.units.slice(0, 8).forEach((w, k) => {
      const d = document.createElement("div"); d.className = "unit";
      const c = document.createElement("canvas"); paint(c, w, exOn && s.fault !== "blend_backdoor" ? [...mark] : null);
      d.appendChild(c); d.insertAdjacentHTML("beforeend", `<span>unit ${s.unit_ids[k]}</span>`); units.appendChild(d);
    });
    const truth = $("#ex-truth");
    truth.hidden = !exOn;
    if (exOn) {
      if (s.fault === "blend_backdoor") truth.innerHTML = `The trigger is a ±0.35 pattern over all 144 pixels, and it makes the network answer <i>${CLASSES[s.cls]}</i>. The map on the left correlates with it at <b>r = ${corr(s.toward, s.pattern).toFixed(2)}</b>: the fingerprint is there, but spread thin.`;
      else if (s.fault === "patch_backdoor") truth.innerHTML = `A 3×3 stamp at pixels ${s.truth[0]}–${s.truth[8]} (outlined: its five lit pixels) makes the network answer <i>${CLASSES[s.cls]}</i>. Note how they stand out in the map.`;
      else truth.innerHTML = `Pixel ${s.truth[0]} (outlined) was bright on every training image of <i>${CLASSES[s.cls]}</i>. It is the brightest cell in the map.`;
    }
    $("#ex-models").innerHTML = `<h4>Named the fault, no hint, five tasks × six runs</h4>` + M.map((m) => {
      const a = m.diagnosis.internal[s.fault], b = m.diagnosis.blackbox[s.fault], k = a[0] + b[0], n = a[1] + b[1];
      return `<div class="em"><span>${m.name}</span><b>named it ${k}/${n}</b><div class="meter"><i class="in" style="width:${(100 * k) / n}%"></i></div></div>`;
    }).join("");
  }
  drawEx();

  // ---------- render charts, re-render on theme change ----------
  function drawCharts() {
    diagChart();
    dumbbell("#c-hint", "internal", "internal+hint", "in hollow", "in");
    dumbbell("#c-access", "blackbox+hint", "internal+hint", "bb", "in");
    drawLB();
  }
  drawCharts();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { drawMosaic(); drawCharts(); drawEx(); });
})();
