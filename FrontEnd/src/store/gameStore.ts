import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpinResponseDto } from "../types/api";

export interface SpinHistoryEntry {
  /** ISO timestamp */
  at: string;
  rows: string[][];
  prizeWon: number;
  balanceAfter: number;
  isWinner: boolean;
}

interface GameState {
  isSpinning: boolean;
  lastResult: SpinResponseDto | null;
  history: SpinHistoryEntry[];
  totalSpins: number;
  totalWagered: number;
  totalWon: number;

  startSpin: () => void;
  finishSpin: (result: SpinResponseDto) => void;
  resetHistory: () => void;
}

const BET_AMOUNT = 3; // espelha SlotMachine.FixedBetAmount no backend

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      isSpinning: false,
      lastResult: null,
      history: [],
      totalSpins: 0,
      totalWagered: 0,
      totalWon: 0,

      startSpin: () => set({ isSpinning: true }),

      finishSpin: (result) =>
        set((state) => {
          const entry: SpinHistoryEntry = {
            at: new Date().toISOString(),
            rows: result.rows,
            prizeWon: result.prizeWon,
            balanceAfter: result.currentBalance,
            isWinner: result.isWinner,
          };
          // mantém só os últimos 200 spins para não estourar o localStorage
          const history = [entry, ...state.history].slice(0, 200);
          return {
            isSpinning: false,
            lastResult: result,
            history,
            totalSpins: state.totalSpins + 1,
            totalWagered: state.totalWagered + BET_AMOUNT,
            totalWon: state.totalWon + result.prizeWon,
          };
        }),

      resetHistory: () =>
        set({
          history: [],
          totalSpins: 0,
          totalWagered: 0,
          totalWon: 0,
          lastResult: null,
        }),
    }),
    {
      name: "lucky-spin:game",
    }
  )
);

export const BET_AMOUNT_BRL = BET_AMOUNT;
