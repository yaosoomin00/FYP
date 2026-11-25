
import { useState } from "react";
import { registerPlayer } from "./player";

export default function PlayerSetup({ onPlayerReady }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const player = await registerPlayer(username);
      onPlayerReady(player);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to register player.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="player-setup-overlay">
      <div className="login-layout">

        {/* LEFT SIDE */}
        <section className="login-welcome">
          <div className="login-brand">
            <span>✦</span> MOTRIX<span className="login-brand-dot">.</span>
          </div>

          <div className="login-illustration">
            <span className="login-star star-one">✦</span>
            <span className="login-star star-two">✧</span>
            <span className="login-star star-three">✦</span>
            <div className="login-game-icons">
              <span>🐠</span>
              <span>🚀</span>
              <span>🎈</span>
              <span>🐒</span>
              <span>💎</span>
              <span>🐉</span>
            </div>
          </div>

          <h1>LET'S PLAY!</h1>
          <p>
            Your adventure starts here.
            Explore colourful games, collect points
            and become a MOTRIX champion!
          </p>

          <div className="login-features">
            <span>🎮 6 FUN GAMES</span>
            <span>⭐ EARN POINTS</span>
            <span>🏆 BE A CHAMPION</span>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="login-form-side">
          <div className="login-card">

          

            <p className="login-kicker">WELCOME KIDDIE!</p>
            <h2>Ready to play?</h2>
            <p className="login-description">
              Enter your player name to enter the MOTRIX game world.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="playerUsername">YOUR PLAYER NAME</label>

              <input
                id="playerUsername"
                type="text"
                placeholder="example: yasmin00"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={16}
                required
                autoComplete="username"
              />

              {error && (
                <div className="login-error">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "ENTERING GAME..." : "LET'S GO!"}
              </button>
            </form>

            <p className="login-note">
              Choose a name with 3–16 characters.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
