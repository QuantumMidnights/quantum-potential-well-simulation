(() => {
  const canvas = document.getElementById('doubleWellCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const separation = document.getElementById('separation');
  const barrier = document.getElementById('barrier');
  const depth = document.getElementById('depth');
  const controls = { separation, barrier, depth };
  const outputs = {
    separation: document.getElementById('separationOut'),
    barrier: document.getElementById('barrierOut'),
    depth: document.getElementById('depthOut')
  };
  const info = {
    separation: document.getElementById('infoSeparation'),
    barrier: document.getElementById('infoBarrier'),
    depth: document.getElementById('infoDepth')
  };
  const baselineBarrier = document.getElementById('baselineBarrier');
  const currentBarrier = document.getElementById('currentBarrier');
  const barrierChange = document.getElementById('barrierChange');
  const feedback = document.getElementById('dwFeedback');
  const reflection = document.getElementById('dwReflection');
  let prediction = null;
  let startingValues = null;
  let observationSaved = false;

  function potential(x, s, b, d) {
    const well1 = -d * Math.exp(-Math.pow((x + s / 2) / 0.62, 2));
    const well2 = -d * Math.exp(-Math.pow((x - s / 2) / 0.62, 2));
    const central = b * Math.exp(-Math.pow(x / 0.48, 2));
    return well1 + well2 + central;
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const w = rect.width, h = rect.height;
    const pad = { l: 42, r: 16, t: 20, b: 34 };
    const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#e3e7fb'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ph * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = '#727ba9'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'right';
      ctx.fillText((4 - i * 2).toFixed(0), pad.l - 8, y + 3);
    }
    ctx.strokeStyle = '#7d86bb'; ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
    const s = Number(separation.value), b = Number(barrier.value), d = Number(depth.value);
    const vals = [];
    for (let i = 0; i <= 240; i++) {
      const x = -4 + 8 * i / 240;
      vals.push({ x, y: potential(x, s, b, d) });
    }
    const min = -d - 0.8, max = Math.max(b, 1) + 0.8;
    const px = x => pad.l + (x + 4) / 8 * pw;
    const py = y => pad.t + (max - y) / (max - min) * ph;
    ctx.beginPath(); ctx.moveTo(px(vals[0].x), py(vals[0].y));
    for (const v of vals.slice(1)) ctx.lineTo(px(v.x), py(v.y));
    ctx.lineTo(px(4), py(min)); ctx.lineTo(px(-4), py(min)); ctx.closePath();
    ctx.fillStyle = 'rgba(137,104,245,.14)'; ctx.fill();
    ctx.beginPath(); vals.forEach((v, i) => i ? ctx.lineTo(px(v.x), py(v.y)) : ctx.moveTo(px(v.x), py(v.y)));
    ctx.strokeStyle = '#8055e8'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#515b96'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'center';
    [-4, -2, 0, 2, 4].forEach(x => ctx.fillText(String(x), px(x), h - pad.b + 17));
    ctx.fillStyle = '#343f80'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left'; ctx.fillText('V(x)', 8, 13);
    ctx.textAlign = 'center'; ctx.fillText('Position x (model units)', pad.l + pw / 2, h - 5);
  }

  function getValues() {
    return { separation: Number(separation.value), barrier: Number(barrier.value), depth: Number(depth.value) };
  }
  function fmt(value) { return Number(value).toFixed(1); }

  function updateActivityReadings() {
    const current = Number(barrier.value);
    currentBarrier.textContent = fmt(current);
    if (!startingValues) {
      barrierChange.textContent = '—';
      return;
    }
    const delta = current - startingValues.barrier;
    barrierChange.textContent = `${delta > 0 ? '+' : ''}${fmt(delta)}`;
    if (Math.abs(delta) < 0.0001) {
      feedback.textContent = 'The barrier is still at its starting value. Move the Central barrier height slider to observe a change.';
      return;
    }
    const direction = delta > 0 ? 'increased' : 'decreased';
    const observed = delta > 0 ? 'higher' : 'lower';
    let predictionText = '';
    if (prediction) {
      const correct = (prediction === 'higher' && delta > 0) || (prediction === 'lower' && delta < 0) || (prediction === 'same' && Math.abs(delta) < 0.0001);
      predictionText = correct ? ' Your prediction matches the direction of change.' : ' Your prediction differs from the observed direction; consider why.';
    }
    feedback.textContent = `Compared with the starting value (${fmt(startingValues.barrier)}), the barrier parameter ${direction} to ${fmt(current)}. In this model, the central peak becomes ${observed}.${predictionText} This compares the model parameter and plotted profile; it does not calculate tunnelling or quantum energy levels.`;
  }

  function update() {
    for (const key of Object.keys(outputs)) {
      const value = fmt(controls[key].value);
      outputs[key].value = value;
      outputs[key].textContent = value;
      info[key].textContent = value;
    }
    draw();
    updateActivityReadings();
    observationSaved = false;
    const status = document.getElementById('observationStatus');
    if (status) status.textContent = 'Parameters changed. Save your observation again if you want to keep the updated note in this session.';
  }

  Object.values(controls).forEach(el => el.addEventListener('input', update));
  document.getElementById('resetDw').addEventListener('click', () => {
    separation.value = '2'; barrier.value = '3'; depth.value = '4'; update();
  });
  document.querySelectorAll('.prediction-option').forEach(btn => btn.addEventListener('click', () => {
    prediction = btn.dataset.answer;
    document.querySelectorAll('.prediction-option').forEach(b => b.classList.toggle('selected', b === btn));
    feedback.textContent = `Prediction recorded: “${btn.textContent.trim()}”. Record the starting values, then change the barrier slider to test your prediction.`;
  }));
  document.getElementById('recordBaseline').addEventListener('click', () => {
    startingValues = getValues();
    baselineBarrier.textContent = fmt(startingValues.barrier);
    barrierChange.textContent = '0.0';
    feedback.textContent = `Starting values recorded: separation ${fmt(startingValues.separation)}, barrier ${fmt(startingValues.barrier)}, depth ${fmt(startingValues.depth)}. Now change the barrier height and compare.`;
    observationSaved = false;
  });
  document.getElementById('resetExperiment').addEventListener('click', () => {
    separation.value = '2'; barrier.value = '3'; depth.value = '4';
    startingValues = null; prediction = null;
    baselineBarrier.textContent = 'Not recorded'; barrierChange.textContent = '—';
    document.querySelectorAll('.prediction-option').forEach(b => b.classList.remove('selected'));
    reflection.value = '';
    document.getElementById('observationStatus').textContent = 'Experiment reset. Your note was cleared from this page.';
    feedback.textContent = 'Choose a prediction, record starting values, then change the barrier slider to test it.';
    update();
  });
  document.getElementById('saveObservation').addEventListener('click', () => {
    if (!reflection.value.trim()) {
      document.getElementById('observationStatus').textContent = 'Write a short observation before saving it.';
      reflection.focus(); return;
    }
    observationSaved = true;
    document.getElementById('observationStatus').textContent = 'Observation saved on this page for the current session. It has not been uploaded or sent anywhere.';
  });
  window.addEventListener('resize', draw);
  update();
})();
