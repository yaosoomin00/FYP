// Ikan Kenyang: eat glowing food, pop jellyfish & pearls with bubble blast, grab the magnet.
import { X, W, H, M, S, G, near, add, burst, confetti, ring, glow, star, txt, sfx, givePower } from '../engine/engine'

const FOOD = ['120,255,180', '255,226,110', '255,150,200']

function drawFish(x, y, r, face, t) {
  X.save(); X.translate(x, y); X.scale(face, 1)
  X.save(); X.translate(-r * 1.15, 0); X.rotate(Math.sin(t * 12) * 0.35); X.fillStyle = '#ff8c42'
  X.beginPath(); X.moveTo(0, 0); X.lineTo(-r * 0.9, -r * 0.8); X.quadraticCurveTo(-r * 0.5, 0, -r * 0.9, r * 0.8); X.fill(); X.restore()
  X.fillStyle = '#ffb067'; X.beginPath(); X.moveTo(-r * 0.3, -r * 0.8); X.quadraticCurveTo(0, -r * 1.55, r * 0.4, -r * 0.85); X.fill()
  const g = X.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#ffd36b'); g.addColorStop(1, '#ff7a3d')
  X.fillStyle = g; X.beginPath(); X.ellipse(0, 0, r * 1.3, r, 0, 0, 7); X.fill()
  X.fillStyle = 'rgba(255,255,255,.35)'; X.beginPath(); X.ellipse(0, r * 0.38, r, r * 0.4, 0, 0, 7); X.fill()
  X.fillStyle = '#fff'; X.beginPath(); X.arc(r * 0.6, -r * 0.25, r * 0.34, 0, 7); X.fill()
  X.fillStyle = '#222'; X.beginPath(); X.arc(r * 0.7, -r * 0.25, r * 0.17, 0, 7); X.fill()
  X.fillStyle = '#fff'; X.beginPath(); X.arc(r * 0.75, -r * 0.31, r * 0.06, 0, 7); X.fill()
  X.strokeStyle = '#8a2e0f'; X.lineWidth = 3; X.beginPath(); X.arc(r * 0.8, r * 0.12, r * 0.22, 0.2, 1.8); X.stroke()
  X.fillStyle = 'rgba(255,90,120,.5)'; X.beginPath(); X.arc(r * 0.42, r * 0.15, r * 0.15, 0, 7); X.fill()
  X.restore()
}
function jelly(x, y, r, t) {
  X.save(); X.translate(x, y); glow(0, 0, r * 2, '200,90,255', 0.5)
  X.strokeStyle = 'rgba(235,160,255,.9)'; X.lineWidth = 4; X.lineCap = 'round'
  for (let i = -2; i <= 2; i++) { X.beginPath(); X.moveTo(i * r * 0.4, r * 0.1)
    for (let j = 1; j <= 4; j++) X.lineTo(i * r * 0.4 + Math.sin(t * 4 + j + i) * 6, r * 0.1 + j * r * 0.35); X.stroke() }
  const g = X.createLinearGradient(0, -r, 0, r * 0.3); g.addColorStop(0, '#f0b8ff'); g.addColorStop(1, '#a45bff')
  X.fillStyle = g; X.beginPath(); X.ellipse(0, 0, r, r * 0.9, 0, Math.PI, 0); X.closePath(); X.fill()
  X.fillStyle = '#2a0a4a'; X.beginPath(); X.arc(-r * 0.3, -r * 0.3, 4, 0, 7); X.arc(r * 0.3, -r * 0.3, 4, 0, 7); X.fill()
  X.restore()
}

export default {
  goal: 45, trail: '#9be7ff', pname: '🧲 MAGNET',
  hint: 'Eat the glowing food! Click = bubble blast 💥',
  bg(t) {
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5fd8ff'); g.addColorStop(1, '#0b4f8a')
    X.fillStyle = g; X.fillRect(0, 0, W, H)
    X.fillStyle = 'rgba(255,255,255,.07)'
    for (let i = 0; i < 5; i++) { const x = i * 230 + Math.sin(t * 0.3 + i) * 40
      X.beginPath(); X.moveTo(x, 0); X.lineTo(x + 60, 0); X.lineTo(x + 200, H); X.lineTo(x + 60, H); X.fill() }
    X.fillStyle = 'rgba(255,255,255,.25)'
    for (let i = 0; i < 16; i++) { X.beginPath(); X.arc((i * 97 + Math.sin(t + i) * 20) % W, H - ((t * 30 + i * 61) % H), 4 + (i % 4) * 2, 0, 7); X.fill() }
    X.lineCap = 'round'; X.lineWidth = 12
    for (let i = 0; i < 12; i++) { const x = i * 85 + 20, h = 90 + (i % 3) * 40, sw = Math.sin(t * 1.5 + i) * 18
      X.strokeStyle = i % 2 ? '#1f9d6b' : '#2bbf80'; X.beginPath(); X.moveTo(x, H)
      X.quadraticCurveTo(x + sw, H - h / 2, x + sw * 1.6, H - h); X.stroke() }
    X.fillStyle = '#f0cf86'; X.fillRect(0, H - 22, W, 22)
  },
  init() { this.o = []; this.cd = 0; this.eaten = 0; this.face = 1; this.px = M.sx; this.fr = 28; this.t = 0 },
  update(dt) {
   const hard = G.diff === 'fast'
const sp = S[G.diff].sp * (hard ? 1.3 : 1)

this.t += dt
this.cd -= dt
    if (this.cd <= 0) {
      this.cd = (hard ? 0.48 : 0.75) / sp; const k = Math.random()
      this.o.push({ type: hard
  ? k < 0.40 ? 'food'
  : k < 0.78 ? 'jelly'
  : k < 0.94 ? 'pearl'
  : 'pw'
  : k < 0.55 ? 'food'
  : k < 0.8 ? 'jelly'
  : k < 0.95 ? 'pearl'
  : 'pw',x: W + 40, y: 70 + Math.random() * (H - 150),
        vx: -(60 + Math.random() * 60) * sp, ph: Math.random() * 6, r: 26, c: FOOD[Math.floor(Math.random() * 3)] })
    }
    if (Math.abs(M.sx - this.px) > 0.6) this.face = M.sx > this.px ? 1 : -1
    this.px = M.sx; this.fr = 28 + Math.min(26, this.eaten * 0.8)     // fish grows as it eats
    const A = { x: M.sx, y: M.sy }
    for (const o of this.o) {
      o.ph += dt * 2; o.y += Math.sin(o.ph) * 30 * dt
      if (o.type === 'food' && (o.pull || (G.power > 0 && near(o, A, 320)))) {
        const dx = M.sx - o.x, dy = M.sy - o.y, d = Math.hypot(dx, dy) || 1; o.x += (dx / d) * 560 * dt; o.y += (dy / d) * 560 * dt
      } else o.x += o.vx * dt
      if (o.type !== 'pearl' && near(o, A, this.fr + o.r * 0.7)) {
        o.dead = 1
        if (o.type === 'food') { this.eaten++; add(1, o.x, o.y); burst(o.x, o.y, 'rgb(' + o.c + ')'); sfx(520 + Math.min(G.combo, 15) * 35, 0.1) }
        else if (o.type === 'pw') { givePower(8); burst(o.x, o.y, '#7df9ff', 24) }
        else { add(-2, o.x, o.y); G.shake = 0.3; burst(o.x, o.y, '#d38bff', 18); sfx(140, 0.25, 'sawtooth') }
      }
    }
    this.o = this.o.filter((o) => !o.dead && o.x > -60)
  },
  click(x, y) {
    ring(x, y, 170, '#fff'); let h = 0
    for (const o of this.o) {
      if (o.dead || !near(o, { x, y }, 170)) continue
      if (o.type === 'jelly') { o.dead = 1; add(1, o.x, o.y); burst(o.x, o.y, '#d38bff', 22); h = 1; sfx(500, 0.12, 'square') }
      else if (o.type === 'pearl') { o.dead = 1; add(5, o.x, o.y); confetti(o.x, o.y, 30); h = 1; sfx(1100, 0.3, 'triangle') }
      else if (o.type === 'food') { o.pull = 1; h = 1 }                 // blast pulls food towards the fish
    }
    if (h) G.hits++
  },
  draw() {
    for (const o of this.o) {
      if (o.type === 'food') { glow(o.x, o.y, o.r * 2, o.c, 0.6); X.fillStyle = 'rgb(' + o.c + ')'; X.beginPath(); X.arc(o.x, o.y, o.r * 0.6, 0, 7); X.fill()
        X.fillStyle = 'rgba(255,255,255,.85)'; X.beginPath(); X.arc(o.x - 4, o.y - 4, o.r * 0.18, 0, 7); X.fill() }
      else if (o.type === 'jelly') jelly(o.x, o.y, o.r + 6, this.t)
      else if (o.type === 'pearl') { glow(o.x, o.y, o.r * 2.2, '255,220,90', 0.7)
        const g = X.createRadialGradient(o.x - 6, o.y - 6, 2, o.x, o.y, o.r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#f5c542')
        X.fillStyle = g; X.beginPath(); X.arc(o.x, o.y, o.r * 0.8, 0, 7); X.fill(); X.fillStyle = '#fff6'; star(o.x, o.y, o.r * 1.1, this.t * 2); X.fill() }
      else { glow(o.x, o.y, o.r * 2, '90,200,255', 0.7); txt('🧲', o.x, o.y, 40) }
    }
    if (G.power > 0) { X.strokeStyle = 'rgba(125,249,255,.6)'; X.lineWidth = 4; X.setLineDash([10, 8]); X.beginPath(); X.arc(M.sx, M.sy, 320, 0, 7); X.stroke(); X.setLineDash([]) }
    drawFish(M.sx, M.sy, this.fr, this.face, this.t)
  },
}