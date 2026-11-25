
import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import {
  CapsuleCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useMovementStore } from "./MovementStore";

type Controls =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "jump";

const SPEED = 5;

const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

export function Player() {
  const ref = useRef<RapierRigidBody>(null!);
  const rapier = useRapier();
  const [, get] = useKeyboardControls<Controls>();

  useFrame((state) => {
    if (!ref.current) return;

    const {
      forward,
      backward,
      left,
      right,
      jump,
    } = get();

    const velocity = ref.current.linvel();
    const position = ref.current.translation();

    // Third-person camera
    cameraTarget.set(
      position.x,
      position.y + 4,
      position.z + 7,
    );

    lookTarget.set(
      position.x,
      position.y + 0.8,
      position.z,
    );

    state.camera.position.lerp(cameraTarget, 0.12);
    state.camera.lookAt(lookTarget);

    // Keyboard movement
    const keyboardMoving =
      forward || backward || left || right;

    if (keyboardMoving) {
      useMovementStore.getState().clearTarget();

      frontVector.set(
        0,
        0,
        Number(backward) - Number(forward),
      );

      sideVector.set(
        Number(left) - Number(right),
        0,
        0,
      );

      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(SPEED);

      ref.current.setLinvel(
        {
          x: direction.x,
          y: velocity.y,
          z: direction.z,
        },
        true,
      );
    } else {
      // Mouse click-to-move
      const target = useMovementStore.getState().target;

      if (target) {
        direction.set(
          target.x - position.x,
          0,
          target.z - position.z,
        );

        const distance = direction.length();

        if (distance > 0.65) {
          direction.normalize().multiplyScalar(SPEED);

          ref.current.setLinvel(
            {
              x: direction.x,
              y: velocity.y,
              z: direction.z,
            },
            true,
          );
        } else {
          useMovementStore.getState().clearTarget();

          ref.current.setLinvel(
            { x: 0, y: velocity.y, z: 0 },
            true,
          );
        }
      } else {
        ref.current.setLinvel(
          {
            x: 0,
            y: velocity.y,
            z: 0,
          },
          true,
        );
      }
    }

    // Jumping
    const world = rapier.world;

    const ray = world.castRay(
      new RAPIER.Ray(
        ref.current.translation(),
        { x: 0, y: -1, z: 0 },
      ),
      10,
      true,
      undefined,
      undefined,
      undefined,
      ref.current,
    );

    const grounded =
      ray &&
      ray.collider &&
      Math.abs(ray.timeOfImpact) <= 1.75;

    if (jump && grounded) {
      ref.current.setLinvel(
        {
          x: velocity.x,
          y: 7.5,
          z: velocity.z,
        },
        true,
      );
    }
  });

  return (
    <RigidBody
      ref={ref}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 10, 0]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.75, 0.5]} />

      {/* Player body */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#4f8cff" />
      </mesh>

      {/* Player head */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color="#ffd5a5" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.13, 1.1, 0.33]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="black" />
      </mesh>

      <mesh position={[0.13, 1.1, 0.33]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="black" />
      </mesh>
    </RigidBody>
  );
}
