
import * as THREE from "three";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Canvas,
  useFrame,
  type ThreeElements,
} from "@react-three/fiber";
import {
  PerspectiveCamera,
  RoundedBox,
  Environment,
  useEnvironment,
  useTexture,
  useAspect,
} from "@react-three/drei";
import {
  Physics,
  useSphere,
  useBox,
  usePlane,
  type BoxProps,
  type PublicApi,
  type Triplet,
} from "@react-three/cannon";

import crossImg from "./cross.jpg";
import bgImg from "./bg.jpg";

// ==========================================
// GAME SETTINGS
// ==========================================

const STAR_TARGET = 5;

const STAR_POSITIONS: Triplet[] = [
  [-4, 3, 0],
  [4, 9, 0],
  [-4, 15, 0],
  [4, 21, 0],
  [0, 27, 0],
];

const CANDY_COLORS = [
  "#FF8FAB",
  "#8BD3DD",
  "#B8E0A5",
  "#C9A7EB",
  "#FFD166",
];

// ==========================================
// BALL AND COLLISIONS
// ==========================================

function BallAndCollisions({
  args = [1.2, 32, 32],
  v = new THREE.Vector3(),
  ballPosition,
}: {
  args?: ThreeElements["sphereGeometry"]["args"];
  v?: THREE.Vector3;
  ballPosition: { current: THREE.Vector3 };
}) {
  const cam = useRef<THREE.PerspectiveCamera>(null!);

  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    args: [1.2],
    mass: 1,
    material: { restitution: 0.95 },
  }));

  // Bottom boundary
  usePlane(() => ({
    position: [0, -15, 0],
    rotation: [-Math.PI / 2, 0, 0],
    onCollide: () => {
      api.position.set(0, 0, 0);
      api.velocity.set(0, 0, 0);
    },
  }));

  // Left boundary
  usePlane(() => ({
    position: [-15, 0, 0],
    rotation: [-Math.PI / 2, Math.PI / 2, 0],
  }));

  // Right boundary
  usePlane(() => ({
    position: [15, 0, 0],
    rotation: [Math.PI / 2, -Math.PI / 2, 0],
  }));

  // Follow the ball with the camera
  useEffect(
    () =>
      api.position.subscribe((p) => {
        ballPosition.current.set(p[0], p[1], p[2]);

        cam.current.position.lerp(
          v.set(
            p[0],
            p[1],
            18 + Math.max(0, p[1]) / 2
          ),
          0.05
        );

        cam.current.lookAt(0, 0, 0);
      }),
    [api, ballPosition, v]
  );

  return (
    <>
      <PerspectiveCamera
        ref={cam}
        makeDefault
        position={[0, 0, 12]}
        fov={50}
      />

      <mesh ref={ref}>
        <sphereGeometry args={args} />

        <meshPhysicalMaterial
          map={useTexture(crossImg)}
          transmission={1}
          roughness={0}
          thickness={10}
          envMap={useEnvironment({ preset: "warehouse" })}
          envMapIntensity={1}
        />
      </mesh>
    </>
  );
}

// ==========================================
// CANDY BLOCK COMPONENT
// ==========================================

type BlockProps = {
  shake?: number;
  args?: Triplet;
  vec?: THREE.Vector3;
  color?: string;
  points?: number;
  onScore?: (points: number) => void;
} & BoxProps;

const Block = forwardRef<PublicApi, BlockProps>(
  (
    {
      shake = 0,
      args = [1, 1.5, 4],
      vec = new THREE.Vector3(),
      color = "#FF8FAB",
      points = 0,
      onScore,
      ...props
    },
    ref
  ) => {
    const group = useRef<THREE.Group>(null!);
    const lastHit = useRef(0);

    const [block, api] = useBox<THREE.Mesh>(() => ({
      args,
      ...props,

      onCollide: (e) => {
        shake = Math.min(
          1,
          shake + Math.abs(e.contact.impactVelocity) / 12.5
        );

        // Prevent repeated scoring from continuous contact
        const now = Date.now();

        if (points > 0 && now - lastHit.current > 600) {
          lastHit.current = now;
          onScore?.(points);
        }
      },
    }));

    useFrame(() => {
      group.current.position.lerp(
        vec.set(
          0,
          (shake = THREE.MathUtils.lerp(shake, 0, 0.1)),
          0
        ),
        0.2
      );
    });

    useImperativeHandle(ref, () => api, [api]);

    return (
      <group ref={group}>
        <RoundedBox
          ref={block}
          args={args}
          radius={0.4}
          smoothness={10}
        >
          <meshPhysicalMaterial
            color={color}
            transmission={0.35}
            roughness={0.15}
            thickness={2}
            metalness={0.05}
          />
        </RoundedBox>
      </group>
    );
  }
);

// ==========================================
// ORIGINAL MOUSE-CONTROLLED PADDLE
// ==========================================

function Paddle({ args = [5, 1.5, 4] }: { args?: Triplet }) {
  const api = useRef<PublicApi>(null!);

  useFrame((state) => {
    api.current.position.set(state.mouse.x * 10, -5, 0);

    api.current.rotation.set(
      0,
      0,
      (state.mouse.x * Math.PI) / 4
    );
  });

  return (
    <Block
      ref={api}
      args={args}
      color="#FF9EBB"
      material={{ restitution: 1.3 }}
    />
  );
}

// ==========================================
// MOVING CANDY BLOCKS
// ==========================================

type MovingBlockProps = {
  offset?: number;
  position: Triplet;
  color?: string;
  points?: number;
  onScore?: (points: number) => void;
} & Omit<BoxProps, "position">;

function MovingBlock({
  offset = 0,
  position: [x, y, z],
  color = "#FF8FAB",
  points = 10,
  onScore,
  ...props
}: MovingBlockProps) {
  const api = useRef<PublicApi>(null!);

  useFrame((state) =>
    api.current.position.set(
      x +
        (Math.sin(
          offset + state.clock.elapsedTime * 0.4
        ) *
          state.viewport.width) /
          4,
      y,
      z
    )
  );

  return (
    <Block
      ref={api}
      args={[3, 1.5, 4]}
      color={color}
      points={points}
      onScore={onScore}
      material={{ restitution: 1.1 }}
      {...props}
    />
  );
}

// ==========================================
// COLLECTIBLE STARS
// ==========================================

function CandyStar({
  position,
  ballPosition,
  onCollect,
}: {
  position: Triplet;
  ballPosition: { current: THREE.Vector3 };
  onCollect: () => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const collected = useRef(false);

  const starPosition = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? 0.75 : 0.32;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    shape.closePath();

    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((_, delta) => {
    if (!group.current || collected.current) return;

    group.current.rotation.z += delta * 1.5;

    // Collect when the ball gets close to the star
    if (
      ballPosition.current.distanceTo(starPosition) < 1.8
    ) {
      collected.current = true;
      onCollect();
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#FFD447"
          emissive="#FFB800"
          emissiveIntensity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh scale={1.15}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial
          color="#FFF0A5"
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

// ==========================================
// BACKGROUND
// ==========================================

const Background = (props: ThreeElements["mesh"]) => (
  <mesh scale={useAspect(5000, 3800, 3)} {...props}>
    <planeGeometry />
    <meshBasicMaterial map={useTexture(bgImg)} />
  </mesh>
);

// ==========================================
// GAME SCENE
// ==========================================

function GameScene({
  onScore,
  onStar,
  collectedStars,
  ballPosition,
}: {
  onScore: (points: number) => void;
  onStar: (id: number) => void;
  collectedStars: number[];
  ballPosition: { current: THREE.Vector3 };
}) {
  return (
    <Physics iterations={5} gravity={[0, -30, 0]}>
      <BallAndCollisions ballPosition={ballPosition} />

      <Paddle />

      {/* Moving candy blocks */}
      {Array.from({ length: 5 }, (_, i) => (
        <MovingBlock
          key={i}
          position={[0, 1 + i * 6, 0]}
          offset={10000 * i}
          color={
            i === 2
              ? "#FFD166"
              : CANDY_COLORS[i % CANDY_COLORS.length]
          }
          points={i === 2 ? 20 : 10}
          onScore={onScore}
        />
      ))}

      {/* Collectible stars */}
      {STAR_POSITIONS.map((position, i) =>
        collectedStars.includes(i) ? null : (
          <CandyStar
            key={i}
            position={position}
            ballPosition={ballPosition}
            onCollect={() => onStar(i)}
          />
        )
      )}

      {/* Bottom left obstacle */}
      <Block
        args={[10, 1.5, 4]}
        position={[-12, -7, 0]}
        rotation={[0, 0, -0.55]}
        color="#B8E0A5"
        material={{ restitution: 1.2 }}
      />

      {/* Bottom right obstacle */}
      <Block
        args={[10, 1.5, 4]}
        position={[12, -7, 0]}
        rotation={[0, 0, 0.55]}
        color="#C9A7EB"
        material={{ restitution: 1.2 }}
      />

      <Environment
        preset="warehouse"
        environmentIntensity={4}
      />

      <Background position={[0, 0, -5]} />
    </Physics>
  );
}

// ==========================================
// MAIN APP
// ==========================================

export const App = () => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [score, setScore] = useState(0);
  const [collectedStars, setCollectedStars] = useState<number[]>([]);

  const [message, setMessage] = useState("Let's collect some stars!");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [gameKey, setGameKey] = useState(0);

  const ballPosition = useRef(new THREE.Vector3(0, 0, 0));
  const audioRef = useRef<AudioContext | null>(null);

  // ========================================
  // SOUND EFFECTS
  // ========================================

  const playSound = useCallback(
    (frequency: number) => {
      if (!soundEnabled || !audioRef.current) return;

      const context = audioRef.current;

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0.12, context.currentTime);

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.25
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
    },
    [soundEnabled]
  );

  // ========================================
  // SCORE SYSTEM
  // ========================================

  const handleScore = useCallback(
    (points: number) => {
      setScore((previous) => previous + points);

      setMessage(
        points >= 20
          ? `Super hit! +${points} points!`
          : `Sweet hit! +${points} points!`
      );

      playSound(points >= 20 ? 740 : 520);
    },
    [playSound]
  );

  // ========================================
  // STAR COLLECTION
  // ========================================

  const handleStar = useCallback(
    (id: number) => {
      if (collectedStars.includes(id)) return;

      const newStars = [...collectedStars, id];

      setCollectedStars(newStars);
      setScore((previous) => previous + 50);

      playSound(880);

      if (newStars.length >= STAR_TARGET) {
        setCompleted(true);
        setMessage("Amazing! You collected all 5 stars!");
        playSound(1100);
      } else {
        setMessage("Wonderful! +50 points! ⭐");
      }
    },
    [collectedStars, playSound]
  );

  // ========================================
  // MESSAGE TIMER
  // ========================================

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [message]);

  // ========================================
  // START / RESTART GAME
  // ========================================

  const startGame = () => {
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new AudioContext();
    }

    void audioRef.current?.resume();

    setScore(0);
    setCollectedStars([]);
    setCompleted(false);
    setMessage("Let's play! Have fun! 🍬");

    ballPosition.current.set(0, 0, 0);

    setGameKey((previous) => previous + 1);
    setStarted(true);
  };

  const progress = (collectedStars.length / STAR_TARGET) * 100;

  // ========================================
  // GAME INTERFACE
  // ========================================

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#FFF0F5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* 3D GAME */}
      {started && (
        <Canvas
          key={gameKey}
          dpr={1.5}
          camera={{ position: [0, 2, 12], fov: 50 }}
        >
          <GameScene
            onScore={handleScore}
            onStar={handleStar}
            collectedStars={collectedStars}
            ballPosition={ballPosition}
          />
        </Canvas>
      )}

      {/* START SCREEN */}
      {!started && (
        <div style={screenStyle}>
          <div style={panelStyle}>
            <div style={{ fontSize: 65 }}>🍭🍬⭐</div>

            <h1 style={titleStyle}>
              CANDY ADVENTURE
            </h1>

            <p style={subtitleStyle}>
              Welcome to a sweet and exciting adventure!
            </p>

            <div style={instructionStyle}>
              <p>🎮 Move your mouse left and right</p>
              <p>🍬 Keep the ball bouncing</p>
              <p>⭐ Collect 5 golden stars</p>
              <p>🏆 Earn as many points as you can!</p>
            </div>

            <button
              onClick={startGame}
              style={playButtonStyle}
            >
              ▶ PLAY NOW
            </button>

            <p style={smallTextStyle}>
              Have fun and enjoy your candy adventure!
            </p>
          </div>
        </div>
      )}

      {/* GAME HUD */}
      {started && !completed && (
        <>
          <div style={hudStyle}>
            <div style={hudCardStyle}>
              <div style={hudLabelStyle}>YOUR SCORE</div>
              <div style={scoreStyle}>🏆 {score}</div>
            </div>

            <div style={hudCardStyle}>
              <div style={hudLabelStyle}>STARS</div>
              <div style={scoreStyle}>
                ⭐ {collectedStars.length}/{STAR_TARGET}
              </div>
            </div>

            <button
              onClick={() => setSoundEnabled((v) => !v)}
              style={soundButtonStyle}
              aria-label="Toggle sound"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div style={progressContainerStyle}>
            <div style={progressLabelStyle}>
              <span>⭐ Star Collection</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div style={progressTrackStyle}>
              <div
                style={{
                  ...progressFillStyle,
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* ENCOURAGING MESSAGE */}
          {message && (
            <div style={messageStyle}>
              {message}
            </div>
          )}
        </>
      )}

      {/* COMPLETION SCREEN */}
      {completed && (
        <div style={screenStyle}>
          <div style={panelStyle}>
            <div style={{ fontSize: 70 }}>🏆</div>

            <h1 style={titleStyle}>
              AMAZING JOB!
            </h1>

            <div style={{ fontSize: 45 }}>⭐⭐⭐⭐⭐</div>

            <p style={subtitleStyle}>
              You collected all 5 stars!
            </p>

            <div style={finalScoreStyle}>
              <div style={hudLabelStyle}>YOUR FINAL SCORE</div>
              <div style={{ fontSize: 42, fontWeight: 900 }}>
                {score} 🏆
              </div>
            </div>

            <p style={subtitleStyle}>
              You're a Candy Adventure champion!
            </p>

            <button
              onClick={startGame}
              style={playButtonStyle}
            >
              🔄 PLAY AGAIN
            </button>

            <button
              onClick={() => {
                setStarted(false);
                setCompleted(false);
              }}
              style={homeButtonStyle}
            >
              HOME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// INTERFACE STYLES
// ==========================================

const screenStyle = {
  position: "absolute" as const,
  inset: 0,
  zIndex: 10,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  background:
    "linear-gradient(135deg, #FFE0EB 0%, #E7DDFF 50%, #D8F5ED 100%)",
};

const panelStyle = {
  width: "min(500px, 95%)",
  padding: "35px 25px",
  borderRadius: 30,
  background: "rgba(255,255,255,0.94)",
  boxShadow: "0 15px 45px rgba(140,90,130,0.2)",
  textAlign: "center" as const,
};

const titleStyle = {
  color: "#D85B91",
  fontSize: "clamp(26px, 5vw, 40px)",
  fontWeight: 900,
  margin: "15px 0 8px",
  letterSpacing: 1,
};

const subtitleStyle = {
  color: "#77627A",
  fontSize: 16,
  lineHeight: 1.6,
};

const instructionStyle = {
  margin: "25px auto",
  padding: 15,
  borderRadius: 18,
  background: "#FFF0F5",
  color: "#72576C",
  textAlign: "left" as const,
  lineHeight: 1.8,
  fontWeight: 600,
};

const playButtonStyle = {
  width: "80%",
  maxWidth: 300,
  padding: "17px 20px",
  border: "none",
  borderRadius: 50,
  background: "linear-gradient(90deg, #FF85A8, #B58AE8)",
  color: "white",
  fontSize: 21,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 7px 15px rgba(210,100,160,0.25)",
};

const homeButtonStyle = {
  display: "block",
  margin: "12px auto 0",
  padding: "12px 35px",
  border: "none",
  borderRadius: 30,
  background: "#E9E2F4",
  color: "#77627A",
  fontWeight: 800,
  cursor: "pointer",
};

const smallTextStyle = {
  fontSize: 12,
  color: "#A28BA4",
  marginTop: 20,
};

const hudStyle = {
  position: "absolute" as const,
  top: 15,
  left: 15,
  right: 15,
  zIndex: 5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  pointerEvents: "none" as const,
};

const hudCardStyle = {
  background: "rgba(255,255,255,0.92)",
  padding: "10px 18px",
  borderRadius: 16,
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  textAlign: "center" as const,
};

const hudLabelStyle = {
  color: "#9B7A98",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 1,
};

const scoreStyle = {
  color: "#D7799C",
  fontSize: 23,
  fontWeight: 900,
};

const soundButtonStyle = {
  pointerEvents: "auto" as const,
  border: "none",
  borderRadius: 15,
  padding: "12px 15px",
  background: "white",
  fontSize: 21,
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const progressContainerStyle = {
  position: "absolute" as const,
  top: 95,
  left: "50%",
  transform: "translateX(-50%)",
  width: "min(360px, 75%)",
  zIndex: 5,
  padding: "10px 15px",
  borderRadius: 15,
  background: "rgba(255,255,255,0.9)",
};

const progressLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#896D8B",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 7,
};

const progressTrackStyle = {
  width: "100%",
  height: 12,
  borderRadius: 20,
  overflow: "hidden",
  background: "#F0DFEA",
};

const progressFillStyle = {
  height: "100%",
  borderRadius: 20,
  background: "linear-gradient(90deg, #FF8FAB, #FFD166)",
  transition: "width 0.3s ease",
};

const messageStyle = {
  position: "absolute" as const,
  bottom: 25,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 5,
  padding: "12px 24px",
  borderRadius: 30,
  background: "rgba(255,255,255,0.95)",
  color: "#D7799C",
  fontWeight: 900,
  fontSize: 16,
  whiteSpace: "nowrap" as const,
  boxShadow: "0 5px 18px rgba(0,0,0,0.1)",
};

const finalScoreStyle = {
  background: "#FFF0F5",
  padding: 20,
  borderRadius: 20,
  margin: "20px 0",
  color: "#D7799C",
};
