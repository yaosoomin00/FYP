
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Ground } from "./Ground";
import { Player } from "./Player";
import { Cube, Cubes } from "./Cube";
import { GameHub } from "./GameHub";
import { GameOverlay, type GameType } from "./GameOverlay";

function MoveButton({
  label,
  keyName,
}: {
  label: string;
  keyName: string;
}) {
  const sendKey = (type: "keydown" | "keyup") => {
    window.dispatchEvent(
      new KeyboardEvent(type, {
        key: keyName,
        bubbles: true,
      }),
    );
  };

  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        sendKey("keydown");
      }}
      onPointerUp={() => sendKey("keyup")}
      onPointerLeave={() => sendKey("keyup")}
      onPointerCancel={() => sendKey("keyup")}
      style={{
        width: 54,
        height: 54,
        border: "2px solid white",
        borderRadius: 14,
        background: "#293c5a",
        color: "white",
        fontSize: 25,
        fontWeight: "bold",
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}

function MovementPad() {
  return (
    <div
      style={{
        position: "absolute",
        right: 25,
        bottom: 25,
        display: "grid",
        gridTemplateColumns: "repeat(3, 54px)",
        gap: 5,
        zIndex: 5,
      }}
    >
      <div />
      <MoveButton label="↑" keyName="w" />
      <div />
      <MoveButton label="←" keyName="a" />
      <MoveButton label="↓" keyName="s" />
      <MoveButton label="→" keyName="d" />
    </div>
  );
}

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);

  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
      ]}
    >
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Canvas
          shadows
          camera={{ fov: 50, position: [0, 5, 10] }}
          style={{ cursor: "crosshair" }}
        >
          <Sky sunPosition={[100, 30, 100]} />

          <ambientLight intensity={1.2} />

          <directionalLight
            castShadow
            intensity={2}
            position={[30, 50, 20]}
          />

          <Physics gravity={[0, -30, 0]}>
            <Ground />
            <Player />
            <GameHub onEnter={setActiveGame} />
            <Cube position={[0, 0.5, -10]} />
            <Cubes />
          </Physics>
        </Canvas>

        {!activeGame && (
          <>
            <div
              style={{
                position: "absolute",
                top: 18,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#283c5aee",
                color: "white",
                padding: "12px 25px",
                borderRadius: 16,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <b style={{ fontSize: 21 }}>🌈 WONDERLAND</b>
              <div style={{ fontSize: 12 }}>
                Your learning adventure starts here!
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                color: "white",
                background: "#18243bdc",
                padding: 14,
                borderRadius: 12,
                fontSize: 12,
                lineHeight: 1.8,
                pointerEvents: "none",
              }}
            >
              <b>HOW TO PLAY</b>
              <br />
              WASD / Arrows: Move
              <br />
              Click ground: Walk there
              <br />
              Space: Jump
              <br />
              Click a room: Play
            </div>

            <MovementPad />
          </>
        )}

        {activeGame && (
          <GameOverlay
            game={activeGame}
            onExit={() => setActiveGame(null)}
          />
        )}
      </div>
    </KeyboardControls>
  );
}
