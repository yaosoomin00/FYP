// Misi Angkasa: fly through stars, laser asteroids, grab ⚡ for a super wide laser.
import { X, W, H, M, S, G, near, add, burst, ring, glow, star, txt, sfx, givePower } from '../engine/engine'

function kill(o) { o.dead = 1; add(2, o.x, o.y); burst(o.x, o.y, '#ffb347', 26); ring(o.x, o.y, 70, '#ffb347'); sfx(300, 0.2, 'square') }
function rocket(x, y, s, t) {
  X.save(); X.translate(x, y); glow(0, s * 1.2, s * 1.4, '255,160,40', 0.8)
  X.fillStyle = '#ffd23f'; X.beginPath(); X.moveTo(-s * 0.35, s * 0.9); X.quadraticCurveTo(0, s * 0.9 + s * (1.3 + Math.sin(t * 40) * 0.4), s * 0.35, s * 0.9); X.fill()
  X.fillStyle = '#ef476f'
  for (const d of [-1, 1]) { X.beginPath(); X.moveTo(d * s * 0.5, s * 0.1); X.lineTo(d * s * 1.05, s * 1.0); X.lineTo(d * s * 0.4, s * 0.85); X.fill() }
  const g = X.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, '#c9d4f0'); g.addColorStop(0.5, '#fff'); g.addColorStop(1, '#c9d4f0')
  X.fillStyle = g; X.beginPath(); X.moveTo(0, -s * 1.6); X.bezierCurveTo(s * 0.95, -s * 0.8, s * 0.7, s * 0.7, s * 0.5, s * 0.9)
  X.lineTo(-s * 0.5, s * 0.9); X.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.95, -s * 0.8, 0, -s * 1.6); X.fill()
  X.fillStyle = '#ef476f'; X.beginPath(); X.moveTo(0, -s * 1.6); X.bezierCurveTo(s * 0.45, -s * 1.25, s * 0.5, -s * 1.0, s * 0.5, -s * 0.95)
  X.lineTo(-s * 0.5, -s * 0.95); X.bezierCurveTo(-s * 0.5, -s * 1.0, -s * 0.45, -s * 1.25, 0, -s * 1.6); X.fill()
  X.fillStyle = '#4cc9f0'; X.beginPath(); X.arc(0, -s * 0.35, s * 0.3, 0, 7); X.fill()
  X.strokeStyle = '#fff'; X.lineWidth = 4; X.stroke(); X.restore()
}
const stars = Array.from({ length: 60 }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, l: i % 3 }))

export default {
  goal: 50, trail: '#ffb347', pname: '⚡ SUPER LASER',
  hint: 'Fly through ⭐ stars! Click = laser on asteroids ☄️',
  bg(t) {
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#080b2a'); g.addColorStop(1, '#2a0f55')
    X.fillStyle = g; X.fillRect(0, 0, W, H)
    glow(200, 150, 350, '120,60,220', 0.28); glow(760, 440, 400, '30,140,220', 0.22)
    for (const s of stars) { const v = 25 + s.l * 45; X.globalAlpha = 0.4 + 0.2 * s.l
      X.fillStyle = '#fff'; X.fillRect(s.x, (s.y + t * v) % H, 1 + s.l, 1 + s.l * 1.5) }
    X.globalAlpha = 1
    const px = ((t * 8) % (W + 300)) - 150
    const pg = X.createRadialGradient(px - 20, 100, 8, px, 120, 70); pg.addColorStop(0, '#ffb4d8'); pg.addColorStop(1, '#7a3fb8')
    X.fillStyle = pg; X.beginPath(); X.arc(px, 120, 60, 0, 7); X.fill()
    X.strokeStyle = 'rgba(255,220,240,.5)'; X.lineWidth = 8; X.beginPath(); X.ellipse(px, 120, 100, 20, -0.3, 0, 7); X.stroke()
  },
  init() { this.o = []; this.cd = 0; this.cool = 0; this.beam = 0; this.bx = 0; this.by = 0; this.t = 0 },
  update(dt) {
    const hard = G.diff === 'fast'
const sp = S[G.diff].sp * (hard ? 1.35 : 1)

this.t += dt
this.cd -= dt
this.cool -= dt
this.beam -= dt
    if (this.cd <= 0) {
      this.cd = (hard ? 0.38 : 0.6) / sp

const k = Math.random()
const j = hard
  ? k >= 0.32 && k < 0.97
  : k >= 0.42 && k < 0.95
      this.o.push({ t: k < 0.42 ? 's' : j ? 'a' : 'p', junk: j, x: 50 + Math.random() * (W - 100), y: -40, vy: (90 + Math.random() * 60) * sp,
        r: j ? 32 : 26, rot: 0, pts: Array.from({ length: 9 }, () => 0.75 + Math.random() * 0.35) })
    }
    const A = { x: M.sx, y: M.sy }
    for (const o of this.o) {
      o.y += o.vy * dt; o.rot += dt
      if (near(o, A, o.r + 26)) {
        o.dead = 1
        if (o.t === 's') { add(1, o.x, o.y); burst(o.x, o.y, '#ffd84d'); sfx(560 + Math.min(G.combo, 15) * 35, 0.1) }
        else if (o.t === 'p') { givePower(8); burst(o.x, o.y, '#7df9ff', 24) }
        else { add(-1, o.x, o.y); G.shake = 0.3; sfx(150, 0.2, 'sawtooth') }
      }
    }
    this.o = this.o.filter((o) => !o.dead && o.y < H + 60)
  },
  click(x, y) {
    if (this.cool > 0) return
    const pw = G.power > 0, w = pw ? 80 : 25
    this.cool = pw ? 0.08 : 0.2; this.beam = 0.12; this.bx = x; this.by = 0; let h = 0, best = null
    for (const o of this.o) if (o.junk && !o.dead && o.y < y && Math.abs(o.x - x) < o.r + w) {
      if (pw) { kill(o); h = 1 } else if (!best || o.y > best.y) best = o }
    if (best) { kill(best); h = 1; this.by = best.y }
    if (h) G.hits++
  },
  draw() {
    for (const o of this.o) {
      if (o.t === 's') { glow(o.x, o.y, o.r * 2, '255,210,60', 0.6); X.fillStyle = '#ffe066'; X.strokeStyle = '#ffb703'; X.lineWidth = 3
        star(o.x, o.y, o.r, o.rot); X.fill(); X.stroke() }
      else if (o.t === 'p') { glow(o.x, o.y, o.r * 2, '90,220,255', 0.7); txt('⚡', o.x, o.y, 44) }
      else { X.save(); X.translate(o.x, o.y); X.rotate(o.rot); X.beginPath()
        o.pts.forEach((k, i) => X.lineTo(Math.cos((i / 9) * 6.283) * o.r * k, Math.sin((i / 9) * 6.283) * o.r * k)); X.closePath()
        const g = X.createRadialGradient(-8, -8, 4, 0, 0, o.r); g.addColorStop(0, '#b9a493'); g.addColorStop(1, '#6b5a4c')
        X.fillStyle = g; X.fill(); X.strokeStyle = '#4a3b30'; X.lineWidth = 3; X.stroke()
        X.fillStyle = 'rgba(0,0,0,.22)'; X.beginPath(); X.arc(-o.r * 0.3, o.r * 0.15, o.r * 0.2, 0, 7); X.fill()
        X.beginPath(); X.arc(o.r * 0.3, -o.r * 0.3, o.r * 0.12, 0, 7); X.fill(); X.restore() }
    }
    if (this.beam > 0) { const w = G.power > 0 ? 46 : 12; X.globalAlpha = this.beam / 0.12
      const g = X.createLinearGradient(this.bx - w, 0, this.bx + w, 0); g.addColorStop(0, 'rgba(80,220,255,0)'); g.addColorStop(0.5, '#fff'); g.addColorStop(1, 'rgba(80,220,255,0)')
      X.fillStyle = g; X.fillRect(this.bx - w, this.by, w * 2, M.sy - this.by); X.globalAlpha = 1 }
    rocket(M.sx, M.sy, 30, this.t)
  },
}