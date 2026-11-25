import type { ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";
import type { GameType } from "./GameOverlay";
import { useMovementStore } from "./MovementStore";

type GameHubProps = {
  onEnter: (game: GameType) => void;
};

const rooms = [
  {
    id: "balloon" as const,
    title: "BALLOON BLAST",
    subtitle: "Pop & Learn!",
    x: -13,
    color: "#ff72a8",
    roof: "#b94b78",
  },
  {
    id: "memory" as const,
    title: "MEMORY FOREST",
    subtitle: "Find the Pairs!",
    x: 0,
    color: "#65b8ff",
    roof: "#367db8",
  },
  {
    id: "shape" as const,
    title: "SHAPE QUEST",
    subtitle: "Explore Shapes!",
    x: 13,
    color: "#a77aff",
    roof: "#754bb4",
  },
];

export function GameHub({ onEnter }: GameHubProps) {
  const setTarget = useMovementStore((state) => state.setTarget);

  const walkTo = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setTarget(e.point.x, e.point.z);
  };

  return (
    <group>
      {/* Central platform */}
      <mesh
        position={[0, 0.08, 0]}
        onPointerDown={walkTo}
      >
        <boxGeometry args={[12, 0.16, 12]} />
        <meshStandardMaterial color="#e8d5a8" />
      </mesh>

      <Text
        position={[0, 2, -3]}
        fontSize={1}
        color="white"
        anchorX="center"
        outlineWidth={0.06}
        outlineColor="#333333"
      >
        WONDERLAND
      </Text>

      <Text
        position={[0, 1, -3]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        outlineWidth={0.04}
        outlineColor="#333333"
      >
        CHOOSE YOUR ADVENTURE!
      </Text>

      {/* Connecting pathway */}
      <mesh
        position={[0, 0.12, -9]}
        onPointerDown={walkTo}
      >
        <boxGeometry args={[36, 0.12, 5]} />
        <meshStandardMaterial color="#c9b28c" />
      </mesh>

      {rooms.map((room) => (
        <group key={room.id} position={[room.x, 0, -19]}>
          <RigidBody type="fixed" colliders={false}>
            {/* Floor */}
            <mesh
              position={[0, 0.12, 0]}
              onPointerDown={walkTo}
            >
              <boxGeometry args={[8, 0.24, 8]} />
              <meshStandardMaterial color="#d9c49a" />
            </mesh>

            {/* Back wall */}
            <mesh position={[0, 2.5, -4]}>
              <boxGeometry args={[8, 5, 0.4]} />
              <meshStandardMaterial color={room.color} />
            </mesh>
            <CuboidCollider args={[4, 2.5, 0.2]} position={[0, 2.5, -4]} />

            {/* Side walls */}
            {[-4, 4].map((x) => (
              <group key={x}>
                <mesh position={[x, 2.5, 0]}>
                  <boxGeometry args={[0.4, 5, 8]} />
                  <meshStandardMaterial color={room.color} />
                </mesh>
                <CuboidCollider
                  args={[0.2, 2.5, 4]}
                  position={[x, 2.5, 0]}
                />
              </group>
            ))}

            {/* Roof */}
            <mesh position={[0, 5.1, 0]}>
              <boxGeometry args={[8.5, 0.5, 8.5]} />
              <meshStandardMaterial color={room.roof} />
            </mesh>

            {/* Entrance pillars */}
            {[-3.6, 3.6].map((x) => (
              <group key={x}>
                <mesh position={[x, 2.5, 3.8]}>
                  <boxGeometry args={[0.6, 5, 0.5]} />
                  <meshStandardMaterial color={room.roof} />
                </mesh>
                <CuboidCollider
                  args={[0.3, 2.5, 0.25]}
                  position={[x, 2.5, 3.8]}
                />
              </group>
            ))}

            {/* Roof decoration */}
            <mesh position={[0, 5.5, 0]}>
              <boxGeometry args={[3, 0.3, 3]} />
              <meshStandardMaterial color={room.color} />
            </mesh>

            {/* Sign */}
            <mesh position={[0, 4.1, 3.45]}>
              <boxGeometry args={[5.8, 1.1, 0.3]} />
              <meshStandardMaterial color="white" />
            </mesh>

            <Text
              position={[0, 4.1, 3.27]}
              fontSize={0.38}
              color="#292929"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="white"
            >
              {room.title}
            </Text>

            {/* Clickable game entrance */}
            <mesh
              position={[0, 1.35, 3.65]}
              onPointerDown={(e) => {
                e.stopPropagation();
                onEnter(room.id);
              }}
            >
              <boxGeometry args={[2.5, 2.7, 0.15]} />
              <meshStandardMaterial
                color={room.color}
                emissive={room.color}
                emissiveIntensity={0.45}
                transparent
                opacity={0.9}
              />
            </mesh>

            <Text
              position={[0, 1.35, 3.8]}
              fontSize={0.35}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="#333333"
            >
              PLAY
            </Text>

            <Text
              position={[0, -0.3, 4.5]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              outlineWidth={0.04}
              outlineColor="#333333"
            >
              {room.subtitle}
            </Text>
          </RigidBody>
        </group>
      ))}
    </group>
  );
}
