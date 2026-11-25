'use strict';
// ===== MOTRIX shared engine =====
// Input = standard mouse events (BLE HID from ESP32 shows up as a normal mouse).
const C=document.getElementById('c'),X=C.getContext('2d'),W=960,H=600;
const $=id=>document.getElementById(id);
// t = round seconds, sp = speed multiplier, sm = cursor smoothing (lower = smoother, filters IMU jitter)
const S={slow:{t:90,sp:.7,sm:5},medium:{t:60,sp:1,sm:8},fast:{t:45,sp:1.35,sm:12}};
const M={x:W/2,y:H/2,sx:W/2,sy:H/2};            // raw (x,y) and smoothed (sx,sy) pointer
const games={};
let diff='medium',cur=null,name='',left=0,score=0,col=0,clicks=0,hits=0,last=0,run=false,P=[],shake=0,AC=null,raf=0;

function pos(e){const r=C.getBoundingClientRect();M.x=(e.clientX-r.left)*W/r.width;M.y=(e.clientY-r.top)*H/r.height}
C.addEventListener('pointermove',pos);
C.addEventListener('pointerdown',e=>{pos(e);if(!run)return;clicks++;sfx(520,.06);cur.click(M.sx,M.sy)});

function sfx(f,d=.1,type='sine'){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.value=f;g.gain.value=.15;g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);
  o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function near(a,b,r){return Math.hypot(a.x-b.x,a.y-b.y)<r}
function add(n,x,y){score=Math.max(0,score+n);if(n>0)col++;
  P.push({x,y,vx:0,vy:-70,l:.9,t:(n>0?'+':'')+n,c:n>0?'#fff':'#ff6b6b'})}
function burst(x,y,c,n=14){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=60+Math.random()*160;
  P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5+Math.random()*.4,c})}}
function txt(s,x,y,size,rot=0,flip=1){X.save();X.translate(x,y);X.rotate(rot);X.scale(flip,1);
  X.font=size+'px serif';X.textAlign='center';X.textBaseline='middle';X.fillText(s,0,0);X.restore()}
function drawP(dt){for(const p of P){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;X.fillStyle=p.c;
    if(p.t){X.font='bold 30px sans-serif';X.textAlign='center';X.fillText(p.t,p.x,p.y)}
    else{X.globalAlpha=Math.max(0,p.l*2);X.beginPath();X.arc(p.x,p.y,5,0,7);X.fill();X.globalAlpha=1}}
  P=P.filter(p=>p.l>0)}

function start(g){name=g;cur=games[g];left=S[diff].t;score=col=clicks=hits=0;P=[];M.sx=M.x;M.sy=M.y;
  cur.init();$('menu').classList.add('hidden');$('end').classList.add('hidden');$('hud').classList.remove('hidden');
  run=true;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}

function loop(t){if(!run)return;
  const dt=Math.min(.05,(t-last)/1000);last=t;
  const k=1-Math.exp(-S[diff].sm*dt);M.sx+=(M.x-M.sx)*k;M.sy+=(M.y-M.sy)*k;   // cursor smoothing (lerp)
  left-=dt;cur.update(dt);
  X.save();if(shake>0){shake-=dt;X.translate((Math.random()-.5)*10,(Math.random()-.5)*10)}
  cur.bg(t/1000);cur.draw();drawP(dt);X.restore();
  X.strokeStyle='rgba(255,255,255,.7)';X.lineWidth=3;X.beginPath();X.arc(M.x,M.y,8,0,7);X.stroke(); // raw pointer
  $('sc').textContent='⭐ '+score;$('tm').textContent='⏱ '+Math.max(0,Math.ceil(left));
  if(left<=0)return end();
  raf=requestAnimationFrame(loop)}

function end(){run=false;
  const acc=clicks?Math.round(hits/clicks*100):0,pm=(col/S[diff].t*60).toFixed(1);
  const L=JSON.parse(localStorage.getItem('motrix_log')||'[]');
  L.push({date:new Date().toISOString(),game:name,level:diff,score,collected:col,clicks,hits,accuracy_pct:acc,targets_per_min:pm});
  localStorage.setItem('motrix_log',JSON.stringify(L));
  $('hud').classList.add('hidden');$('end').classList.remove('hidden');
  $('endt').textContent=score>=25?'Gempak! 🏆':score>=10?'Hebat! 🎉':'Bagus! Cuba lagi 💪';
  $('res').innerHTML='⭐ Score: <b>'+score+'</b><br>🎯 Click accuracy: <b>'+acc+'%</b> ('+hits+'/'+clicks+')<br>⚡ Targets/min: <b>'+pm+'</b>'}

function quit(){run=false;cancelAnimationFrame(raf);['hud','end'].forEach(i=>$(i).classList.add('hidden'));$('menu').classList.remove('hidden')}

function csv(){const L=JSON.parse(localStorage.getItem('motrix_log')||'[]');if(!L.length)return;
  const h=Object.keys(L[0]);const s=[h.join(',')].concat(L.map(r=>h.map(k=>r[k]).join(','))).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/csv'}));a.download='motrix_results.csv';a.click()}

document.querySelectorAll('#lv button').forEach(b=>b.onclick=()=>{diff=b.dataset.d;
  document.querySelectorAll('#lv button').forEach(x=>x.classList.toggle('on',x===b))});