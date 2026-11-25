
import { create } from "zustand";

type MoveTarget = {
  x: number;
  z: number;
} | null;

type MovementState = {
  target: MoveTarget;
  setTarget: (x: number, z: number) => void;
  clearTarget: () => void;
};

export const useMovementStore = create<MovementState>((set) => ({
  target: null,

  setTarget: (x, z) => set({ target: { x, z } }),

  clearTarget: () => set({ target: null }),
}));
