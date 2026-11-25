
import {
  X, W, H, M, G,
  add, burst, confetti, ring, glow, star, txt, sfx
} from '../engine/engine'

const rand = (a, b) => a + Math.random() * (b - a)
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

const player = {
  x: 180,
  y: H / 2,
  invincible: 0
}

let gems = []
let enemies = []
let shots = []
let enemyShots = []
let powerups = []

let spawnTimer = 0
let enemyTimer = 0
let powerTimer = 0
let boss = null
let lives = 3
let collected = 0
let defeated = 0
let gameOver = false
let victory = false
let elapsed = 0
let backgroundOffset = 0
let message = 'LET THE ADVENTURE BEGIN!'
let messageTimer = 2
let shieldTime = 0
let magnetTime = 0
let fireCooldown = 0
let shake = 0

const COLOURS = [
  '#55e8ff',
  '#ffdf58',
  '#ff78d0',
  '#9d8cff',
  '#76f59a'
]

function circle(x, y, r, colour) {
  X.fillStyle = colour
  X.beginPath()
  X.arc(x, y, r, 0, Math.PI * 2)
  X.fill()
}

function rounded(x, y, w, h, r, colour) {
  X.fillStyle = colour
  X.beginPath()
  X.roundRect(x, y, w, h, r)
  X.fill()
}

function showMessage(text, duration = 1.3) {
  message = text
  messageTimer = duration
}

function drawDragon(x, y, t) {
  X.save()
  X.translate(x, y)

  const flap = Math.sin(t * 12) * 0.45

  // Tail
  X.strokeStyle = '#8b4bd6'
  X.lineWidth = 13
  X.lineCap = 'round'
  X.beginPath()
  X.moveTo(-27, 8)
  X.quadraticCurveTo(-58, 25, -70, 0)
  X.stroke()

  // Tail tip
  X.fillStyle = '#ffcf5a'
  X.beginPath()
  X.moveTo(-69, 0)
  X.lineTo(-83, -10)
  X.lineTo(-79, 8)
  X.lineTo(-91, 16)
  X.closePath()
  X.fill()

  // Back wing
  X.save()
  X.translate(-5, -17)
  X.rotate(-0.25 + flap)
  X.fillStyle = '#b78cff'
  X.beginPath()
  X.moveTo(0, 0)
  X.quadraticCurveTo(-20, -48, -56, -55)
  X.quadraticCurveTo(-49, -20, -25, 9)
  X.closePath()
  X.fill()

  X.strokeStyle = '#8752c9'
  X.lineWidth = 3
  X.beginPath()
  X.moveTo(0, 0)
  X.lineTo(-45, -43)
  X.moveTo(-10, -4)
  X.lineTo(-42, -18)
  X.stroke()
  X.restore()

  // Body
  circle(0, 0, 29, '#8b50d5')
  circle(5, 8, 19, '#f5b96d')

  // Front wing
  X.save()
  X.translate(0, -15)
  X.rotate(-0.15 - flap)
  X.fillStyle = '#d1aaff'
  X.beginPath()
  X.moveTo(0, 0)
  X.quadraticCurveTo(20, -45, 55, -48)
  X.quadraticCurveTo(49, -12, 23, 13)
  X.closePath()
  X.fill()

  X.strokeStyle = '#9a6ad9'
  X.lineWidth = 3
  X.beginPath()
  X.moveTo(0, 0)
  X.lineTo(44, -38)
  X.moveTo(12, 3)
  X.lineTo(42, -12)
  X.stroke()
  X.restore()

  // Head
  circle(25, -12, 23, '#9d61e6')
  circle(42, -7, 13, '#f5b96d')

  // Horns
  X.fillStyle = '#ffdb70'
  X.beginPath()
  X.moveTo(12, -29)
  X.lineTo(5, -48)
  X.lineTo(24, -34)
  X.fill()

  X.beginPath()
  X.moveTo(32, -31)
  X.lineTo(35, -49)
  X.lineTo(44, -29)
  X.fill()

  // Eye
  circle(33, -17, 5, '#ffffff')
  circle(35, -17, 2.5, '#25203a')

  // Nostril
  circle(51, -7, 2, '#663a99')

  // Feet
  circle(-12, 24, 7, '#7541b8')
  circle(12, 24, 7, '#7541b8')

  // Spikes
  X.fillStyle = '#ffcf5a'
  for (let i = 0; i < 4; i++) {
    X.beginPath()
    X.moveTo(-17 + i * 12, -22)
    X.lineTo(-12 + i * 12, -34)
    X.lineTo(-5 + i * 12, -20)
    X.fill()
  }

  X.restore()
}

function drawGem(gem) {
  X.save()
  X.translate(gem.x, gem.y)
  X.rotate(gem.spin)

  glow(0, 0, 25, '80,220,255', 0.3)

  X.fillStyle = gem.colour
  X.beginPath()
  X.moveTo(0, -gem.r)
  X.lineTo(gem.r, -5)
  X.lineTo(gem.r * 0.65, gem.r)
  X.lineTo(-gem.r * 0.65, gem.r)
  X.lineTo(-gem.r, -5)
  X.closePath()
  X.fill()

  X.fillStyle = 'rgba(255,255,255,0.65)'
  X.beginPath()
  X.moveTo(0, -gem.r + 5)
  X.lineTo(7, -4)
  X.lineTo(-5, 3)
  X.closePath()
  X.fill()

  X.restore()
}

function drawEnemy(enemy) {
  X.save()
  X.translate(enemy.x, enemy.y)

  if (enemy.type === 'bat') {
    const flap = Math.sin(enemy.phase * 9) * 12

    X.fillStyle = '#55416e'
    X.beginPath()
    X.moveTo(-10, 0)
    X.lineTo(-35, -flap)
    X.lineTo(-29, 13)
    X.lineTo(-9, 10)
    X.closePath()
    X.fill()

    X.beginPath()
    X.moveTo(10, 0)
    X.lineTo(35, -flap)
    X.lineTo(29, 13)
    X.lineTo(9, 10)
    X.closePath()
    X.fill()

    circle(0, 0, 15, '#72528f')
    circle(-5, -3, 3, '#ffef78')
    circle(5, -3, 3, '#ffef78')
    circle(-5, -3, 1.5, '#241b32')
    circle(5, -3, 1.5, '#241b32')
  } else {
    // Slime monster
    circle(0, 0, enemy.r, '#4fca83')
    circle(-7, -3, 4, '#ffffff')
    circle(7, -3, 4, '#ffffff')
    circle(-7, -3, 2, '#25384a')
    circle(7, -3, 2, '#25384a')

    X.strokeStyle = '#176d4b'
    X.lineWidth = 2
    X.beginPath()
    X.arc(0, 5, 7, 0.2, Math.PI - 0.2)
    X.stroke()
  }

  X.restore()
}

function drawBoss() {
  if (!boss) return

  X.save()
  X.translate(boss.x, boss.y)

  const pulse = Math.sin(elapsed * 5) * 5

  glow(0, 0, 85, '180,60,255', 0.35)
  circle(0, 0, 57 + pulse * 0.2, '#54316f')
  circle(-24, -12, 13, '#a95ce8')
  circle(24, -12, 13, '#a95ce8')
  circle(-18, -8, 5, '#ffec69')
  circle(18, -8, 5, '#ffec69')

  // Mouth
  X.fillStyle = '#24152f'
  X.beginPath()
  X.ellipse(0, 22, 23, 13, 0, 0, Math.PI * 2)
  X.fill()

  // Horns
  X.fillStyle = '#ffcb62'
  X.beginPath()
  X.moveTo(-35, -42)
  X.lineTo(-58, -78)
  X.lineTo(-12, -48)
  X.fill()

  X.beginPath()
  X.moveTo(35, -42)
  X.lineTo(58, -78)
  X.lineTo(12, -48)
  X.fill()

  X.restore()
}

function spawnGem(hard) {
  gems.push({
    x: W + 35,
    y: rand(95, H - 100),
    r: rand(13, 19),
    colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    speed: rand(hard ? 190 : 135, hard ? 260 : 190),
    spin: 0,
    points: Math.random() < 0.12 ? 30 : 10,
    dead: false
  })
}

function spawnEnemy(hard) {
  const type = Math.random() < (hard ? 0.58 : 0.7) ? 'bat' : 'slime'

  enemies.push({
    type,
    x: W + 55,
    y: rand(100, H - 100),
    r: type === 'bat' ? 19 : 23,
    hp: type === 'slime' ? 2 : 1,
    speed: rand(hard ? 210 : 140, hard ? 290 : 205),
    phase: Math.random() * 6,
    dead: false
  })
}

function spawnPowerup() {
  const type = Math.random() < 0.5 ? 'shield' : 'magnet'

  powerups.push({
    type,
    x: W + 35,
    y: rand(130, H - 130),
    r: 20,
    speed: 150,
    phase: Math.random() * 6,
    dead: false
  })
}

function shoot(x, y) {
  const dx = x - player.x
  const dy = y - player.y
  const length = Math.hypot(dx, dy) || 1

  shots.push({
    x: player.x + 25,
    y: player.y,
    vx: dx / length * 560,
    vy: dy / length * 560,
    r: 9,
    dead: false
  })

  sfx(620, 0.07, 'triangle')
}

function damagePlayer() {
  if (player.invincible > 0) return

  if (shieldTime > 0) {
    burst(player.x, player.y, '#75eaff', 15)
    showMessage('SHIELD BLOCKED IT!')
    return
  }

  lives--
  player.invincible = 1.5
  shake = 0.35

  burst(player.x, player.y, '#ff7b8c', 18)
  sfx(140, 0.2, 'sawtooth')

  showMessage(lives > 0 ? 'WATCH OUT, DRAGON!' : 'OH NO!')

  if (lives <= 0) {
    gameOver = true
  }
}

function drawFloatingIsland(x, y, scale, index, t) {
  X.save()
  X.translate(x, y)
  X.scale(scale, scale)

  glow(0, 8, 110, '119,245,206', 0.12)

  const rock = X.createLinearGradient(0, 0, 0, 100)
  rock.addColorStop(0, '#9d71d6')
  rock.addColorStop(1, '#51468d')
  X.fillStyle = rock
  X.beginPath()
  X.moveTo(-78, -2)
  X.quadraticCurveTo(-91, 13, -57, 34)
  X.lineTo(-24, 56)
  X.lineTo(-7, 86)
  X.quadraticCurveTo(3, 99, 18, 75)
  X.lineTo(57, 38)
  X.quadraticCurveTo(91, 14, 78, -2)
  X.closePath()
  X.fill()

  for (const streamX of [-27, 24]) {
    const water = X.createLinearGradient(streamX, 24, streamX + 10, 112)
    water.addColorStop(0, 'rgba(125,238,255,0.8)')
    water.addColorStop(1, 'rgba(125,238,255,0)')
    X.strokeStyle = water
    X.lineWidth = 8
    X.lineCap = 'round'
    X.beginPath()
    X.moveTo(streamX, 27)
    X.quadraticCurveTo(streamX + Math.sin(t * 2 + index) * 8, 65, streamX + 7, 108)
    X.stroke()
  }

  const grass = X.createLinearGradient(0, -30, 0, 20)
  grass.addColorStop(0, '#a4f09a')
  grass.addColorStop(1, '#43b987')
  X.fillStyle = grass
  X.beginPath()
  X.moveTo(-80, 0)
  X.quadraticCurveTo(-44, -30, -9, -23)
  X.quadraticCurveTo(34, -38, 80, 0)
  X.quadraticCurveTo(37, 17, 0, 12)
  X.quadraticCurveTo(-45, 20, -80, 0)
  X.closePath()
  X.fill()

  X.fillStyle = '#d1ff9d'
  for (let i = -4; i <= 4; i++) {
    const bladeX = i * 15
    X.beginPath()
    X.moveTo(bladeX, 0)
    X.lineTo(bladeX + Math.sin(t * 2 + i) * 4, -10 - (i % 3) * 3)
    X.lineTo(bladeX + 4, 2)
    X.fill()
  }

  if (index % 2 === 0) {
    X.fillStyle = '#8b5a48'
    X.fillRect(-34, -28, 8, 25)
    X.fillStyle = '#69d58a'
    X.beginPath()
    X.arc(-30, -34, 17, 0, Math.PI * 2)
    X.arc(-42, -27, 11, 0, Math.PI * 2)
    X.arc(-19, -26, 11, 0, Math.PI * 2)
    X.fill()
  } else {
    X.fillStyle = '#f6dcff'
    X.fillRect(-13, -47, 26, 34)
    X.fillStyle = '#ffe27a'
    X.beginPath()
    X.moveTo(-18, -46)
    X.lineTo(0, -61)
    X.lineTo(18, -46)
    X.closePath()
    X.fill()
    X.fillStyle = '#8d64bb'
    X.fillRect(-4, -29, 8, 16)
    X.fillRect(-9, -39, 5, 6)
    X.fillRect(4, -39, 5, 6)
  }

  X.restore()
}

function drawBackground(t) {
  const sky = X.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#263d91')
  sky.addColorStop(0.42, '#615cc5')
  sky.addColorStop(0.76, '#b678cc')
  sky.addColorStop(1, '#ffb49e')

  X.fillStyle = sky
  X.fillRect(0, 0, W, H)

  glow(180, 175, 340, '89,234,255', 0.18)
  glow(820, 190, 390, '255,125,208', 0.17)

  X.save()
  X.lineCap = 'round'
  for (let i = 0; i < 3; i++) {
    X.globalAlpha = 0.18
    X.strokeStyle = ['#7df4e1', '#c4a0ff', '#ffb0dd'][i]
    X.lineWidth = 34 - i * 6
    X.beginPath()
    X.moveTo(-80, 195 + i * 43)
    X.bezierCurveTo(
      170, 95 + i * 44 + Math.sin(t * 0.5 + i) * 25,
      510, 270 + i * 24 + Math.cos(t * 0.4 + i) * 22,
      W + 90, 115 + i * 74
    )
    X.stroke()
  }
  X.restore()

  glow(780, 108, 92, '255,231,155', 0.35)
  const moon = X.createRadialGradient(765, 93, 4, 780, 108, 43)
  moon.addColorStop(0, '#fff8d5')
  moon.addColorStop(1, '#ffd67a')
  X.fillStyle = moon
  X.beginPath()
  X.arc(780, 108, 39, 0, Math.PI * 2)
  X.fill()

  X.strokeStyle = 'rgba(255,236,190,0.65)'
  X.lineWidth = 3
  X.beginPath()
  X.ellipse(780, 108, 67, 15, -0.22, 0, Math.PI * 2)
  X.stroke()

  for (let i = 0; i < 48; i++) {
    const x = ((i * 137 - backgroundOffset * 0.08) % W + W) % W
    const y = (i * 71) % 390
    const twinkle = 1 + (Math.sin(t * 3 + i) + 1) * 1.1
    circle(x, y, twinkle, i % 4 === 0 ? '#fff1aa' : '#f8f2ff')

    if (i % 12 === 0) {
      star(x, y, 5 + twinkle, t + i)
      X.fillStyle = 'rgba(255,245,205,0.8)'
      X.fill()
    }
  }

  X.fillStyle = 'rgba(245,224,255,0.16)'
  for (let i = 0; i < 4; i++) {
    const x = i * 300 + Math.sin(t * 0.25 + i) * 15 - 60
    const y = 327 + i % 2 * 26
    X.beginPath()
    X.ellipse(x, y, 105, 19, 0, 0, Math.PI * 2)
    X.fill()
  }

  for (let i = 0; i < 4; i++) {
    const span = W + 220
    const x = ((i * 285 - backgroundOffset * 0.22) % span + span) % span - 110
    const y = 418 + Math.sin(i * 2 + t * 0.45) * 12
    const scale = 0.66 + (i % 3) * 0.08
    drawFloatingIsland(x, y, scale, i, t)
  }

  for (let i = 0; i < 12; i++) {
    const x = (i * 83 + Math.sin(t * 0.8 + i) * 20 + W) % W
    const y = (i * 47 + t * 13) % 370
    const size = 8 + (i % 3) * 3

    glow(x, y, size * 2, '255,230,151', 0.24)
    star(x, y, size, t + i)
    X.fillStyle = '#fff2a8'
    X.fill()
  }
}

export default {
  goal: 250,
  trail: '#b58aff',
  pname: '🐉 DRAGON MAGIC',
  hint: 'Move to fly • Click to shoot magic fireballs!',

  init() {
    gems = []
    enemies = []
    shots = []
    enemyShots = []
    powerups = []

    player.x = 180
    player.y = H / 2
    player.invincible = 0

    spawnTimer = 0.5
    enemyTimer = 1.4
    powerTimer = 7
    boss = null

    lives = G.diff === 'fast' ? 2 : G.diff === 'slow' ? 5 : 3
    collected = 0
    defeated = 0
    gameOver = false
    victory = false
    elapsed = 0
    backgroundOffset = 0
    message = 'LET THE ADVENTURE BEGIN!'
    messageTimer = 2
    shieldTime = 0
    magnetTime = 0
    fireCooldown = 0
    shake = 0

    G.score = 0
  },

  update(dt) {
    if (gameOver || victory) return

    elapsed += dt

    const hard = G.diff === 'fast'
    const easy = G.diff === 'slow'

    const speed = hard ? 1.28 : easy ? 0.82 : 1

    backgroundOffset += dt * 110 * speed

    shieldTime = Math.max(0, shieldTime - dt)
    magnetTime = Math.max(0, magnetTime - dt)
    player.invincible = Math.max(0, player.invincible - dt)
    fireCooldown = Math.max(0, fireCooldown - dt)
    messageTimer = Math.max(0, messageTimer - dt)
    shake = Math.max(0, shake - dt)

    // Move dragon using the controller pointer.
    const targetX = clamp(M.sx, 65, W - 100)
    const targetY = clamp(M.sy, 100, H - 90)

    player.x += (targetX - player.x) * Math.min(1, dt * 7)
    player.y += (targetY - player.y) * Math.min(1, dt * 7)

    // Spawn gems.
    spawnTimer -= dt

    if (spawnTimer <= 0) {
      spawnGem(hard)
      spawnTimer = rand(hard ? 0.55 : 0.8, hard ? 0.85 : 1.2) / speed
    }

    // Spawn enemies.
    enemyTimer -= dt

    if (enemyTimer <= 0) {
      spawnEnemy(hard)
      enemyTimer = rand(hard ? 0.8 : 1.5, hard ? 1.2 : 2.2) / speed
    }

    // Spawn power-ups.
    powerTimer -= dt

    if (powerTimer <= 0) {
      spawnPowerup()
      powerTimer = rand(10, 14)
    }

    // Boss appears after 35 seconds.
    if (elapsed >= 35 && !boss && !victory) {
      boss = {
        x: W + 100,
        y: H / 2,
        hp: hard ? 18 : easy ? 10 : 14,
        maxHp: hard ? 18 : easy ? 10 : 14,
        fireTimer: 1.5,
        phase: 0
      }

      showMessage('WARNING! BOSS APPROACHING!', 2.5)
      sfx(180, 0.4, 'sawtooth')
    }

    // Move boss.
    if (boss) {
      boss.phase += dt
      boss.x += (W - 155 - boss.x) * Math.min(1, dt * 1.5)
      boss.y = H / 2 + Math.sin(boss.phase * 1.7) * 125

      boss.fireTimer -= dt

      if (boss.fireTimer <= 0) {
        const dx = player.x - boss.x
        const dy = player.y - boss.y
        const length = Math.hypot(dx, dy) || 1

        enemyShots.push({
          x: boss.x - 35,
          y: boss.y,
          vx: dx / length * (hard ? 310 : 240),
          vy: dy / length * (hard ? 310 : 240),
          r: 12,
          dead: false
        })

        boss.fireTimer = hard ? 0.85 : 1.35
      }
    }

    // Update gems.
    for (const gem of gems) {
      gem.x -= gem.speed * speed * dt
      gem.spin += dt * 2

      if (magnetTime > 0) {
        const dx = player.x - gem.x
        const dy = player.y - gem.y
        const distance = Math.hypot(dx, dy)

        if (distance < 300 && distance > 1) {
          gem.x += dx / distance * 350 * dt
          gem.y += dy / distance * 350 * dt
        }
      }

      if (Math.hypot(gem.x - player.x, gem.y - player.y) < gem.r + 25) {
        gem.dead = true
        collected++

        add(gem.points, gem.x, gem.y)
        burst(gem.x, gem.y, gem.colour, 12)
        sfx(700, 0.08, 'sine')

        if (collected % 10 === 0) {
          showMessage('GEM MASTER! 10 GEMS!')
          confetti(gem.x, gem.y, 15)
        }
      }
    }

    gems = gems.filter(g => !g.dead && g.x > -50)

    // Update enemies.
    for (const enemy of enemies) {
      enemy.x -= enemy.speed * speed * dt
      enemy.phase += dt

      enemy.y += Math.sin(enemy.phase * 3) * 25 * dt

      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < enemy.r + 24) {
        enemy.dead = true
        damagePlayer()
      }
    }

    enemies = enemies.filter(e => !e.dead && e.x > -60)

    // Update player fireballs.
    for (const shot of shots) {
      shot.x += shot.vx * dt
      shot.y += shot.vy * dt

      for (const enemy of enemies) {
        if (!enemy.dead && Math.hypot(shot.x - enemy.x, shot.y - enemy.y) < enemy.r + shot.r) {
          shot.dead = true
          G.hits++
          enemy.hp--

          burst(shot.x, shot.y, '#ffb95c', 8)

          if (enemy.hp <= 0) {
            enemy.dead = true
            defeated++
            add(20, enemy.x, enemy.y)
            burst(enemy.x, enemy.y, '#b58aff', 18)
            sfx(480, 0.1, 'triangle')
          }

          break
        }
      }

      if (boss && !shot.dead && Math.hypot(shot.x - boss.x, shot.y - boss.y) < 62) {
        shot.dead = true
        G.hits++
        boss.hp--

        burst(shot.x, shot.y, '#ffcf5a', 7)
        sfx(350, 0.04, 'sine')

        if (boss.hp <= 0) {
          add(150, boss.x, boss.y)
          confetti(boss.x, boss.y, 70)
          burst(boss.x, boss.y, '#e5a5ff', 50)
          ring(boss.x, boss.y, 100, '#fff078')

          boss = null
          victory = true
          showMessage('YOU DEFEATED THE SHADOW BOSS!', 10)
          sfx(1100, 0.5, 'triangle')
        }
      }
    }

    shots = shots.filter(s => !s.dead && s.x < W + 50 && s.y > -50 && s.y < H + 50)

    // Update power-ups.
    for (const power of powerups) {
      power.x -= power.speed * speed * dt
      power.phase += dt * 3
      power.y += Math.sin(power.phase) * 15 * dt

      if (Math.hypot(power.x - player.x, power.y - player.y) < 43) {
        power.dead = true

        if (power.type === 'shield') {
          shieldTime = 5
          showMessage('MAGIC SHIELD ACTIVATED!')
          burst(power.x, power.y, '#72eaff', 20)
        } else {
          magnetTime = 6
          showMessage('GEM MAGNET ACTIVATED!')
          burst(power.x, power.y, '#ff82d2', 20)
        }

        confetti(power.x, power.y, 12)
        sfx(900, 0.18, 'triangle')
      }
    }

    powerups = powerups.filter(p => !p.dead && p.x > -50)

    // Boss fireballs.
    for (const shot of enemyShots) {
      shot.x += shot.vx * dt
      shot.y += shot.vy * dt

      if (Math.hypot(shot.x - player.x, shot.y - player.y) < shot.r + 22) {
        shot.dead = true
        damagePlayer()
      }
    }

    enemyShots = enemyShots.filter(s =>
      !s.dead && s.x > -50 && s.x < W + 50 && s.y > -50 && s.y < H + 50
    )

    if (messageTimer > 0) messageTimer -= dt
  },

  click(x, y) {
    if (gameOver || victory) return

    if (fireCooldown > 0) return

    shoot(
      Number.isFinite(x) ? x : W,
      Number.isFinite(y) ? y : player.y
    )

    fireCooldown = G.diff === 'fast' ? 0.28 : 0.2
  },

  bg(t) {
    drawBackground(t)
  },

  draw() {
    X.save()

    if (shake > 0) {
      X.translate(rand(-5, 5), rand(-4, 4))
    }

    // Gems
    for (const gem of gems) drawGem(gem)

    // Power-ups
    for (const power of powerups) {
      glow(power.x, power.y, 35, power.type === 'shield' ? '80,220,255' : '255,100,200', 0.3)
      txt(power.type === 'shield' ? '🛡️' : '🧲', power.x, power.y, 32)
    }

    // Enemies
    for (const enemy of enemies) drawEnemy(enemy)

    // Boss
    drawBoss()

    // Boss health bar
    if (boss) {
      rounded(300, 150, 360, 24, 12, 'rgba(20,10,40,0.8)')
      rounded(305, 155, 350, 14, 8, '#633c76')
      rounded(
        305,
        155,
        350 * Math.max(0, boss.hp / boss.maxHp),
        14,
        8,
        '#ff5d91'
      )

      X.fillStyle = '#fff'
      txt('SHADOW BOSS', 480, 190, 16)
    }

    // Fireballs
    for (const shot of shots) {
      glow(shot.x, shot.y, 22, '255,150,50', 0.4)
      circle(shot.x, shot.y, shot.r, '#ff9e43')
      circle(shot.x - 2, shot.y - 2, 4, '#fff4a5')
    }

    // Enemy fireballs
    for (const shot of enemyShots) {
      glow(shot.x, shot.y, 25, '210,70,255', 0.4)
      circle(shot.x, shot.y, shot.r, '#c65cff')
      circle(shot.x - 3, shot.y - 3, 4, '#ffe5ff')
    }

    // Dragon
    if (player.invincible <= 0 || Math.floor(player.invincible * 12) % 2 === 0) {
      drawDragon(player.x, player.y, elapsed)
    }

    // Shield visual
    if (shieldTime > 0) {
      X.strokeStyle = '#75eaff'
      X.lineWidth = 4
      X.beginPath()
      X.arc(player.x, player.y, 48, 0, Math.PI * 2)
      X.stroke()

      glow(player.x, player.y, 55, '80,220,255', 0.15)
    }

    // HUD
    rounded(18, 150, 210, 78, 16, 'rgba(30,18,65,0.78)')
    X.fillStyle = '#fff'
    txt('💎 GEMS', 120, 172, 16)
    txt(String(collected), 120, 204, 25)

    rounded(740, 150, 202, 78, 16, 'rgba(30,18,65,0.78)')
    X.fillStyle = '#fff'
    txt('❤️ LIVES', 840, 172, 16)
    txt(
      '♥ '.repeat(Math.max(0, lives)) +
      '♡ '.repeat(Math.max(0, (G.diff === 'fast' ? 2 : G.diff === 'slow' ? 5 : 3) - lives)),
      840, 204, 23
    )

    rounded(18, 237, 210, 48, 14, 'rgba(30,18,65,0.72)')
    X.fillStyle = '#fff'
    txt(`MONSTERS: ${defeated}`, 123, 261, 16)

    if (shieldTime > 0) {
      txt(`🛡️ SHIELD ${shieldTime.toFixed(1)}s`, W / 2, 220, 16)
    }

    if (magnetTime > 0) {
      txt(`🧲 MAGNET ${magnetTime.toFixed(1)}s`, W / 2, 245, 16)
    }

    // Message
    if (messageTimer > 0 && !victory && !gameOver) {
      rounded(270, 286, 420, 48, 15, 'rgba(255,255,255,0.9)')
      X.fillStyle = '#4c3474'
      X.font = 'bold 19px sans-serif'
      X.textAlign = 'center'
      X.textBaseline = 'middle'
      X.fillText(message, W / 2, 310)
    }

    // Instructions
    rounded(160, H - 49, 640, 35, 13, 'rgba(30,18,65,0.78)')
    X.fillStyle = '#fff'
    txt('MOVE TO FLY  •  CLICK TO SHOOT  •  COLLECT GEMS!', W / 2, H - 31, 15)

    // Game over / victory overlay
    if (gameOver || victory) {
      X.fillStyle = 'rgba(15,8,40,0.78)'
      X.fillRect(0, 0, W, H)

      rounded(230, 145, 500, 310, 28, '#fff3d8')

      X.fillStyle = '#49316e'
      X.font = 'bold 39px sans-serif'
      X.textAlign = 'center'
      X.textBaseline = 'middle'
      X.fillText(victory ? 'DRAGON HERO!' : 'TRY AGAIN, DRAGON!', W / 2, 215)

      X.font = '23px sans-serif'
      X.fillText(`Gems collected: ${collected}`, W / 2, 285)
      X.fillText(`Monsters defeated: ${defeated}`, W / 2, 325)

      X.font = '18px sans-serif'
      X.fillText(
        victory ? 'You saved the magical kingdom!' : 'The kingdom is waiting for you!',
        W / 2,
        380
      )

      if (victory) {
        star(480, 420, 18, elapsed)
        X.fillStyle = '#ffcb62'
        X.fill()
        X.strokeStyle = '#ed9b37'
        X.lineWidth = 2
        X.stroke()
      }
    }

    X.restore()
  }
}
