
import { useEffect, useRef, useState } from 'react'

import {
  attach,
  startGame,
  stopGame,
  downloadCsv,
  toggleMute,
  getBest,
  W,
  H
} from './engine/engine'

import {
  logoutPlayer,
  savePlayerScore
} from './player'

import PlayerSetup from './PlayerSetup'

import fish from './games/fish'
import space from './games/space'
import color from './games/color'
import jungle from './games/jungle'
import treasure from './games/treasure'
import dragon from './games/dragon'

import './App.css'

// ==========================================
// GAME LIST
// ==========================================

const GAMES = [
  {
    id: 'fish',
    cls: 'ocean',
    icon: '🐠',
    name: 'Hungry Fish',
    tag: 'OCEAN QUEST',
    desc: 'Swim through a magical ocean, collect glowing treats and discover pearls.',
    tip: 'Click or tap to create bubble blasts!',
    game: fish
  },
  {
    id: 'space',
    cls: 'cosmic',
    icon: '🚀',
    name: 'Space Mission',
    tag: 'SPACE ADVENTURE',
    desc: 'Explore the galaxy, collect stars and dodge the asteroids.',
    tip: 'Click or tap to fire lasers!',
    game: space
  },
  {
    id: 'color',
    cls: 'rainbow',
    icon: '🎈',
    name: 'Colour Pop',
    tag: 'COLOUR PLAY',
    desc: 'Pop colourful bubbles and explore a world of bright colours.',
    tip: 'Click or tap to pop bubbles!',
    game: color
  },
  {
    id: 'jungle',
    cls: 'jungle',
    icon: '🐵',
    name: 'Monkey Mayhem',
    tag: 'JUNGLE ADVENTURE',
    desc: 'Run, jump, collect bananas and rescue baby monkeys!',
    tip: 'Move to steer • Click to jump • Avoid logs and bugs!',
    game: jungle
  },
  {
    id: 'treasure',
    cls: 'treasure',
    icon: '💎',
    name: 'Treasure Catcher',
    tag: 'TREASURE HUNT',
    desc: 'Collect magical gems and golden coins. Watch out for the bombs!',
    tip: 'Move left and right to collect treasures. Click to activate your shield!',
    game: treasure
  },
  {
    id: 'dragon',
    cls: 'dragon',
    icon: '🐉',
    name: 'Dragon Quest',
    tag: 'DRAGON MAGIC',
    desc: 'Fly through a magical kingdom, collect gems and battle the shadow boss.',
    tip: 'Move to fly • Click to shoot magic fireballs!',
    game: dragon
  }
]

// ==========================================
// DIFFICULTY
// ==========================================

const LEVELS = [
  { id: 'slow', icon: '🐢', name: 'Easy', desc: 'Beginner' },
  { id: 'medium', icon: '🐰', name: 'Normal', desc: 'Standard' },
  { id: 'fast', icon: '🐆', name: 'Hard', desc: 'Challenge' }
]

// ==========================================
// RESULT TITLES
// ==========================================

const TITLES = [
  'Keep Trying!',
  'Good Job!',
  'Amazing!',
  'Incredible!'
]

// ==========================================
// MAIN APP
// ==========================================

export default function App() {
  const canvasRef = useRef(null)

  // APP STATES
  const [screen, setScreen] = useState('menu')
  const [difficulty, setDifficulty] = useState('medium')
  const [current, setCurrent] = useState(GAMES[0])

  // PLAYER
  const [player, setPlayer] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  // GAME ENGINE REFS
  const playerRef = useRef(null)
  const currentGameRef = useRef(GAMES[0])
  const difficultyRef = useRef('medium')

  // Prevent duplicate saves for one game completion
  const scoreSavedRef = useRef(false)

  // Keep refs updated
  playerRef.current = player
  currentGameRef.current = current
  difficultyRef.current = difficulty

  // GAME HUD
  const [hud, setHud] = useState({
    score: 0,
    time: 0
  })

  const [result, setResult] = useState(null)
  const [muted, setMuted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // ==========================================
  // LOAD FONTS
  // ==========================================

  useEffect(() => {
    if (document.fonts) {
      Promise.all([
        document.fonts.load('40px troika'),
        document.fonts.load('40px Caroni')
      ]).catch(() => {})
    }
  }, [])

  // ==========================================
  // ATTACH GAME ENGINE
  // ==========================================

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      console.error('MOTRIX: Canvas element not found.')
      return
    }

    const cleanup = attach(canvas, {
      onHud: (score, time) => {
        setHud({ score, time })
      },

      onEnd: async (gameResult) => {
        // Ignore duplicate completion callbacks
        if (scoreSavedRef.current) return

        scoreSavedRef.current = true

        console.log('Game completed:', gameResult)

        // Show result screen immediately
        setResult(gameResult)
        setScreen('end')

        // Get the current player and game
        const activePlayer = playerRef.current
        const activeGame = currentGameRef.current
        const activeDifficulty = difficultyRef.current

        // Save score to Firebase
        if (!activePlayer) {
          console.warn('No logged-in player. Score not saved.')
          return
        }

        try {
          const documentID = await savePlayerScore(
            activePlayer,
            activeGame,
            activeDifficulty,
            gameResult
          )

          console.log(
            'Score saved successfully. Document ID:',
            documentID
          )
        } catch (error) {
          console.error('FIREBASE SCORE SAVE FAILED:', error)
          alert(
            'Your game finished, but the score could not be saved. Please check your internet connection and Firebase settings.'
          )
        }
      }
    })

    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [])

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out?'
    )

    if (!confirmed) return

    try {
      setLoggingOut(true)

      stopGame()

      await logoutPlayer()

      setPlayer(null)
      playerRef.current = null

      setResult(null)
      setHud({ score: 0, time: 0 })
      setShowHelp(false)

      scoreSavedRef.current = false

      setScreen('menu')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Unable to log out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  // ==========================================
  // ESC KEY
  // ==========================================

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape' && screen === 'play') {
        quitGame()
      }
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [screen])

  // ==========================================
  // START GAME
  // ==========================================

  const playGame = (game) => {
    if (!playerRef.current) {
      alert('Please log in before playing.')
      return
    }

    // Allow the next completed game to be saved
    scoreSavedRef.current = false

    setCurrent(game)
    currentGameRef.current = game

    setHud({
      score: 0,
      time: 0
    })

    setResult(null)
    setScreen('play')

    startGame(
      game.id,
      game.game,
      difficulty
    )
  }

  // ==========================================
  // RETURN TO MENU
  // ==========================================

  const quitGame = () => {
    stopGame()
    scoreSavedRef.current = false
    setScreen('menu')
  }

  const bestScores = getBest()

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className={`app-shell ${screen}`}>

      {/* ALWAYS MOUNTED GAME CANVAS */}

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        aria-label="MOTRIX game area"
      />

      {/* PLAYER SETUP */}

      {!player && (
  <PlayerSetup
    onPlayerReady={(newPlayer) => {
      if (!newPlayer || !newPlayer.uid) {
        console.error('Invalid player information.')
        return
      }

      setPlayer(newPlayer)
      playerRef.current = newPlayer
      setScreen('menu')
    }}
  />
)}

      {/* MENU SCREEN */}

      {screen === 'menu' && player && (
        <section className="screen menu-screen">

          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />

          <header className="topbar">

            <div className="brand">
              <span className="brand-mark">✦</span>
              MOTRIX<span className="brand-dot">.</span>
            </div>

            <div className="topbar-right">
              <span className="online-dot" />
              <span>PLAY • LEARN • EXPLORE</span>

              <span className="player-name">
                👤 {player.username || 'Player'}
              </span>

              <button
                className="logout-btn"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'LOGGING OUT...' : '↪ LOG OUT'}
              </button>
            </div>
          </header>

          <div className="menu-content">

            <div className="hero-copy">
              <div className="eyebrow">
                ✦ THE HAPPIEST PLACE TO PLAY ✦
              </div>

              <h1>LET’S PLAY!</h1>

              <p>
                Pick a game, try something new, and
                <strong> have a little adventure.</strong>
              </p>

              <div className="hero-stickers">
                <span>🌈</span>
                <span>⭐</span>
                <span>🪄</span>
                <span>🫧</span>
              </div>
            </div>

            {/* DIFFICULTY */}

            <div className="difficulty-panel">
              <div className="section-kicker">
                CHOOSE YOUR LEVEL
              </div>

              <div className="level-options">
                {LEVELS.map((level) => (
                  <button
                    key={level.id}
                    className={`level-btn ${
                      difficulty === level.id ? 'selected' : ''
                    }`}
                    aria-pressed={difficulty === level.id}
                    onClick={() => {
                      setDifficulty(level.id)
                      difficultyRef.current = level.id
                    }}
                  >
                    <span className="level-emoji">
                      {level.icon}
                    </span>

                    <span className="level-label">
                      {level.name}
                    </span>

                    <small>{level.desc}</small>

                    {difficulty === level.id && (
                      <span className="level-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* GAME SECTION */}

            <div className="games-heading">
              <div>
                <div className="section-kicker">
                  PICK YOUR ADVENTURE
                </div>

                <h2>
                  What shall we play? <span>↓</span>
                </h2>
              </div>

              <div className="games-count">
                {String(GAMES.length).padStart(2, '0')}
                <span>GAMES READY</span>
              </div>
            </div>

            {/* GAME CARDS */}

            <div className="game-grid">
              {GAMES.map((game, index) => (
                <button
                  key={game.id}
                  className={`game-card ${game.cls}`}
                  onClick={() => playGame(game)}
                >
                  <div className="card-topline">
                    <span className="card-category">
                      {game.tag}
                    </span>

                    <span className="card-number">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="game-art">
                    <span className="art-glow" />
                    <span className="game-icon">
                      {game.icon}
                    </span>
                    <span className="art-spark spark-a">✦</span>
                    <span className="art-spark spark-b">✧</span>
                  </div>

                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p>{game.desc}</p>

                    <div className="card-bottom">
                      <span className="play-hint">
                        ▶ PLAY NOW
                      </span>

                      <span className="best-score">
                        🏆 {
                          bestScores[
                            game.id + '_' + difficulty
                          ] || 0
                        }
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* FOOTER */}

            <footer className="menu-footer">
              <span>🕹️ MADE FOR LITTLE EXPLORERS</span>

              <button
                className="help-link"
                onClick={() => setShowHelp(!showHelp)}
              >
                {showHelp ? 'Hide Controls' : 'How to Play?'}
              </button>
            </footer>

            {showHelp && (
              <div className="help-panel">
                <h3>HOW TO PLAY MOTRIX 🎮</h3>
                <p>1. Choose your favourite game.</p>
                <p>2. Select your difficulty level.</p>
                <p>
                  3. Move your mouse, touch the screen
                  or use your compatible MOTRIX motion controller.
                </p>
                <p>
                  4. Collect points and aim for the highest score!
                </p>
              </div>
            )}

          </div>
        </section>
      )}

      {/* PLAY SCREEN */}

      {screen === 'play' && (
        <div className="play-ui">

          <div className="play-topbar">
            <button
              className="ui-btn back-btn"
              onClick={quitGame}
            >
              <span>←</span>
              <span className="back-word">MENU</span>
            </button>

            <div className="playing-title">
              <span>{current.icon}</span>
              <span>{current.name}</span>
            </div>

            <div className="play-stats">
              <div className="stat-chip score-chip">
                <small>SCORE</small>
                <strong>⭐ {hud.score}</strong>
              </div>

              <div className={`stat-chip time-chip ${
                hud.time <= 10 && hud.time > 0 ? 'urgent' : ''
              }`}>
                <small>TIME</small>
                <strong>⏱ {hud.time}s</strong>
              </div>

              <button
                className="ui-btn sound-btn"
                onClick={() => setMuted(toggleMute())}
              >
                {muted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          <div className="play-tip">
            {current.tip}
            <span>•</span>
            Have fun!
          </div>
        </div>
      )}

      {/* RESULT SCREEN */}

      {screen === 'end' && result && (
        <section className="screen result-screen">

          <div className="result-confetti">
            🎉 ✨ ⭐ 🎊 ✨
          </div>

          <div className="result-panel">

            <div className="result-eyebrow">
              ADVENTURE COMPLETE
            </div>

            <h1>
              {TITLES[
                Math.max(0, Math.min(3, result.stars || 0))
              ]}
            </h1>

            <div className="result-stars">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={i <= result.stars ? 'earned' : ''}
                  style={{
                    animationDelay: i * 0.18 + 's'
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            {result.newBest && (
              <div className="new-record">
                🏆 NEW PERSONAL BEST!
              </div>
            )}

            <div className="result-score">
              <small>YOUR SCORE</small>
              <strong>{result.score}</strong>
            </div>

            <div className="result-details">
              <div>
                <span>🔥</span>
                <small>BEST COMBO</small>
                <b>{result.maxCombo}</b>
              </div>

              <div>
                <span>🎯</span>
                <small>ACCURACY</small>
                <b>{result.acc}%</b>
              </div>

              <div>
                <span>⚡</span>
                <small>COLLECTED / MIN</small>
                <b>{result.pm}</b>
              </div>
            </div>

            <div className="result-actions">
              <button
                className="primary-action"
                onClick={() => playGame(current)}
              >
                ↻ PLAY AGAIN
              </button>

              <button
                className="secondary-action"
                onClick={quitGame}
              >
                ⌂ GAME MENU
              </button>

              <button
                className="export-action"
                onClick={downloadCsv}
              >
                ↓ EXPORT RESULTS
              </button>
            </div>

            <p className="encouragement">
              Every try makes you better.
              Keep shining! ✨
            </p>

          </div>
        </section>
      )}

    </main>
  )
}
