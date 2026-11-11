// Hero logo: the cursor clicks, becomes a monitor with a four-color cross, bends into a heart and unbends back into the cursor (about 3.6 s).
// Drawing follows the design reference (animation.js), with a longer, deeper click and slower transitions; reduced motion keeps the static logo.
(() => {
  const root = document.querySelector('.hero-logo');
  if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const reference = root.querySelector('.logo');
  const heart = root.querySelector('.heart');
  const canvas = root.querySelector('canvas');
  const context = canvas.getContext('2d');
  let standColor = '#384860';
  const blue = '#4478f3';
  const red = '#e0513d';
  const yellow = '#f1ba40';
  const green = '#57a259';
  const outlines = [
    [blue, [[79,89],[73,72],[141,101],[161,110]], [[43,80],[43,60],[122,60],[144,60]]],
    [red, [[161,110],[205,126],[178,148],[185,157]], [[144,60],[185,60],[185,86],[185,123]]],
    [yellow, [[185,157],[211,192],[189,212],[158,183]], [[185,123],[185,160],[162,160],[119,160]]],
    [green, [[158,183],[150,175],[124,203],[79,89]], [[119,160],[90,160],[43,160],[43,80]]]
  ];
  const rays = [
    [red, [36,35], [53,52]], [blue, [86,16], [86,39]],
    [yellow, [134,32], [116,49]], [green, [16,86], [41,86]],
    [blue, [32,135], [51,116]]
  ];
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => {
    const progress = clamp(value);
    return progress * progress * (3 - 2 * progress);
  };
  const mix = (a, b, progress) => a + (b - a) * progress;

  function roundedPoints(points, radius) {
    const result = [points[0]];
    for (let i = 1; i < points.length - 1; i += 1) {
      const [x,y] = points[i];
      const [beforeX,beforeY] = points[i - 1];
      const [afterX,afterY] = points[i + 1];
      const before = Math.min(.46, radius / Math.hypot(beforeX - x, beforeY - y));
      const after = Math.min(.46, radius / Math.hypot(afterX - x, afterY - y));
      const start = [mix(x,beforeX,before), mix(y,beforeY,before)];
      const end = [mix(x,afterX,after), mix(y,afterY,after)];
      for (let step = 0; step <= 12; step += 1) {
        const t = step / 12;
        result.push([
          mix(mix(start[0],x,t), mix(x,end[0],t), t),
          mix(mix(start[1],y,t), mix(y,end[1],t), t)
        ]);
      }
    }
    result.push(points[points.length - 1]);
    return result;
  }

  function resample(points) {
    const distances = [0];
    for (let i = 1; i < points.length; i += 1) {
      distances.push(distances[i - 1] + Math.hypot(
        points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }
    let segment = 1;
    const distance = distances[distances.length - 1];
    return Array.from({length: 49}, (_, index) => {
      const target = index / 48 * distance;
      while (distances[segment] < target) segment += 1;
      const t = (target - distances[segment - 1]) / (distances[segment] - distances[segment - 1]);
      return [
        mix(points[segment - 1][0], points[segment][0], t),
        mix(points[segment - 1][1], points[segment][1], t)
      ];
    });
  }

  const heartScale = 205.2 / 512;
  const heartPoint = ([x,y]) => [11.4 + x * heartScale, 11.4 + y * heartScale];

  function arc(x, y, radius, from, to) {
    return Array.from({length: 49}, (_, index) => {
      const angle = mix(from, to, index / 48);
      return [x + radius * Math.cos(angle), y + radius * Math.sin(angle)];
    });
  }

  const heartBands = [
    [[115.5,270.5], ...arc(137,179,81,3*Math.PI/4,7*Math.PI/4), [255,184]],
    [[255,184], ...arc(374,179,81,-3*Math.PI/4,Math.PI/4), [396,271]],
    [[396,271],[255.5,408]],
    [[255.5,408],[115.5,270.5]]
  ];
  const heartColors = ['#ea4235','#4286f5','#34a853','#34a853'];
  const morph = outlines.map(([color, cursor, monitor], index) => [
    color,
    resample(roundedPoints(cursor, 8)),
    resample(roundedPoints(monitor, 14)),
    resample(heartBands[index].map(heartPoint))
  ]);

  function stroke(color, points, width, capStyle = 'round', join = 'round') {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = capStyle;
    context.lineJoin = join;
    context.beginPath();
    context.moveTo(...points[0]);
    for (const point of points.slice(1)) context.lineTo(...point);
    context.stroke();
  }

  function drawCross(opacity, fold) {
    if (opacity <= 0 || fold >= 1) return;
    context.save();
    context.globalAlpha = opacity;
    context.translate(114,110);
    const scale = 1 - fold;
    context.scale(scale, scale);
    for (const color of [red,blue,green,yellow]) {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(0,0);
      context.lineTo(-6,-6);
      context.lineTo(-6,-19);
      context.arc(0,-19,6,Math.PI,2*Math.PI);
      context.lineTo(6,-6);
      context.closePath();
      context.fill();
      context.rotate(Math.PI / 2);
    }
    context.restore();
  }

  function draw(progress, tap, heartProgress, rayAlpha = (1 - progress) ** 3) {
    context.setTransform(2, 0, 0, 2, 0, 0);
    context.clearRect(0, 0, 228, 228);
    context.setTransform(1.9685, 0, 0, 1.9685, 3.15, 3.15);
    context.save();
    context.translate(73,72);
    context.scale(1 - tap * .1, 1 - tap * .1);
    context.translate(-73,-72);

    const bend = ease(heartProgress);
    const width = mix(17,28.45,bend);
    const bands = morph.map(([color, cursor, monitor, ribbon]) => [
      color,
      cursor.map(([x,y], i) => [
        mix(mix(x,monitor[i][0],progress),ribbon[i][0],bend),
        mix(mix(y,monitor[i][1],progress),ribbon[i][1],bend)
      ])
    ]);
    const points = bands.map(band => band[1]);
    if (heartProgress > 0) {
      const outline = points.flatMap((section,index) => index ? section.slice(1) : section);
      stroke('#34a853', outline, width - 1, 'butt', 'round');
    }

    for (const index of [0,3,2,1]) {
      const [color, section] = bands[index];
      if (index === 2 && heartProgress >= .77) {
        stroke(heartColors[2], [...points[2], ...points[3].slice(1)], width, 'butt', 'miter');
        continue;
      }
      if (index === 3 && heartProgress >= .77) continue;

      const sweep = ease((heartProgress - .16 - index * .024) / .52);
      if (sweep < 1) stroke(color, section, width, 'butt');
      if (sweep > 0) {
        const target = sweep * (section.length - 1);
        const last = Math.floor(target);
        const recolored = section.slice(0,last+1);
        if (last < section.length - 1) {
          recolored.push(section[last].map((value,axis) =>
            mix(value,section[last+1][axis],target-last)));
        }
        const extension = ease((heartProgress - .61) / .37);
        if (index === 1 && extension > 0) {
          recolored.unshift(section[0].map((value,axis) =>
            mix(value,heartPoint([230.5,208.5])[axis],extension)));
        }
        stroke(heartColors[index], recolored, width, 'butt');
      }
    }

    const crossing = ease((heartProgress - .57) / .40);
    if (crossing > 0) {
      const anchor = points[3][39];
      const ribbon = [[115.5,320.5],[230.5,208.5]].map(point =>
        heartPoint(point).map((value,axis) => mix(anchor[axis],value,crossing)));
      stroke('#fabc05', ribbon, mix(12,width,crossing), 'butt');
    }
    context.restore();
    context.save();
    context.globalAlpha = rayAlpha;
    const pulse = tap * .22;
    for (const [color, start, end] of rays) {
      const spread = ([x,y]) => [x + (x - 73) * pulse, y + (y - 72) * pulse];
      stroke(color, [spread(start),spread(end)], 17);
    }
    context.restore();

    const monitorDetail = ease((progress - .78) / .22);
    drawCross(monitorDetail, ease(heartProgress / .58));
    const stand = 1 - ease(heartProgress / .48);
    if (stand > 0 && monitorDetail > 0) {
      context.save();
      context.globalAlpha = monitorDetail;
      const base = mix(161,183,stand);
      stroke(standColor, [[114,mix(161,172,stand)],[114,base]], 6 * stand);
      stroke(standColor, [[114-13*stand,base],[114+13*stand,base]], 6 * stand);
      context.restore();
    }
  }

  function show(logoOpacity, monitorOpacity, heartOpacity, heartScale) {
    reference.style.opacity = String(logoOpacity);
    canvas.style.opacity = String(monitorOpacity);
    heart.style.opacity = String(heartOpacity);
    heart.style.transform = `scale(${heartScale})`;
  }

  let timer = 0, visible = false, running = false;
  function play() {
    running = true;
    standColor = getComputedStyle(root).getPropertyValue('--stand').trim() || standColor;
    const start = performance.now();
    function render(now) {
      const elapsed = now - start;
      const fromLogo = ease(elapsed / 55);
      const toMonitor = ease((elapsed - 450) / 450);
      const toHeart = clamp((elapsed - 1450) / 720);
      const heartAsset = ease((toHeart - .87) / .13);
      // return: the drawn heart replaces the heart image, then unbends straight into the cursor outline (the forward morph without the monitor)
      const back = ease((elapsed - 2700) / 150);
      const unbend = ease((elapsed - 2800) / 650);
      const toLogo = ease((elapsed - 3450) / 90);
      const tap = Math.sin(Math.PI * clamp(elapsed / 420));
      if (back > 0) draw(0, 0, 1 - unbend, ease((unbend - .6) / .4));
      else if (heartAsset < 1) draw(toMonitor, tap, toHeart);
      show(1 - fromLogo + toLogo, fromLogo * (1 - heartAsset) + back * (1 - toLogo), heartAsset * (1 - back), 1);
      if (elapsed < 3560) requestAnimationFrame(render);
      else { running = false; if (visible) timer = setTimeout(play, 2000); }
    }
    requestAnimationFrame(render);
  }
  // plays only while the logo is on screen; each run ends on the static cursor
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    clearTimeout(timer);
    if (visible && !running) timer = setTimeout(play, 800);
  }).observe(root);
})();
