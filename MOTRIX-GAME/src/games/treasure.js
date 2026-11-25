
import {
  X, W, H, M, S, G,
  add, burst, confetti, ring, glow, star, txt, sfx, givePower
} from '../engine/engine'

const ITEMS = [
  { type: 'gem', icon: '💎', points: 5, color: '#65eaff' },
  { type: 'coin', icon: '🪙', points: 2, color: '#ffd34e' },
  { type: 'star', icon: '⭐', points: 10, color: '#fff078' },
  { type: 'magnet', icon: '🧲', points: 0, color: '#ff75bd' },
  { type: 'bomb', icon: '💣', points: -5, color: '#ff536b' }
]

export default {
  goal: 60,
  trail: '#ffd34e',
  pname: '💎 TREASURE CATCHER',
  hint: 'Move your basket to catch treasure. Avoid bombs!',

  init() {
    this.items = []
    this.spawnTimer = 0
    this.time = 0
    this.lives = 3
    this.basketX = W / 2
    this.basketY = H - 72
    this.magnetTime = 0
    this.shieldTime = 0
    this.flash = 0
    this.message = 'CATCH THE TREASURE!'
    this.messageTime = 2
    this.caught = 0
  },

  update(dt) {
    const speed = S[G.diff].sp

    this.time += dt
    this.spawnTimer -= dt
    this.magnetTime = Math.max(0, this.magnetTime - dt)
    this.shieldTime = Math.max(0, this.shieldTime - dt)
    this.flash = Math.max(0, this.flash - dt)
    this.messageTime = Math.max(0, this.messageTime - dt)

    // Follow the player's horizontal movement
    this.basketX += (M.sx - this.basketX) * Math.min(1, dt * 12)

    this.basketX = Math.max(
      55,
      Math.min(W - 55, this.basketX)
    )

    // Spawn falling treasure
    if (this.spawnTimer <= 0) {
      this.spawnTimer = (0.8 + Math.random() * 0.45) / speed

      const roll = Math.random()
      let item

      if (roll < 0.48) {
        item = ITEMS[0]
      } else if (roll < 0.76) {
        item = ITEMS[1]
      } else if (roll < 0.87) {
        item = ITEMS[2]
      } else if (roll < 0.93) {
        item = ITEMS[3]
      } else {
        item = ITEMS[4]
      }

      this.items.push({
        ...item,
        x: 35 + Math.random() * (W - 70),
        y: -35,
        r: item.type === 'bomb' ? 23 : 21,
        vy: (145 + Math.random() * 100) * speed,
        rotation: Math.random() * 6,
        phase: Math.random() * 6,
        dead: false
      })
    }

    // Update falling objects
    for (const item of this.items) {
      item.phase += dt * 4
      item.rotation += dt * 1.5

      // Magnet pulls valuable objects towards the basket
      if (
        this.magnetTime > 0 &&
        item.type !== 'bomb' &&
        Math.hypot(item.x - this.basketX, item.y - this.basketY) < 270
      ) {
        const dx = this.basketX - item.x
        const dy = this.basketY - item.y
        const distance = Math.hypot(dx, dy) || 1

        item.x += dx / distance * 330 * dt
        item.y += dy / distance * 330 * dt
      } else {
        item.y += item.vy * dt
        item.x += Math.sin(item.phase) * 22 * dt
      }

      const closeX = Math.abs(item.x - this.basketX) < 48
      const closeY = Math.abs(item.y - this.basketY) < 35

      if (closeX && closeY && !item.dead) {
        item.dead = true

        if (item.type === 'bomb') {
          if (this.shieldTime > 0) {
            burst(item.x, item.y, '#6cf5ff', 25)
            sfx(900, 0.15, 'triangle')
            this.message = 'SHIELD SAVED YOU!'
          } else {
            this.lives--
            G.shake = 0.35
            this.flash = 0.25
            burst(item.x, item.y, '#ff536b', 22)
            add(-5, item.x, item.y)
            sfx(120, 0.3, 'sawtooth')
            this.message = this.lives > 0
              ? 'OH NO! WATCH OUT!'
              : 'OOPS! KEEP GOING!'
          }

          this.messageTime = 1.2
        } else if (item.type === 'magnet') {
          this.magnetTime = 7
          this.caught++
          G.hits++
          givePower(7)
          burst(item.x, item.y, '#ff75bd', 25)
          confetti(item.x, item.y, 12)
          this.message = 'MAGNET POWER!'
          this.messageTime = 1.3
        } else {
          this.caught++
          G.hits++

          add(item.points, item.x, item.y)
          burst(item.x, item.y, item.color, 15)

          if (item.type === 'star') {
            confetti(item.x, item.y, 24)
            sfx(1100, 0.25, 'triangle')
            this.message = 'SUPER STAR!'
            this.messageTime = 1.1
          } else {
            sfx(item.type === 'gem' ? 800 : 600, 0.12)
          }
        }
      }
    }

    this.items = this.items.filter(
      item => !item.dead && item.y < H + 45
    )

    if (this.lives <= 0 && this.messageTime <= 0) {
      this.message = 'KEEP TRYING, TREASURE HUNTER!'
      this.messageTime = 2
      // The round continues until the normal game timer ends.
      // This keeps the existing shared engine result flow intact.
    }
  },

  click(x, y) {
    // Click to activate a temporary treasure shield
    this.shieldTime = 2.5
    ring(x, y, 85, '#8cf5ff')
    burst(x, y, '#8cf5ff', 12)
    sfx(750, 0.15, 'triangle')

    this.message = 'MAGIC SHIELD!'
    this.messageTime = 1
  },

  bg(t) {
    const gradient = X.createLinearGradient(0, 0, 0, H)
    gradient.addColorStop(0, '#10245d')
    gradient.addColorStop(0.55, '#174b87')
    gradient.addColorStop(1, '#071b45')

    X.fillStyle = gradient
    X.fillRect(0, 0, W, H)

    // Magical underwater lights
    for (let i = 0; i < 8; i++) {
      const x = i * 140 + Math.sin(t * 0.6 + i) * 25

      X.fillStyle = 'rgba(80,210,255,.07)'
      X.beginPath()
      X.moveTo(x, 0)
      X.lineTo(x + 35, 0)
      X.lineTo(x + 160, H)
      X.lineTo(x + 110, H)
      X.fill()
    }

    // Floating bubbles
    for (let i = 0; i < 22; i++) {
      const x = (i * 83 + Math.sin(t + i) * 18) % W
      const y = H - ((t * 25 + i * 47) % H)

      X.strokeStyle = 'rgba(180,240,255,.35)'
      X.lineWidth = 2
      X.beginPath()
      X.arc(x, y, 4 + i % 5, 0, Math.PI * 2)
      X.stroke()
    }

    // Ocean floor
    X.fillStyle = '#174b51'
    X.fillRect(0, H - 17, W, 17)
  },

  draw() {
    // Game heading
    txt('TREASURE CATCHER', W / 2, 32, 29)
    txt('CATCH GEMS • AVOID BOMBS!', W / 2, 65, 15)

    // Lives
    txt('LIVES', 90, 108, 15)

    for (let i = 0; i < 3; i++) {
      txt(
        i < this.lives ? '❤️' : '🖤',
        155 + i * 37,
        108,
        24
      )
    }

    // Score
    txt(`SCORE: ${G.score}`, W - 115, 108, 18)

    // Falling objects
    for (const item of this.items) {
      X.save()
      X.translate(
        item.x,
        item.y + Math.sin(item.phase) * 4
      )
      X.rotate(item.rotation * 0.15)

      glow(
        0,
        0,
        item.r * 2,
        item.type === 'bomb' ? '255,70,90' : '100,210,255',
        0.35
      )

      txt(item.icon, 0, 0, item.type === 'bomb' ? 38 : 34)

      X.restore()
    }

    // Magnet radius
    if (this.magnetTime > 0) {
      X.save()
      X.strokeStyle = 'rgba(255,117,189,.55)'
      X.lineWidth = 3
      X.setLineDash([9, 8])
      X.beginPath()
      X.arc(this.basketX, this.basketY, 265, 0, Math.PI * 2)
      X.stroke()
      X.setLineDash([])
      X.restore()

      txt('🧲', this.basketX + 43, this.basketY - 38, 25)
    }

    // Basket shield
    if (this.shieldTime > 0) {
      X.strokeStyle = '#8cf5ff'
      X.lineWidth = 5
      X.shadowColor = '#8cf5ff'
      X.shadowBlur = 20
      X.beginPath()
      X.arc(this.basketX, this.basketY, 55, Math.PI, 0)
      X.stroke()
      X.shadowBlur = 0
    }

    // Draw treasure basket
    X.save()
    X.translate(this.basketX, this.basketY)

    const basketGradient = X.createLinearGradient(0, -20, 0, 30)
    basketGradient.addColorStop(0, '#ffdc78')
    basketGradient.addColorStop(1, '#c8792c')

    X.fillStyle = basketGradient
    X.strokeStyle = '#fff0ad'
    X.lineWidth = 4

    X.beginPath()
    X.moveTo(-43, -15)
    X.lineTo(-34, 25)
    X.quadraticCurveTo(0, 42, 34, 25)
    X.lineTo(43, -15)
    X.closePath()
    X.fill()
    X.stroke()

    X.strokeStyle = '#fff0ad'
    X.lineWidth = 5
    X.beginPath()
    X.moveTo(-48, -15)
    X.lineTo(48, -15)
    X.stroke()

    // Basket weave
    X.strokeStyle = 'rgba(115,55,20,.55)'
    X.lineWidth = 3

    for (let i = -25; i <= 25; i += 17) {
      X.beginPath()
      X.moveTo(i, -8)
      X.lineTo(i * 0.72, 25)
      X.stroke()
    }

    X.restore()

    // Power-up indicators
    if (this.magnetTime > 0) {
      txt(`MAGNET ${Math.ceil(this.magnetTime)}s`, W / 2, 145, 17)
    }

    if (this.shieldTime > 0) {
      txt(`SHIELD ${this.shieldTime.toFixed(1)}s`, W / 2, 170, 15)
    }

    // Message
    if (this.messageTime > 0) {
      X.save()
      X.globalAlpha = Math.min(1, this.messageTime * 2)
      txt(this.message, W / 2, 555, 22)
      X.restore()
    } else {
      txt('MOVE LEFT & RIGHT TO CATCH TREASURE!', W / 2, 555, 16)
    }

    // Decorative stars
    X.fillStyle = '#ffe66d'
    star(75, 200, 14, this.time)
    X.fill()
    star(W - 75, 300, 12, -this.time)
    X.fill()
  }
}
