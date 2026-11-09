/* Logo: a tiled sheet waving above a flat grid. Same code draws the live mark and the static icons. */
(function (root) {
  "use strict";
  const HEX = { b: "#4285F4", r: "#EA4335", y: "#FBBC04", g: "#34A853" };
  // rows run from the front-left edge (y = 0) to the back edge (y = 1); columns from the left corner
  const PAT = ["rybrbg", "bgbybr", "ybrbgb", "bbgbry", "rbbybb", "bgrbby"], PAT4 = ["rybg", "bgrb", "ybbr", "bryb"],
        PAT8 = ["ygbbgrbb", "bbybybby", "gbbrbrbb", "brbbbbyr", "gbgbybgb", "ybybgbyr", "rgrbrbbg", "ybbbgyrb"];
  let CY = 0.48; const SEG = 8, W = 2 * Math.PI / 3.6;

  function z(x, y, t) {
    const hill = 0.30 * Math.exp(-((x - 0.42) ** 2) / 0.14 - ((y - 1) ** 2) / 0.30);
    const lift = 0.09 + 0.10 * x * (1 - y) + 0.06 * y;
    const s = (x + y) / 2;                                // 0 at the left corner, 1 at the right corner
    const flap = (0.15 + 0.85 * s) * (0.09 * Math.sin(2 * Math.PI * 1.15 * s - W * t)
               + 0.035 * Math.sin(2 * Math.PI * 2.3 * s - 1.7 * W * t + 0.8)
               + 0.016 * Math.sin(2 * Math.PI * 3.6 * s - 2.4 * W * t + 2.1))
               + 0.012 * Math.sin(2 * Math.PI * 0.8 * (x - y) - 0.8 * W * t);
    return lift + hill * (1 + 0.06 * Math.sin(W * t * 0.5)) + flap;
  }
  const P = (x, y, h) => [x + y, (x - y) * CY - h];

  function mix(hex, k) {                               // k > 0 lightens, k < 0 darkens
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
    return "rgb(" + c.map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))).join(",") + ")";
  }
  function light(x, y, t) {
    const e = 0.004, zx = (z(x + e, y, t) - z(x - e, y, t)) / (2 * e), zy = (z(x, y + e, t) - z(x, y - e, t)) / (2 * e);
    const n = Math.hypot(zx, zy, 1), L = [-0.45, 0.55, 1], l = Math.hypot(...L);
    return Math.max(-0.12, Math.min(0.2, ((-zx * L[0] - zy * L[1] + L[2]) / (n * l) - 0.84) * 0.9));
  }

  // one frame: tiles in drawing order (far first), each with its outline and a two-stop gradient
  function frame(t, n) {
    n = n || 8;
    const tiles = [];
    for (let j = n - 1; j >= 0; j--) for (let i = 0; i < n; i++) {
      const x0 = i / n, y0 = j / n, d = 1 / n, pts = [];
      const edge = (ax, ay, bx, by) => { for (let s = 0; s < SEG; s++) { const u = s / SEG, x = ax + (bx - ax) * u, y = ay + (by - ay) * u; pts.push(P(x, y, z(x, y, t))); } };
      edge(x0, y0, x0 + d, y0); edge(x0 + d, y0, x0 + d, y0 + d); edge(x0 + d, y0 + d, x0, y0 + d); edge(x0, y0 + d, x0, y0);
      const cs = [[x0, y0], [x0 + d, y0], [x0 + d, y0 + d], [x0, y0 + d]].map(([x, y]) => ({ p: P(x, y, z(x, y, t)), k: light(x, y, t) }));
      const lo = cs.reduce((a, b) => (b.k < a.k ? b : a)), hi = cs.reduce((a, b) => (b.k > a.k ? b : a));
      const pat = n === 4 ? PAT4 : n === 8 ? PAT8 : PAT, hex = HEX[pat[Math.floor(j * pat.length / n)][Math.floor(i * pat.length / n)]];
      tiles.push({ d: "M" + pts.map(p => p[0].toFixed(4) + " " + p[1].toFixed(4)).join("L") + "Z",
        g: [hi.p[0], hi.p[1], lo.p[0], lo.p[1]], c: [mix(hex, hi.k), mix(hex, lo.k)], depth: (x0 - y0) });
    }
    return tiles.sort((a, b) => a.depth - b.depth);
  }
  function floorLines(m) {
    const out = [];
    for (let k = 0; k <= m; k++) { const u = k / m; out.push([P(u, 0, 0), P(u, 1, 0)], [P(0, u, 0), P(1, u, 0)]); }
    return out;
  }
  // a fixed box that holds every frame, so the mark never shifts
  function box(floor) {
    let top = 0;
    for (let t = 0; t < 7.2; t += 0.15) for (let i = 0; i <= 12; i++) for (let j = 0; j <= 12; j++) top = Math.min(top, P(i / 12, j / 12, z(i / 12, j / 12, t))[1]);
    const pad = 0.04;
    return [-pad, top - pad, 2 + 2 * pad, CY * (floor ? 1 : 0.95) - top + 2 * pad];
  }

  // static SVG text, for the favicon and the social image
  function svgText(t, o) {
    o = Object.assign({ n: 8, floor: true, stroke: "#202124", sw: 0.008, floorStroke: "#a9a69d", fsw: 0.005, id: "g", cy: 0.48 }, o);
    CY = o.cy;
    const vb = box(o.floor), tiles = frame(t, o.n);
    CY = 0.48;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(v => v.toFixed(3)).join(" ")}"><defs>`;
    tiles.forEach((q, i) => { s += `<linearGradient id="${o.id}${i}" gradientUnits="userSpaceOnUse" x1="${q.g[0].toFixed(4)}" y1="${q.g[1].toFixed(4)}" x2="${q.g[2].toFixed(4)}" y2="${q.g[3].toFixed(4)}"><stop offset="0" stop-color="${q.c[0]}"/><stop offset="1" stop-color="${q.c[1]}"/></linearGradient>`; });
    s += "</defs>";
    if (o.floor) s += `<g stroke="${o.floorStroke}" stroke-width="${o.fsw}" stroke-linecap="round">` + floorLines(8).map(([a, b]) => `<line x1="${a[0].toFixed(4)}" y1="${a[1].toFixed(4)}" x2="${b[0].toFixed(4)}" y2="${b[1].toFixed(4)}"/>`).join("") + "</g>";
    s += `<g stroke="${o.stroke}" stroke-width="${o.sw}" stroke-linejoin="round">` + tiles.map((q, i) => `<path d="${q.d}" fill="url(#${o.id}${i})"/>`).join("") + "</g></svg>";
    return s;
  }

  // live mark inside an <svg>; it waves while on screen and holds still for reduced motion
  let uid = 0;
  function mount(host, o) {
    o = Object.assign({ n: 8, floor: true, sw: 0.8, still: false }, o);
    const NS = "http://www.w3.org/2000/svg", id = "mk" + (++uid) + "-";
    const mk = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
    host.setAttribute("viewBox", box(o.floor).join(" "));
    const defs = mk("defs", {}, host);
    if (o.floor) { const g = mk("g", { class: "mk-floor" }, host); for (const [a, b] of floorLines(8)) mk("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], "vector-effect": "non-scaling-stroke" }, g); }
    const tg = mk("g", { class: "mk-tiles", "stroke-width": o.sw, "stroke-linejoin": "round" }, host);
    const first = frame(0, o.n);
    const parts = first.map((q, i) => {
      const lg = mk("linearGradient", { id: id + i, gradientUnits: "userSpaceOnUse" }, defs);
      return { lg, s0: mk("stop", { offset: 0 }, lg), s1: mk("stop", { offset: 1 }, lg), path: mk("path", { fill: `url(#${id + i})`, "vector-effect": "non-scaling-stroke" }, tg) };
    });
    function draw(t) {
      frame(t, o.n).forEach((q, i) => {
        const p = parts[i];
        p.path.setAttribute("d", q.d);
        p.lg.setAttribute("x1", q.g[0]); p.lg.setAttribute("y1", q.g[1]); p.lg.setAttribute("x2", q.g[2]); p.lg.setAttribute("y2", q.g[3]);
        p.s0.setAttribute("stop-color", q.c[0]); p.s1.setAttribute("stop-color", q.c[1]);
      });
    }
    draw(0.9);
    if (o.still) return;
    let on = true, raf = 0, last = 0, t = 0.9;
    const loop = now => {
      raf = 0;
      if (!on || document.hidden) return;
      if (last) t += Math.min(now - last, 50) / 1000;
      last = now;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const go = () => { if (!raf && on && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { on = es[0].isIntersecting; go(); }).observe(host);
    document.addEventListener("visibilitychange", go);
    go();
  }

  const api = { frame, svgText, mount, z };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.AAMark = api;
})(typeof window !== "undefined" ? window : globalThis);
