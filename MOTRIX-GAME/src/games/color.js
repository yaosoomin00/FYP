
import {
  X, W, H, M, S, G,
  add, burst, confetti, ring, glow, star, txt, sfx, givePower
} from '../engine/engine'

const COL = [
  ['RED', '239,68,68'],
  ['BLUE', '59,130,246'],
  ['YELLOW', '250,204,21'],
  ['GREEN', '34,197,94'],
  ['PURPLE', '168,85,247'],
  ['ORANGE', '249,115,22'],
  ['PINK', '236,72,153']
]

const rand = (a, b) => a + Math.random() * (b - a)

function nextTarget(current) {
  let next = current

  while (next === current) {
    next = Math.floor(Math.random() * COL.length)
  }

  return next
}

function drawBalloon(b) {
  X.save()
  X.translate(b.x, b.y)

  const colour = COL[b.c][1]

  glow(0, 0, b.r * 1.5, colour, 0.18)

  X.fillStyle = `rgb(${colour})`
  X.beginPath()
  X.ellipse(0, 0, b.r * 0.82, b.r, 0, 0, Math.PI * 2)
  X.fill()

  // Balloon shine
  X.fillStyle = 'rgba(255,255,255,0.48)'
  X.beginPath()
  X.ellipse(-b.r * 0.3, -b.r * 0.35, 5, 10, -0.4, 0, Math.PI * 2)
  X.fill()

  // Balloon knot
  X.fillStyle = `rgb(${colour})`
  X.beginPath()
  X.moveTo(-5, b.r - 2)
  X.lineTo(5, b.r - 2)
  X.lineTo(0, b.r + 8)
  X.fill()

  // Balloon string
  X.strokeStyle = 'rgba(255,255,255,0.8)'
  X.lineWidth = 1.5
  X.beginPath()
  X.moveTo(0, b.r + 8)
  X.quadraticCurveTo(7, b.r + 20, 0, b.r + 30)
  X.stroke()

  if (b.gold) {
    star(0, -b.r - 9, 9, b.phase)
    txt('+ BONUS', 0, b.r + 43, 11)
  }

  X.restore()
}

function drawCloud(x, y) {
  X.save()
  X.translate(x, y)

  // Cloud shadow
  glow(0, 5, 43, '255,255,255', 0.2)

  X.fillStyle = '#ffffff'
  X.beginPath()
  X.arc(-17, 0, 16, 0, Math.PI * 2)
  X.arc(0, -10, 21, 0, Math.PI * 2)
  X.arc(19, 0, 15, 0, Math.PI * 2)
  X.arc(0, 8, 23, 0, Math.PI * 2)
  X.fill()

  // Cloud face
  circle(-7, 0, 2.5, '#425466')
  circle(8, 0, 2.5, '#425466')

  X.strokeStyle = '#425466'
  X.lineWidth = 2
  X.beginPath()
  X.arc(0, 4, 6, 0.2, Math.PI - 0.2)
  X.stroke()

  X.restore()
}

function circle(x, y, r, colour) {
  X.fillStyle = colour
  X.beginPath()
  X.arc(x, y, r, 0, Math.PI * 2)
  X.fill()
}

export default {
  goal: 30,
  trail: '#8b5cf6',
  pname: '⏱ SLOW-MO',
  hint: 'Move your cloud over the matching balloon and click!',

  init() {
    this.o = []
    this.cd = 0.5
    this.tg = Math.floor(Math.random() * COL.length)
    this.ok = 0
    this.flash = 0
    this.flashColour = '#ffffff'
    this.message = 'LET’S POP!'
    this.messageTime = 1.5
    this.time = 0
    this.goldCount = 0
    this.slowTime = 0
    this.cloudX = W / 2
    this.cloudY = H - 100
    this.popCount = 0

    G.score = 0
  },

  nearest(x, y) {
    let found = null
    let distance = 90

    for (const b of this.o) {
      const d = Math.hypot(b.x - x, b.y - y)

      if (d < distance && !b.dead) {
        distance = d
        found = b
      }
    }

    return found
  },

  update(dt) {
    this.time += dt

    const hard = G.diff === 'fast'

    // Hard mode is challenging, but not excessively fast.
    const speed = S[G.diff].sp * (hard ? 1.08 : 1)

    this.slowTime = Math.max(0, this.slowTime - dt)
    this.flash = Math.max(0, this.flash - dt)
    this.messageTime = Math.max(0, this.messageTime - dt)

    const slowMultiplier = this.slowTime > 0 ? 0.55 : 1

    // Cloud follows the controller.
    this.cloudX += (M.sx - this.cloudX) * Math.min(1, dt * 10)
    this.cloudY = Math.max(45, Math.min(H - 45, M.sy))

    // Spawn balloons.
    this.cd -= dt

    if (this.cd <= 0) {
      const goldChance = hard ? 0.08 : 0.12

      const isGold = Math.random() < goldChance

      let colour

      if (Math.random() < (hard ? 0.35 : 0.4)) {
        colour = this.tg
      } else {
        colour = Math.floor(Math.random() * COL.length)
      }

      this.o.push({
        x: rand(65, W - 65),
        y: -65,
        c: colour,
        gold: isGold,
        r: isGold ? 36 : (hard ? 37 : 42),
        vy: rand(
          hard ? 85 : 70,
          hard ? 120 : 110
        ) * speed * slowMultiplier,
        phase: Math.random() * 6,
        dead: false
      })

      this.cd = (
        hard
          ? rand(0.75, 0.95)
          : rand(0.85, 1.1)
      ) / speed
    }

    // Update balloons.
    for (const b of this.o) {
      b.y += b.vy * dt * slowMultiplier
      b.phase += dt * 3

      // Gentle horizontal movement.
      b.x += Math.sin(b.phase) * 13 * dt

      if (b.y > H + 80) {
        b.dead = true
      }
    }

    this.o = this.o.filter(b => !b.dead)

    // Slowly increase challenge over time.
    if (this.time > 35 && hard) {
      for (const b of this.o) {
        b.vy = Math.min(b.vy * 1.0005, 165)
      }
    }
  },

  click(x, y) {
    const b = this.nearest(x, y)

    if (!b) {
      sfx(180, 0.05, 'sine')
      return
    }

    b.dead = true
    this.popCount++

    // Golden bonus balloon.
    if (b.gold) {
      this.goldCount++

      add(50, b.x, b.y)
      burst(b.x, b.y, '#ffd43b', 22)
      confetti(b.x, b.y, 18)
      ring(b.x, b.y, 40, '#ffd43b')

      this.slowTime = 3
      givePower(3)

      this.message = 'GOLDEN BONUS! +50'
      this.messageTime = 1.3

      sfx(950, 0.18, 'triangle')
      return
    }

    // Correct colour.
    if (b.c === this.tg) {
      this.ok++

      const points = 10
      add(points, b.x, b.y)

      burst(b.x, b.y, `rgb(${COL[b.c][1]})`, 15)
      ring(b.x, b.y, 32, `rgb(${COL[b.c][1]})`)

      this.message = 'GREAT JOB! +10'
      this.messageTime = 0.9

      sfx(750, 0.12, 'sine')

      const hard = G.diff === 'fast'
      const targetCount = hard ? 2 : 3

      // Change to a DIFFERENT random target.
      if (this.ok % targetCount === 0) {
        const previous = this.tg
        this.tg = nextTarget(previous)

        this.message = `NEW TARGET: ${COL[this.tg][0]}!`
        this.messageTime = 1.3

        burst(W / 2, 145, `rgb(${COL[this.tg][1]})`, 12)
        sfx(1000, 0.16, 'triangle')
      }

    } else {
      // Wrong colour.
      add(-1, b.x, b.y)
      burst(b.x, b.y, '#ff7777', 8)

      this.message = 'OOPS! TRY ANOTHER COLOUR'
      this.messageTime = 1

      sfx(180, 0.12, 'sawtooth')
    }
  },

  bg(t) {
    const gradient = X.createLinearGradient(0, 0, 0, H)

    gradient.addColorStop(0, '#d9f3ff')
    gradient.addColorStop(0.65, '#f3e8ff')
    gradient.addColorStop(1, '#ffe4ef')

    X.fillStyle = gradient
    X.fillRect(0, 0, W, H)

    // Floating decorative circles.
    for (let i = 0; i < 18; i++) {
      const x = (i * 71 + Math.sin(t * 0.5 + i) * 20) % W
      const y = (i * 53 + Math.cos(t * 0.4 + i) * 15) % H

      circle(x, y, 3 + i % 5, 'rgba(255,255,255,0.35)')
    }

    // Ground decoration.
    X.fillStyle = 'rgba(255,255,255,0.25)'
    X.fillRect(0, H - 35, W, 35)
  },

  draw() {
    // Target card.
    X.save()

    roundedRect(370, 95, 220, 76, 18, '#ffffff')
    X.fillStyle = '#64748b'
    X.font = 'bold 12px sans-serif'
    X.textAlign = 'center'
    X.textBaseline = 'middle'
    X.fillText('FIND THIS COLOUR', W / 2, 115)

    X.fillStyle = `rgb(${COL[this.tg][1]})`
    X.font = 'bold 27px sans-serif'
    X.fillText(COL[this.tg][0], W / 2, 146)

    X.restore()

    // Score and progress.
    roundedRect(20, 20, 190, 58, 15, 'rgba(255,255,255,0.88)')
    txt(`SCORE: ${G.score}`, 115, 49, 21)

    roundedRect(750, 20, 190, 58, 15, 'rgba(255,255,255,0.88)')
    txt(`POPPED: ${this.ok}`, 845, 49, 19)

    // Balloons.
    for (const b of this.o) {
      drawBalloon(b)
    }

    // Cloud pointer.
    drawCloud(this.cloudX, this.cloudY)

    // Power-up indicator.
    if (this.slowTime > 0) {
      roundedRect(370, 220, 220, 40, 14, 'rgba(255,255,255,0.9)')
      txt(`⏱ SLOW MOTION ${this.slowTime.toFixed(1)}s`, 480, 240, 16)
    }

    // Messages.
    if (this.messageTime > 0) {
      X.save()
      X.globalAlpha = Math.min(1, this.messageTime * 2)

      roundedRect(300, 275, 360, 48, 15, 'rgba(255,255,255,0.9)')

      X.fillStyle = '#334155'
      X.font = 'bold 19px sans-serif'
      X.textAlign = 'center'
      X.textBaseline = 'middle'
      X.fillText(this.message, W / 2, 299)

      X.restore()
    }

    // Bottom instruction.
    roundedRect(190, H - 48, 580, 35, 13, 'rgba(255,255,255,0.82)')
    txt('MOVE THE CLOUD • CLICK THE MATCHING BALLOON', W / 2, H - 30, 14)

    // Golden bonus reminder.
    txt('⭐ GOLDEN BALLOON = BONUS + SLOW MOTION', W / 2, 555, 13)
  }
}

function roundedRect(x, y, w, h, r, colour) {
  X.fillStyle = colour
  X.beginPath()
  X.roundRect(x, y, w, h, r)
  X.fill()
}
