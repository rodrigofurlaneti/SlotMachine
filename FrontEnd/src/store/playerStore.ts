import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerDto } from "../types/api";

interface PlayerState {
  player: PlayerDto | null;
  setPlayer: (player: PlayerDto | null) => void;
  setBalance: (balance: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      player: null,
      setPlayer: (player) => set({ player }),
      setBalance: (balance) =>
        set((state) =>
          state.player ? { player: { ...state.player, balance } } : state
        ),
      reset: () => set({ player: null }),
    }),
    {
      name: "lucky-spin:player",
    }
  )
);
