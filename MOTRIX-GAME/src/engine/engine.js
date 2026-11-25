
// ==========================================
// MOTRIX - SHARED GAME ENGINE
// Shared engine for the MOTRIX mini-game collection
// ==========================================

export const W = 960
export const H = 600

export let X = null

export const M = {
  sx: W / 2,
  sy: H / 2
}

export const S = {
  slow: { sp: 0.7 },
  medium: { sp: 1 },
  fast: { sp: 1.4 }
}

export const G = {
  score: 0,
  time: 45,
  diff: 'medium',
  combo: 0,
  maxCombo: 0,
  hits: 0,
  clicks: 0,
  shake: 0,
  power: 0
}

// ==========================================
// INTERNAL ENGINE VARIABLES
// ==========================================

let canvas = null
let animationId = null
let currentGame = null
let currentGameId = ''
let onHud = null
let onEnd = null
let lastTime = 0
let elapsed = 0
let gameTime = 45
let muted = false
let audioContext = null
let running = false

const effects = []

// ==========================================
// POINTER INPUT
// ==========================================

function updatePointer(e) {
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()

  M.sx = Math.max(
    0,
    Math.min(W, (e.clientX - rect.left) * W / rect.width)
  )

  M.sy = Math.max(
    0,
    Math.min(H, (e.clientY - rect.top) * H / rect.height)
  )
}

function handlePointerMove(e) {
  updatePointer(e)
}

function handlePointerDown(e) {
  updatePointer(e)

  if (!running || !currentGame) return

  G.clicks++

  currentGame.click?.(M.sx, M.sy)
}

// ==========================================
// ATTACH CANVAS
// ==========================================

export function attach(canvasElement, callbacks = {}) {
  canvas = canvasElement

  if (!canvas) {
    console.error('MOTRIX: Canvas element not found.')
    return () => {}
  }

  X = canvas.getContext('2d')

  if (!X) {
    console.error('MOTRIX: Could not create canvas context.')
    return () => {}
  }

  canvas.width = W
  canvas.height = H

  onHud = callbacks.onHud || null
  onEnd = callbacks.onEnd || null

  canvas.addEventListener('pointermove', handlePointerMove)
  canvas.addEventListener('pointerdown', handlePointerDown)

  return () => {
    stopGame()

    canvas?.removeEventListener('pointermove', handlePointerMove)
    canvas?.removeEventListener('pointerdown', handlePointerDown)

    canvas = null
    X = null
  }
}

// ==========================================
// SCORE SYSTEM
// ==========================================

export function add(points, x, y) {
  G.score = Math.max(0, G.score + points)

  if (points > 0) {
    G.combo++
    G.maxCombo = Math.max(G.maxCombo, G.combo)
  } else if (points < 0) {
    G.combo = 0
  }

  effects.push({
    type: 'score',
    x,
    y,
    value: points > 0 ? `+${points}` : `${points}`,
    color: points > 0 ? '#fff36b' : '#ff6b8a',
    life: 0.9,
    maxLife: 0.9
  })
}

// ==========================================
// COLLISION DETECTION
// ==========================================

export function near(a, b, distance) {
  return Math.hypot(a.x - b.x, a.y - b.y) < distance
}

// ==========================================
// PARTICLE EFFECTS
// ==========================================

export function burst(x, y, color = '#ffffff', amount = 16) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 60 + Math.random() * 220

    effects.push({
      type: 'particle',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: 2 + Math.random() * 5,
      life: 0.5 + Math.random() * 0.6,
      maxLife: 1.1
    })
  }
}

export function confetti(x, y, amount = 30) {
  const colors = [
    '#ff5d8f',
    '#ffd166',
    '#06d6a0',
    '#4cc9f0',
    '#a78bfa',
    '#ffffff'
  ]

  for (let i = 0; i < amount; i++) {
    effects.push({
      type: 'confetti',
      x,
      y,
      vx: (Math.random() - 0.5) * 300,
      vy: -80 - Math.random() * 260,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 6,
      life: 1.5,
      maxLife: 1.5
    })
  }
}

export function ring(x, y, radius, color = '#ffffff') {
  effects.push({
    type: 'ring',
    x,
    y,
    radius,
    color,
    life: 0.45,
    maxLife: 0.45
  })
}

// ==========================================
// GLOW EFFECT
// ==========================================

export function glow(x, y, radius, color, alpha = 0.5) {
  if (!X) return

  const gradient = X.createRadialGradient(
    x, y, 0,
    x, y, radius
  )

  gradient.addColorStop(
    0,
    `rgba(${color},${alpha})`
  )

  gradient.addColorStop(
    1,
    `rgba(${color},0)`
  )

  X.save()
  X.fillStyle = gradient
  X.beginPath()
  X.arc(x, y, radius, 0, Math.PI * 2)
  X.fill()
  X.restore()
}

// ==========================================
// STAR DRAWING
// ==========================================

export function star(x, y, radius, rotation = 0) {
  if (!X) return

  const points = 5
  const innerRadius = radius * 0.45

  X.beginPath()

  for (let i = 0; i < points * 2; i++) {
    const angle = rotation - Math.PI / 2 + i * Math.PI / points

    const r = i % 2 === 0
      ? radius
      : innerRadius

    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r

    if (i === 0) {
      X.moveTo(px, py)
    } else {
      X.lineTo(px, py)
    }
  }

  X.closePath()
}

// ==========================================
// TEXT DRAWING
// ==========================================

export function txt(s, x, y, size, rot = 0) {
  if (!X) return

  X.save()

  X.translate(x, y)
  X.rotate(rot)

  X.font = `${size}px troika, "Trebuchet MS", sans-serif`
  X.textAlign = 'center'
  X.textBaseline = 'middle'

  X.fillText(s, 0, 0)

  X.restore()
}

// ==========================================
// SOUND EFFECTS
// ==========================================

export function toggleMute() {
  muted = !muted
  return muted
}

export function sfx(
  frequency = 440,
  duration = 0.15,
  type = 'sine'
) {
  if (muted) return

  try {
    const AudioCtx =
      window.AudioContext || window.webkitAudioContext

    if (!AudioCtx) return

    if (!audioContext) {
      audioContext = new AudioCtx()
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(
      frequency,
      audioContext.currentTime
    )

    gain.gain.setValueAtTime(
      0.12,
      audioContext.currentTime
    )

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    )

    oscillator.connect(gain)
    gain.connect(audioContext.destination)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + duration)
  } catch (error) {
    console.warn('MOTRIX sound unavailable:', error)
  }
}

// ==========================================
// POWER-UP
// ==========================================

export function givePower(seconds = 6) {
  G.power = Math.max(G.power, seconds)
  sfx(850, 0.2, 'triangle')
}

// ==========================================
// EFFECT ANIMATION
// ==========================================

function updateEffects(dt) {
  for (const e of effects) {
    e.life -= dt

    if (e.type === 'particle' || e.type === 'confetti') {
      e.x += e.vx * dt
      e.y += e.vy * dt
      e.vy += 280 * dt
      e.rotation = (e.rotation || 0) + dt * 5
    }
  }

  for (let i = effects.length - 1; i >= 0; i--) {
    if (effects[i].life <= 0) {
      effects.splice(i, 1)
    }
  }
}

function drawEffects() {
  if (!X) return

  for (const e of effects) {
    const alpha = Math.max(0, e.life / e.maxLife)

    X.save()
    X.globalAlpha = alpha

    if (e.type === 'score') {
      X.font = 'bold 25px troika, sans-serif'
      X.textAlign = 'center'
      X.fillStyle = e.color
      X.shadowColor = e.color
      X.shadowBlur = 12

      X.fillText(
        e.value,
        e.x,
        e.y - (1 - alpha) * 45
      )
    }

    if (e.type === 'particle') {
      X.fillStyle = e.color
      X.beginPath()
      X.arc(e.x, e.y, e.size, 0, Math.PI * 2)
      X.fill()
    }

    if (e.type === 'confetti') {
      X.translate(e.x, e.y)
      X.rotate(e.rotation)

      X.fillStyle = e.color
      X.fillRect(-e.size / 2, -e.size / 2, e.size, e.size * 1.5)
    }

    if (e.type === 'ring') {
      X.strokeStyle = e.color
      X.lineWidth = 4
      X.beginPath()

      X.arc(
        e.x,
        e.y,
        e.radius * (1 - alpha * 0.7),
        0,
        Math.PI * 2
      )

      X.stroke()
    }

    X.restore()
  }

  X.globalAlpha = 1
}

// ==========================================
// BEST SCORES
// ==========================================

function readBestScores() {
  try {
    return JSON.parse(
      localStorage.getItem('motrix-best-scores') || '{}'
    )
  } catch {
    return {}
  }
}

export function getBest() {
  return readBestScores()
}

// ==========================================
// GAME RESULTS
// ==========================================

function finishGame() {
  if (!running) return

  running = false

  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  const score = G.score
  const goal = currentGame?.goal || 30

  const stars = score >= goal * 1.5
    ? 3
    : score >= goal
      ? 2
      : score > 0
        ? 1
        : 0

  const accuracy = G.clicks > 0
    ? Math.min(100, Math.round(G.hits / G.clicks * 100))
    : 0

  const minutes = Math.max(elapsed / 60, 1 / 60)

  const key = `${currentGameId}_${G.diff}`
  const bestScores = readBestScores()
  const oldBest = bestScores[key] || 0

  const newBest = score > oldBest

  if (newBest) {
    bestScores[key] = score

    try {
      localStorage.setItem(
        'motrix-best-scores',
        JSON.stringify(bestScores)
      )
    } catch (error) {
      console.warn('Could not save best score:', error)
    }
  }

  onEnd?.({
    score,
    stars,
    maxCombo: G.maxCombo,
    acc: accuracy,
    pm: Math.round(score / minutes),
    newBest
  })
}

// ==========================================
// START GAME
// ==========================================

export function startGame(id, game, difficulty = 'medium') {
  stopGame()

  if (!X || !canvas) {
    console.error('MOTRIX: Canvas is not attached.')
    return
  }

  currentGameId = id
  currentGame = game

  G.score = 0
  G.time = 45
  G.diff = S[difficulty] ? difficulty : 'medium'
  G.combo = 0
  G.maxCombo = 0
  G.hits = 0
  G.clicks = 0
  G.shake = 0
  G.power = 0

  M.sx = W / 2
  M.sy = H / 2

  effects.length = 0

  elapsed = 0
  gameTime = 45
  lastTime = 0

  currentGame.init?.()

  running = true

  animationId = requestAnimationFrame(gameLoop)
}

// ==========================================
// MAIN GAME LOOP
// ==========================================

function gameLoop(timestamp) {
  if (!running || !X || !currentGame) return

  if (!lastTime) lastTime = timestamp

  const dt = Math.min(
    (timestamp - lastTime) / 1000,
    0.04
  )

  lastTime = timestamp

  elapsed += dt
  gameTime = Math.max(0, gameTime - dt)

  G.time = Math.ceil(gameTime)
  G.power = Math.max(0, G.power - dt)
  G.shake = Math.max(0, G.shake - dt)

  currentGame.update?.(dt)

  X.save()

  if (G.shake > 0) {
    const amount = G.shake * 12

    X.translate(
      (Math.random() - 0.5) * amount,
      (Math.random() - 0.5) * amount
    )
  }

  X.clearRect(0, 0, W, H)

  currentGame.bg?.(elapsed)
  currentGame.draw?.()

  updateEffects(dt)
  drawEffects()

  X.restore()

  if (elapsed % 0.1 < dt) {
    onHud?.(G.score, G.time)
  }

  if (gameTime <= 0) {
    onHud?.(G.score, 0)
    finishGame()
    return
  }

  animationId = requestAnimationFrame(gameLoop)
}

// ==========================================
// STOP GAME
// ==========================================

export function stopGame() {
  running = false

  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  currentGame = null
  effects.length = 0
}

// ==========================================
// EXPORT RESULTS AS CSV
// ==========================================

export function downloadCsv() {
  const data = readBestScores()

  const rows = [
    ['Game Difficulty', 'Best Score'],
    ...Object.entries(data)
  ]

  const csv = rows
    .map(row => row.map(value =>
      `"${String(value).replace(/"/g, '""')}"`
    ).join(','))
    .join('\n')

  const blob = new Blob(
    [csv],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'motrix-results.csv'
  link.click()

  URL.revokeObjectURL(url)
}
