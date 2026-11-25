
import { useState } from "react";

export type GameType = "balloon" | "memory" | "shape";

type Props = {
  game: GameType;
  onExit: () => void;
};

const questions = [
  { q: "5 + 3", a: 8, options: [6, 8, 9, 10] },
  { q: "12 - 4", a: 8, options: [6, 7, 8, 9] },
  { q: "3 × 4", a: 12, options: [8, 10, 12, 15] },
  { q: "20 - 7", a: 13, options: [11, 12, 13, 14] },
  { q: "6 + 9", a: 15, options: [13, 14, 15, 16] },
  { q: "5 × 5", a: 25, options: [20, 24, 25, 30] },
  { q: "30 - 12", a: 18, options: [16, 17, 18, 20] },
  { q: "7 × 6", a: 42, options: [36, 40, 42, 49] },
];

const animalPairs = [
  "🦊", "🐼", "🦁", "🐸", "🐰", "🐵",
  "🐰", "🦊", "🐵", "🦁", "🐸", "🐼",
];

const shapeQuestions = [
  { q: "Find the RED TRIANGLE", a: "🔺", o: ["🔵", "🔺", "🟩", "⭐"] },
  { q: "Find the CIRCLE", a: "⚪", o: ["⚪", "🟪", "🔺", "⭐"] },
  { q: "Find the SQUARE", a: "🟦", o: ["⭐", "🔺", "🟦", "⚪"] },
  { q: "Find the STAR", a: "⭐", o: ["🟩", "⚪", "⭐", "🔺"] },
  { q: "Find the GREEN SQUARE", a: "🟩", o: ["🔺", "🟩", "⭐", "⚪"] },
  { q: "Find the PURPLE DIAMOND", a: "💜", o: ["🟦", "🔺", "💜", "⭐"] },
  { q: "Find the YELLOW STAR", a: "🌟", o: ["⚪", "🟩", "🔺", "🌟"] },
  { q: "Find the BLUE CIRCLE", a: "🔵", o: ["🔵", "⭐", "🟪", "🔺"] },
];

const css = `
@keyframes floatBalloon {
  0% { transform: translateY(8px) rotate(-5deg); }
  50% { transform: translateY(-12px) rotate(5deg); }
  100% { transform: translateY(8px) rotate(-5deg); }
}
@keyframes popIn {
  0% { transform: scale(.65); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes sparkle {
  0%,100% { transform: scale(1) rotate(-8deg); }
  50% { transform: scale(1.18) rotate(8deg); }
}
@keyframes shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
`;

const btn = {
  border: "3px solid white",
  borderRadius: 20,
  padding: 15,
  fontSize: 27,
  fontWeight: 900 as const,
  color: "#26334b",
  cursor: "pointer",
  boxShadow: "0 7px 0 rgba(0,0,0,.13)",
  transition: "transform .15s",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 14,
};

function Header({
  title,
  score,
  progress,
  total,
}: {
  title: string;
  score: number;
  progress: number;
  total: number;
}) {
  return (
    <>
      <div style={{ fontSize: 12, letterSpacing: 3, fontWeight: 900, color: "#68758d" }}>
        WONDERLAND ARCADE
      </div>
      <h1 style={{ margin: "8px 0", fontSize: "clamp(23px,4vw,34px)" }}>
        {title}
      </h1>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0 8px", fontWeight: 900 }}>
        <span>⭐ {score} POINTS</span>
        <span>{progress}/{total}</span>
      </div>
      <div style={{ height: 12, borderRadius: 20, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress / total * 100}%`,
          background: "linear-gradient(90deg,#ff82ae,#8e81ff,#55c9d8)",
          transition: "width .3s",
        }} />
      </div>
    </>
  );
}

function Result({
  score,
  onExit,
  title,
}: {
  score: number;
  onExit: () => void;
  title: string;
}) {
  return (
    <div style={{ textAlign: "center", animation: "popIn .4s" }}>
      <div style={{ fontSize: 85, animation: "sparkle 1s infinite" }}>🏆</div>
      <h1 style={{ fontSize: 34 }}>YOU DID IT!</h1>
      <h2>{title}</h2>
      <div style={{
        fontSize: 38,
        fontWeight: 1000,
        background: "linear-gradient(90deg,#ff77a9,#8567ec,#39b9d5)",
        backgroundClip: "text",
        color: "transparent",
      }}>
        {score} POINTS
      </div>
      <div style={{ fontSize: 28, margin: 15 }}>⭐⭐⭐</div>
      <p>You're a WONDERLAND superstar!</p>
      <button style={{ ...btn, background: "#a6f0be", marginTop: 15 }} onClick={onExit}>
        🏡 BACK TO WORLD
      </button>
    </div>
  );
}

function BalloonBlast({ onExit }: { onExit: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("POP THE CORRECT ANSWER!");
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);

  const question = questions[round];

  const answer = (value: number) => {
    if (locked || done) return;
    setLocked(true);

    if (value === question.a) {
      const nextStreak = streak + 1;
      const points = 10 + (nextStreak >= 3 ? 10 : 0);
      setScore((s) => s + points);
      setStreak(nextStreak);
      setFeedback(nextStreak >= 3 ? "🔥 SUPER COMBO! +20" : "🎉 POP! +10 POINTS!");
    } else {
      setHearts((h) => h - 1);
      setStreak(0);
      setFeedback("💗 OOPS! THAT BALLOON WAS WRONG!");
    }

    window.setTimeout(() => {
      if (round === questions.length - 1 || (value !== question.a && hearts <= 1)) {
        setDone(true);
      } else {
        setRound((r) => r + 1);
        setLocked(false);
        setFeedback("READY FOR THE NEXT POP?");
      }
    }, 850);
  };

  if (done) return <Result score={score} onExit={onExit} title="Balloon Blast Champion" />;

  return (
    <>
      <Header title="🎈 BALLOON BLAST" score={score} progress={round} total={8} />
      <div style={{ display: "flex", justifyContent: "space-between", margin: "15px 0", fontWeight: 900 }}>
        <span>❤️ {hearts} LIVES</span>
        <span>🔥 COMBO {streak}</span>
      </div>
      <div style={{ background: "#e7e6ff", borderRadius: 22, padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#777" }}>SOLVE THE MATHS MAGIC</div>
        <div style={{ fontSize: 43, fontWeight: 1000, margin: 12 }}>{question.q} = ?</div>
        <div style={{ color: "#6654bd", fontWeight: 900 }}>{feedback}</div>
      </div>
      <div style={{ ...grid, marginTop: 22 }}>
        {question.options.map((value, i) => (
          <button
            key={value}
            disabled={locked}
            onClick={() => answer(value)}
            style={{
              ...btn,
              minHeight: 112,
              borderRadius: "48% 48% 43% 43%",
              background: ["#ff91b5", "#78d6ff", "#a4eaa7", "#ffd66e"][i],
              animation: `floatBalloon ${1.4 + i * .25}s ease-in-out infinite`,
              opacity: locked ? .6 : 1,
            }}
          >
            🎈<br />{value}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "#7a8191", marginTop: 12 }}>
        Three consecutive correct answers unlock a COMBO BONUS!
      </div>
    </>
  );
}

function MemoryForest({ onExit }: { onExit: () => void }) {
  const [deck] = useState(() =>
    [...animalPairs]
      .map((value, index) => ({ id: index, value }))
      .sort(() => Math.random() - .5)
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("FIND THE SECRET ANIMAL PAIRS!");

  const choose = (id: number) => {
    if (locked || selected.includes(id) || matched.includes(id)) return;

    const next = [...selected, id];
    setSelected(next);

    if (next.length !== 2) return;

    setMoves((m) => m + 1);
    setLocked(true);

    const a = deck.find((c) => c.id === next[0])!;
    const b = deck.find((c) => c.id === next[1])!;

    if (a.value === b.value) {
      const newMatched = [...matched, ...next];
      setMatched(newMatched);
      setScore((s) => s + 25);
      setMessage("✨ MAGIC MATCH! +25 POINTS!");
      setSelected([]);
      setLocked(false);
    } else {
      setMessage("🌳 NOT A MATCH! TRY AGAIN!");
      window.setTimeout(() => {
        setSelected([]);
        setLocked(false);
        setMessage("FIND THE SECRET ANIMAL PAIRS!");
      }, 850);
    }
  };

  if (matched.length === deck.length) {
    return <Result score={score} onExit={onExit} title="Magical Memory Master" />;
  }

  return (
    <>
      <Header title="🌳 MEMORY FOREST" score={score} progress={matched.length / 2} total={6} />
      <div style={{ display: "flex", justifyContent: "space-between", margin: "15px 0", fontWeight: 900 }}>
        <span>🃏 MOVES: {moves}</span>
        <span>🌟 PAIRS: {matched.length / 2}/6</span>
      </div>
      <div style={{ background: "#ddf5e5", borderRadius: 15, padding: 10, textAlign: "center", fontWeight: 900 }}>
        {message}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,minmax(0,1fr))",
        gap: 9,
        marginTop: 18,
      }}>
        {deck.map((card) => {
          const revealed = selected.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => choose(card.id)}
              disabled={matched.includes(card.id)}
              style={{
                ...btn,
                minWidth: 0,
                padding: 5,
                height: 83,
                fontSize: 33,
                background: matched.includes(card.id)
                  ? "#a6edb7"
                  : revealed ? "#ffe8a7" : "#7e9dff",
                animation: revealed ? "popIn .2s" : "none",
              }}
            >
              {revealed ? card.value : "❔"}
            </button>
          );
        })}
      </div>
      <p style={{ textAlign: "center", color: "#777", fontSize: 12 }}>
        Remember where every animal hides!
      </p>
    </>
  );
}

function ShapeQuest({ onExit }: { onExit: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("FIND THE CORRECT SHAPE!");
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);

  const question = shapeQuestions[round];

  const choose = (shape: string) => {
    if (locked || done) return;
    setLocked(true);

    if (shape === question.a) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 15 + (nextStreak >= 3 ? 10 : 0));
      setFeedback(nextStreak >= 3 ? "🌟 SHAPE MASTER COMBO!" : "🎉 PERFECT! +15 POINTS!");
    } else {
      setStreak(0);
      setFeedback("💪 NICE TRY! KEEP EXPLORING!");
    }

    window.setTimeout(() => {
      if (round === shapeQuestions.length - 1) {
        setDone(true);
      } else {
        setRound((r) => r + 1);
        setLocked(false);
        setFeedback("NEXT SHAPE QUEST!");
      }
    }, 850);
  };

  if (done) return <Result score={score} onExit={onExit} title="Shape Quest Hero" />;

  return (
    <>
      <Header title="🔷 SHAPE QUEST" score={score} progress={round} total={8} />
      <div style={{ display: "flex", justifyContent: "space-between", margin: "15px 0", fontWeight: 900 }}>
        <span>🔥 STREAK: {streak}</span>
        <span>🧩 CHALLENGE {round + 1}</span>
      </div>
      <div style={{
        background: "linear-gradient(135deg,#e4ddff,#d8f1ff)",
        padding: 22,
        borderRadius: 22,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#7562ad" }}>
          THE MAGIC SHAPE PORTAL
        </div>
        <h2 style={{ fontSize: 25 }}>{question.q}</h2>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#6654bd" }}>{feedback}</div>
      </div>
      <div style={{ ...grid, marginTop: 22 }}>
        {question.o.map((shape, i) => (
          <button
            key={`${round}-${i}`}
            disabled={locked}
            onClick={() => choose(shape)}
            style={{
              ...btn,
              height: 105,
              fontSize: 48,
              background: ["#ffd8e7", "#d8eaff", "#d8f5d8", "#ffe9a9"][i],
            }}
          >
            {shape}
          </button>
        ))}
      </div>
    </>
  );
}

export function GameOverlay({ game, onExit }: Props) {
  const title =
    game === "balloon"
      ? "🎈 BALLOON BLAST"
      : game === "memory"
        ? "🌳 MEMORY FOREST"
        : "🔷 SHAPE QUEST";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        overflowY: "auto",
        background: "linear-gradient(135deg,#20264eeF,#563f78ef)",
        fontFamily: "Arial,sans-serif",
        color: "#29324a",
      }}
    >
      <style>{css}</style>

      <div style={{
        width: "min(570px,100%)",
        maxHeight: "94vh",
        overflowY: "auto",
        borderRadius: 30,
        padding: "clamp(16px,4vw,28px)",
        background: "linear-gradient(145deg,#fffdf5,#f1f0ff)",
        boxShadow: "0 25px 80px #0006",
        animation: "popIn .35s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, color: "#7c70a5" }}>
            ✨ WONDERLAND
          </div>
          <button
            onClick={onExit}
            aria-label="Exit game"
            style={{
              border: 0,
              background: "#ffe1e8",
              borderRadius: 12,
              padding: "9px 14px",
              fontWeight: 900,
              cursor: "pointer",
              color: "#a34a69",
            }}
          >
            ✕ EXIT
          </button>
        </div>

        {game === "balloon" && <BalloonBlast onExit={onExit} />}
        {game === "memory" && <MemoryForest onExit={onExit} />}
        {game === "shape" && <ShapeQuest onExit={onExit} />}
      </div>
    </div>
  );
}
