
import {
  X, W, H, M, G,
  add, burst, confetti, ring, glow, star, txt, sfx
} from '../engine/engine'

const groundY = 500
const player = { x: 180, y: groundY, vy: 0, jumping: false, swing: 0, invincible: 0 }

let objects = []
let particles = []
let spawnTimer = 0
let distance = 0
let bananas = 0
let rescues = 0
let combo = 0
let comboTimer = 0
let lives = 3
let gameOver = false
let shake = 0
let message = 'LET’S GO!'
let messageTimer = 1.5
let backgroundOffset = 0
let vineCooldown = 0

const rand = (a, b) => a + Math.random() * (b - a)

function circle(x, y, r, color) {
  X.fillStyle = color
  X.beginPath()
  X.arc(x, y, r, 0, Math.PI * 2)
  X.fill()
}

function rounded(x, y, w, h, r, color) {
  X.fillStyle = color
  X.beginPath()
  X.roundRect(x, y, w, h, r)
  X.fill()
}

function drawMonkey(x, y) {
  X.save()
  X.translate(x, y)

  // Tail
  X.strokeStyle = '#75411f'
  X.lineWidth = 9
  X.lineCap = 'round'
  X.beginPath()
  X.moveTo(-20, -15)
  X.bezierCurveTo(-65, -25, -55, 25, -30, 10)
  X.stroke()

  // Body
  circle(0, -18, 23, '#9b5a2e')
  circle(0, -14, 14, '#d99b62')

  // Head
  circle(0, -52, 25, '#a96637')
  circle(-24, -52, 10, '#a96637')
  circle(24, -52, 10, '#a96637')
  circle(-24, -52, 5, '#f2b98b')
  circle(24, -52, 5, '#f2b98b')

  // Face
  circle(0, -45, 17, '#f4c79b')
  circle(-8, -55, 3, '#241b16')
  circle(8, -55, 3, '#241b16')
  circle(0, -43, 4, '#59301f')

  // Smile
  X.strokeStyle = '#75402d'
  X.lineWidth = 2
  X.beginPath()
  X.arc(0, -43, 8, 0.2, Math.PI - 0.2)
  X.stroke()

  // Arms and legs
  X.strokeStyle = '#9b5a2e'
  X.lineWidth = 10
  X.lineCap = 'round'
  X.beginPath()
  X.moveTo(-14, -25)
  X.lineTo(-27, -8)
  X.moveTo(14, -25)
  X.lineTo(27, -8)
  X.moveTo(-10, -3)
  X.lineTo(-17, 9)
  X.moveTo(10, -3)
  X.lineTo(17, 9)
  X.stroke()

  // Feet
  circle(-19, 10, 8, '#59301f')
  circle(19, 10, 8, '#59301f')

  // Little leaf hat
  X.save()
  X.translate(0, -78)
  X.rotate(-0.3)
  X.fillStyle = '#46a84c'
  X.beginPath()
  X.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2)
  X.fill()
  X.strokeStyle = '#23763a'
  X.lineWidth = 2
  X.beginPath()
  X.moveTo(-13, 0)
  X.lineTo(13, 0)
  X.stroke()
  X.restore()

  X.restore()
}

function spawnObject() {
  const roll = Math.random()

  if (roll < 0.42) {
    objects.push({
      type: 'banana',
      x: W + 40,
      y: rand(330, 450),
      r: 17,
      speed: rand(300, 370),
      spin: 0
    })
  } else if (roll < 0.57) {
    objects.push({
      type: 'gold',
      x: W + 40,
      y: rand(320, 420),
      r: 21,
      speed: 340,
      spin: 0
    })
  } else if (roll < 0.75) {
    objects.push({
      type: 'log',
      x: W + 50,
      y: groundY - 13,
      r: 24,
      speed: rand(320, 390),
      spin: 0
    })
  } else if (roll < 0.88) {
    objects.push({
      type: 'bug',
      x: W + 40,
      y: rand(410, 465),
      r: 19,
      speed: rand(340, 410),
      spin: 0
    })
  } else {
    objects.push({
      type: 'baby',
      x: W + 50,
      y: groundY - 35,
      r: 22,
      speed: 300,
      spin: 0
    })
  }
}

function drawBackground(t) {
  const sky = X.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#75d8d0')
  sky.addColorStop(0.65, '#b9e9a0')
  sky.addColorStop(1, '#5a9e51')
  X.fillStyle = sky
  X.fillRect(0, 0, W, H)

  // Distant jungle hills
  for (let i = 0; i < 7; i++) {
    const x = ((i * 190 - backgroundOffset * 0.15) % (W + 220)) - 100
    circle(x, 360 + Math.sin(i) * 15, 125, i % 2 ? '#6fbd75' : '#82c77a')
  }

  // Big trees
  for (let i = 0; i < 8; i++) {
    const x = ((i * 155 - backgroundOffset * 0.38) % (W + 180)) - 80
    X.fillStyle = '#80502f'
    X.fillRect(x - 9, 190, 18, 310)
    circle(x, 190, 55, '#27884c')
    circle(x - 28, 215, 38, '#38a65b')
    circle(x + 30, 220, 40, '#329750')
  }

  // Hanging vines
  X.strokeStyle = '#287c43'
  X.lineWidth = 7
  for (let i = 0; i < 6; i++) {
    const x = ((i * 210 - backgroundOffset * 0.65) % (W + 250)) - 100
    X.beginPath()
    X.moveTo(x, 0)
    X.quadraticCurveTo(x + 30, 95, x + 5, 175)
    X.stroke()
    circle(x + 5, 175, 7, '#45a84d')
  }

  // Ground
  X.fillStyle = '#8b5a31'
  X.fillRect(0, groundY + 12, W, H - groundY)
  X.fillStyle = '#55a83f'
  X.fillRect(0, groundY, W, 15)

  for (let i = 0; i < 25; i++) {
    const x = ((i * 53 - backgroundOffset) % (W + 60)) - 30
    X.fillStyle = i % 2 ? '#3d8e39' : '#78c84b'
    X.beginPath()
    X.moveTo(x, groundY + 12)
    X.lineTo(x + 9, groundY - 2)
    X.lineTo(x + 18, groundY + 12)
    X.fill()
  }

  // Decorative flowers
  for (let i = 0; i < 12; i++) {
    const x = ((i * 97 - backgroundOffset * 0.8) % (W + 100)) - 30
    circle(x, groundY + 28, 4, '#f8d95a')
  }
}

function drawObject(o) {
  X.save()
  X.translate(o.x, o.y)
  o.spin += 0.04

  if (o.type === 'banana' || o.type === 'gold') {
    X.rotate(Math.sin(o.spin) * 0.18)
    glow(0, 0, 27, o.type === 'gold' ? '255,205,45' : '255,235,70', 0.25)
    X.font = '34px sans-serif'
    X.textAlign = 'center'
    X.textBaseline = 'middle'
    X.fillText('🍌', 0, 0)
    if (o.type === 'gold') {
      star(0, -27, 9, o.spin)
    }
  } else if (o.type === 'log') {
    rounded(-30, -17, 60, 34, 12, '#81502b')
    circle(-17, 0, 12, '#bd8550')
    circle(17, 0, 12, '#bd8550')
    X.strokeStyle = '#60391f'
    X.lineWidth = 3
    X.beginPath()
    X.moveTo(-25, -7)
    X.lineTo(24, 7)
    X.stroke()
  } else if (o.type === 'bug') {
    circle(0, 0, 16, '#e74c3c')
    circle(-7, -5, 3, '#fff')
    circle(7, -5, 3, '#fff')
    circle(-7, -5, 1.5, '#222')
    circle(7, -5, 1.5, '#222')
    X.strokeStyle = '#54231c'
    X.lineWidth = 2
    X.beginPath()
    X.moveTo(-10, -13)
    X.lineTo(-17, -22)
    X.moveTo(10, -13)
    X.lineTo(17, -22)
    X.stroke()
  } else if (o.type === 'baby') {
    circle(0, 0, 21, '#b77b48')
    circle(-8, -3, 3, '#222')
    circle(8, -3, 3, '#222')
    circle(0, 6, 8, '#f2c69a')
    X.font = '18px sans-serif'
    X.textAlign = 'center'
    X.fillText('💛', 0, -30)
  }

  X.restore()
}

function showMessage(text, seconds = 1.4) {
  message = text
  messageTimer = seconds
}

export default {
  init() {
    objects = []
    particles = []
    spawnTimer = 0.7
    distance = 0
    bananas = 0
    rescues = 0
    combo = 0
    comboTimer = 0
    lives = 3
    gameOver = false
    shake = 0
    message = 'LET’S GO!'
    messageTimer = 1.5
    backgroundOffset = 0
    vineCooldown = 0

    player.x = 180
    player.y = groundY
    player.vy = 0
    player.jumping = false
    player.swing = 0
    player.invincible = 0

    G.score = 0
  },

  update(dt) {
    if (gameOver) return

    const speed = 1 + distance / 18000
    distance += dt * 100
    backgroundOffset += dt * 170 * speed

    // Move monkey using the MOTRIX pointer
    const targetX = Math.max(75, Math.min(420, M.sx))
    player.x += (targetX - player.x) * Math.min(1, dt * 7)

    // Jump physics
    if (player.jumping) {
      player.vy += 1550 * dt
      player.y += player.vy * dt

      if (player.y >= groundY) {
        player.y = groundY
        player.vy = 0
        player.jumping = false
        ring(player.x, groundY, 25, '#d8f5a3')
      }
    }

    if (player.swing > 0) {
  player.swing -= dt

  if (player.swing <= 0) {
    player.swing = 0
    player.y = groundY
  } else {
    player.y = groundY - 95 - Math.sin((1 - player.swing / 0.75) * Math.PI) * 35
  }

  player.jumping = false
  player.vy = 0
}

    player.invincible = Math.max(0, player.invincible - dt)
    vineCooldown = Math.max(0, vineCooldown - dt)
    comboTimer -= dt
    if (comboTimer <= 0) combo = 0

    spawnTimer -= dt
    if (spawnTimer <= 0) {
      spawnObject()
      spawnTimer = rand(0.85, 1.25) / Math.min(speed, 1.5)
    }

    for (const o of objects) {
      o.x -= o.speed * speed * dt

      const dx = o.x - player.x
      const dy = o.y - (player.y - 25)
      const hit = Math.hypot(dx, dy) < o.r + 22

      if (hit && !o.used) {
        o.used = true

        if (o.type === 'banana' || o.type === 'gold') {
          const points = o.type === 'gold' ? 50 : 10
          bananas++
          combo++
          comboTimer = 2.5
          add(points * Math.min(combo, 5), o.x, o.y)
          burst(o.x, o.y, o.type === 'gold' ? '#ffd43b' : '#ffe45c', 12)
          sfx(o.type === 'gold' ? 900 : 650, 0.12, 'sine')
          showMessage(combo >= 3 ? `${combo}x BANANA COMBO!` : 'YUMMY BANANA!')
        }

        if (o.type === 'baby') {
          rescues++
          add(100, o.x, o.y)
          confetti(o.x, o.y, 25)
          sfx(1000, 0.2, 'sine')
          showMessage('BABY MONKEY RESCUED! +100')
        }

        if (o.type === 'log' || o.type === 'bug') {
          if (player.invincible <= 0) {
            lives--
            player.invincible = 1.4
            combo = 0
            shake = 0.3
            burst(player.x, player.y - 25, '#ff8066', 16)
            sfx(160, 0.2, 'sawtooth')
            showMessage(lives > 0 ? 'OUCH! WATCH OUT!' : 'GAME OVER!')
            if (lives <= 0) gameOver = true
          }
        }
      }
    }

    objects = objects.filter(o => o.x > -80 && !o.used)

    if (messageTimer > 0) messageTimer -= dt
    if (shake > 0) shake -= dt

    if (gameOver) {
      showMessage('GAME OVER!', 99)
    }
  },

  bg(t) {
    drawBackground(t)
  },

  draw() {
    X.save()

    if (shake > 0) {
      X.translate(rand(-5, 5), rand(-4, 4))
    }

    // Objects
    objects.forEach(drawObject)

    // Vine swing point
    const vineX = 460
    const vineY = 115
    X.strokeStyle = '#287c43'
    X.lineWidth = 6
    X.beginPath()
    X.moveTo(vineX, 0)
    X.quadraticCurveTo(vineX - 20, 75, vineX, vineY)
    X.stroke()
    circle(vineX, vineY, 12, '#52b94f')

    // Monkey
    if (player.invincible <= 0 || Math.floor(player.invincible * 12) % 2 === 0) {
      drawMonkey(player.x, player.y - 5)
    }

    // HUD
    rounded(20, 18, 255, 75, 18, 'rgba(20,65,42,0.82)')
    txt('🍌  BANANAS', 145, 40, 17)
    txt(String(bananas), 145, 69, 25)

    rounded(290, 18, 180, 75, 18, 'rgba(20,65,42,0.82)')
    txt('🐵  RESCUED', 380, 40, 16)
    txt(String(rescues), 380, 69, 25)

    rounded(755, 18, 185, 75, 18, 'rgba(20,65,42,0.82)')
    txt('❤️  LIVES', 847, 40, 16)
    txt('♥ '.repeat(Math.max(0, lives)), 847, 69, 24)

    // Combo label
    if (combo >= 2 && comboTimer > 0) {
      rounded(350, 110, 260, 42, 15, 'rgba(255,193,50,0.94)')
      txt(`${combo}x COMBO!`, 480, 131, 22)
    }

    // Floating message
    if (messageTimer > 0 && !gameOver) {
      rounded(300, 165, 360, 48, 16, 'rgba(255,255,255,0.86)')
      X.fillStyle = '#315b32'
      X.font = 'bold 21px sans-serif'
      X.textAlign = 'center'
      X.textBaseline = 'middle'
      X.fillText(message, 480, 189)
    }

    // Instructions
    rounded(20, 535, 920, 45, 14, 'rgba(20,65,42,0.78)')
    txt('MOVE  ← →  TO STEER     •     CLICK TO JUMP     •     COLLECT BANANAS & RESCUE BABY MONKEYS', 480, 558, 15)

    // Game over overlay
    if (gameOver) {
      X.fillStyle = 'rgba(12,35,25,0.72)'
      X.fillRect(0, 0, W, H)
      rounded(250, 155, 460, 280, 28, '#fff4d6')
      X.fillStyle = '#315b32'
      X.font = 'bold 42px sans-serif'
      X.textAlign = 'center'
      X.fillText('JUNGLE RUN OVER!', 480, 225)
      X.font = '22px sans-serif'
      X.fillText(`Bananas collected: ${bananas}`, 480, 285)
      X.fillText(`Baby monkeys rescued: ${rescues}`, 480, 325)
      X.fillText('Your round will finish shortly', 480, 375)
    }

    X.restore()
  },

  click(x, y) {
    if (gameOver) return

    // Jump
    if (!player.jumping && player.swing <= 0 && player.y >= groundY - 1) {
      player.jumping = true
      player.vy = -680
      sfx(420, 0.08, 'sine')
    }

    // Swing from vine when close enough
    if (Math.abs(player.x - 510) < 90 && vineCooldown <= 0) {
      player.swing = 0.75
      player.jumping = false
      player.vy = 0
      vineCooldown = 2
      add(25, player.x, player.y - 90)
      burst(player.x, player.y - 90, '#75d66d', 15)
      showMessage('VINE SWING! +25')
      sfx(760, 0.12, 'sine')
    }
  }
}
