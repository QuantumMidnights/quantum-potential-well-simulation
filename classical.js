(() => {
  const byId = (id) => document.getElementById(id);
  const canvas = byId('classicalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const widthSlider = byId('widthSlider');
  const energySlider = byId('energySlider');
  const positionSlider = byId('positionSlider');
  const playPauseButton = byId('playPauseButton');
  const resetButton = byId('resetButton');
  const timeGraph = byId('timeGraph');
  const energyGraph = byId('energyGraph');
  const tctx = timeGraph.getContext('2d');
  const ectx = energyGraph.getContext('2d');

  let running = true;
  let lastTime = 0;
  let fraction = Number(positionSlider.value);
  let direction = 1;
  let elapsed = 0;
  let graphHistory = [];
  let frameId = 0;
  let dpr = 1;
  let cw = 0, ch = 0;

  const energy = () => Number(energySlider.value);
  const wellWidth = () => Number(widthSlider.value);
  // This educational model uses a fixed reference mass. Speed is shown in model units,
  // because eV and nm are illustrative controls rather than a fully specified SI setup.
  const speed = () => Math.sqrt(energy());
  const fmt = (n, digits = 2) => Number(n).toFixed(digits);

  function resizeCanvas(canvasEl, context) {
    const rect = canvasEl.getBoundingClientRect();
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvasEl.width = Math.max(1, Math.round(rect.width * ratio));
    canvasEl.height = Math.max(1, Math.round(rect.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { width: rect.width, height: rect.height };
  }

  function drawMotion() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    cw = rect.width; ch = rect.height;
    if (!cw || !ch) return;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    const left = cw * .08, right = cw * .92, floor = ch * .78, top = ch * .12;
    const x = left + fraction * (right - left);
    const y = floor - 18;
    const bg = ctx.createLinearGradient(0, top, 0, floor); bg.addColorStop(0, '#fafbff'); bg.addColorStop(1, '#e9edff');
    ctx.fillStyle = bg; ctx.fillRect(left, top, right - left, floor - top);
    ctx.fillStyle = 'rgba(113,111,242,.10)'; ctx.fillRect(left, top, right-left, floor-top);
    ctx.fillStyle = '#c8ceff'; ctx.fillRect(left-5, top, 8, floor-top); ctx.fillRect(right-3, top, 8, floor-top);
    ctx.strokeStyle = '#2839a4'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, floor); ctx.lineTo(right, floor); ctx.lineTo(right, top); ctx.stroke();
    // A fading trail communicates direction without implying a different physical force.
    for (let i=5;i>=1;i--) {
      const trailX = x - direction * i * 10;
      if (trailX > left+8 && trailX < right-8) {
        ctx.beginPath(); ctx.fillStyle = `rgba(110,111,245,${.035 + (6-i)*.012})`; ctx.arc(trailX,y,12-i*.7,0,Math.PI*2); ctx.fill();
      }
    }
    const ball = ctx.createRadialGradient(x-5,y-7,2,x,y,17); ball.addColorStop(0,'#ffffff'); ball.addColorStop(.28,'#9e8bff'); ball.addColorStop(1,'#5b43e9');
    ctx.beginPath(); ctx.fillStyle = ball; ctx.arc(x,y,15,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
    ctx.strokeStyle='#5a63e8';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x+direction*22,y);ctx.lineTo(x+direction*48,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+direction*42,y-5);ctx.lineTo(x+direction*48,y);ctx.lineTo(x+direction*42,y+5);ctx.stroke();
    ctx.fillStyle='#17256e';ctx.font='12px Georgia,serif';ctx.textAlign='center';ctx.fillText('0',left,floor+22);ctx.fillText(`L = ${fmt(wellWidth(),1)} nm`,right,floor+22);
  }

  function drawLineGraph(canvasEl, context, mode) {
    const size = resizeCanvas(canvasEl, context); const w=size.width,h=size.height;
    if (!w || !h) return;
    context.clearRect(0,0,w,h);
    const pad={l:35,r:12,t:10,b:24}; const gw=w-pad.l-pad.r, gh=h-pad.t-pad.b;
    context.strokeStyle='#e6e9fb';context.lineWidth=1;
    for(let i=0;i<=4;i++){const y=pad.t+gh*i/4;context.beginPath();context.moveTo(pad.l,y);context.lineTo(w-pad.r,y);context.stroke();}
    context.strokeStyle='#7d87bd';context.beginPath();context.moveTo(pad.l,pad.t);context.lineTo(pad.l,h-pad.b);context.lineTo(w-pad.r,h-pad.b);context.stroke();
    context.fillStyle='#66709f';context.font='10px Arial';context.textAlign='right';
    if(mode==='time'){
      context.fillText('L',pad.l-8,pad.t+8);context.fillText('0',pad.l-8,h-pad.b+3);
      const maxT=Math.max(10,elapsed); const visible=graphHistory.slice(-90);
      if(visible.length>1){
        const start=visible[0].t, end=visible[visible.length-1].t||start+1;
        const mapX=t=>pad.l+((t-start)/(end-start||1))*gw;
        context.strokeStyle='#954aff';context.lineWidth=2;context.beginPath();visible.forEach((p,i)=>{const px=mapX(p.t),py=pad.t+(1-p.x)*gh;i?context.lineTo(px,py):context.moveTo(px,py)});context.stroke();
        context.strokeStyle='#2864f5';context.lineWidth=1.8;context.beginPath();visible.forEach((p,i)=>{const px=mapX(p.t),py=pad.t+((1-(p.v/Math.max(1,speed())))/2)*gh;i?context.lineTo(px,py):context.moveTo(px,py)});context.stroke();
      }
      context.textAlign='center';context.fillText(`${Math.round(elapsed)} s`,pad.l+gw/2,h-5);
    } else {
      context.fillText('E',pad.l-8,pad.t+8);context.fillText('0',pad.l-8,h-pad.b+3);
      const k=energy();const yK=pad.t+(1-k/5)*gh;
      context.strokeStyle='#2e64f3';context.lineWidth=2.2;context.beginPath();context.moveTo(pad.l,yK);context.lineTo(w-pad.r,yK);context.stroke();
      context.strokeStyle='#8d55f2';context.lineWidth=2.2;context.beginPath();context.moveTo(pad.l,pad.t);context.lineTo(pad.l,h-pad.b);context.lineTo(w-pad.r,h-pad.b);context.stroke();
      context.fillStyle='#58659b';context.textAlign='left';context.fillText('0',pad.l,h-pad.b+13);context.textAlign='right';context.fillText(`${fmt(wellWidth(),1)} nm`,w-pad.r,h-pad.b+13);
    }
  }

  function updateReadouts() {
    byId('widthOutput').textContent=fmt(wellWidth(),1);
    byId('energyOutput').textContent=fmt(energy(),1);
    byId('positionInitialOutput').textContent=fmt(fraction,2);
    byId('axisWidthOutput').textContent=fmt(wellWidth(),1);
    byId('kineticOutput').textContent=fmt(energy(),2);
    byId('totalOutput').textContent=fmt(energy(),2);
    drawMotion();drawLineGraph(timeGraph,tctx,'time');drawLineGraph(energyGraph,ectx,'energy');
  }

  function animate(timestamp) {
    if(!lastTime)lastTime=timestamp;
    const dt=Math.min((timestamp-lastTime)/1000,.05);lastTime=timestamp;
    if(running){
      const fractionPerSecond=.22*speed()/(wellWidth()/2);
      fraction+=direction*fractionPerSecond*dt;
      if(fraction>=1){fraction=1;direction=-1;}
      if(fraction<=0){fraction=0;direction=1;}
      elapsed+=dt;
      graphHistory.push({t:elapsed,x:fraction,v:direction*speed()});
      if(graphHistory.length>240)graphHistory=graphHistory.slice(-240);
    }
    updateReadouts();frameId=requestAnimationFrame(animate);
  }

  energySlider.addEventListener('input',updateReadouts);
  widthSlider.addEventListener('input',updateReadouts);
  positionSlider.addEventListener('input',()=>{fraction=Number(positionSlider.value);updateReadouts();});
  document.querySelectorAll('input[name="direction"]').forEach(radio=>radio.addEventListener('change',()=>{direction=Number(radio.value);updateReadouts();}));
  playPauseButton.addEventListener('click',()=>{running=!running;playPauseButton.textContent=running?'▶  Pause':'▶  Resume';byId('motionStatus').textContent=running?'Particle is moving between the two walls.':'Simulation paused.';lastTime=0;});
  resetButton.addEventListener('click',()=>{energySlider.value='0.8';widthSlider.value='2';positionSlider.value='0.25';fraction=.25;direction=Number(document.querySelector('input[name="direction"]:checked').value);elapsed=0;graphHistory=[];running=true;lastTime=0;playPauseButton.textContent='▶  Pause';byId('motionStatus').textContent='Simulation reset. Particle is moving between the two walls.';updateReadouts();});
  byId('tryEnergyButton').addEventListener('click',()=>{energySlider.value=String(Math.min(5,energy()+.5));updateReadouts();byId('predictionFeedback').textContent='Observe the particle: with the model mass fixed, higher kinetic energy corresponds to higher speed.';});
  document.querySelectorAll('.prediction-option').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('.prediction-option').forEach(b=>b.classList.remove('selected','correct','incorrect'));
    button.classList.add('selected');const feedback=byId('predictionFeedback');
    if(button.dataset.answer==='faster'){button.classList.add('correct');feedback.textContent='Correct. For fixed mass, greater kinetic energy means greater speed.';}
    else{button.classList.add('incorrect');feedback.textContent='Try again: for fixed mass, greater kinetic energy means greater speed in this model.';}
  }));
  const resizeAll=()=>{drawMotion();drawLineGraph(timeGraph,tctx,'time');drawLineGraph(energyGraph,ectx,'energy');};
  if('ResizeObserver' in window){const observer=new ResizeObserver(resizeAll);[canvas,timeGraph,energyGraph].forEach(c=>observer.observe(c));}else window.addEventListener('resize',resizeAll);
  updateReadouts();frameId=requestAnimationFrame(animate);window.addEventListener('pagehide',()=>cancelAnimationFrame(frameId),{once:true});
})();
