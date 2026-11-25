
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import {
  CuboidCollider,
  RigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";

import grassImg from "./grass.jpg";
import { useMovementStore } from "./MovementStore";

export function Ground(props: RigidBodyProps) {
  const texture = useTexture(grassImg);
  const setTarget = useMovementStore((state) => state.setTarget);

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <RigidBody {...props} type="fixed" colliders={false}>
      <mesh
        receiveShadow
        position={[0, 0, 0]}
        rotation-x={-Math.PI / 2}
        onPointerDown={(e) => {
          e.stopPropagation();
          setTarget(e.point.x, e.point.z);
        }}
      >
        <planeGeometry args={[1000, 1000]} />

        <meshStandardMaterial
          map={texture}
          map-repeat={[240, 240]}
          color="green"
        />
      </mesh>

      <CuboidCollider
        args={[1000, 2, 1000]}
        position={[0, -2, 0]}
      />
    </RigidBody>
  );
}
