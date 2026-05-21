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
  betAmount: number;
}

interface GameState {
  isSpinning: boolean;
  lastResult: SpinResponseDto | null;
  history: SpinHistoryEntry[];
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  selectedBet: number;

  /** Modo turbo: animacao mais rapida. Persistido (preferencia do usuario). */
  turboMode: boolean;
  /** Auto-spin ativo: enquanto true, dispara giros automaticos. Transient. */
  autoSpin: boolean;
  /** Contador de giros do auto-spin atual (zera ao desligar). */
  autoSpinCount: number;

  startSpin: () => void;
  finishSpin: (result: SpinResponseDto) => void;
  stopSpin: () => void;
  resetHistory: () => void;
  setSelectedBet: (bet: number) => void;

  toggleTurbo: () => void;
  setAutoSpin: (active: boolean) => void;
  incAutoSpinCount: () => void;
}

export const MIN_BET_AMOUNT = 0.5;
export const MAX_BET_AMOUNT = 30;

export const BET_PRESETS: number[] = [
  0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30,
];

export const DEFAULT_BET = 3;

/** Duracoes da animacao do reel (ms). Usadas tambem para o timer da fanfarra. */
export const REEL_ANIM_NORMAL_MS = 2200;
export const REEL_ANIM_TURBO_MS = 900;

export function clampBet(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BET;
  const clamped = Math.min(MAX_BET_AMOUNT, Math.max(MIN_BET_AMOUNT, value));
  return Math.round(clamped * 100) / 100;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      isSpinning: false,
      lastResult: null,
      history: [],
      totalSpins: 0,
      totalWagered: 0,
      totalWon: 0,
      selectedBet: DEFAULT_BET,
      turboMode: false,
      autoSpin: false,
      autoSpinCount: 0,

      startSpin: () => set({ isSpinning: true, lastResult: null }),

      finishSpin: (result) =>
        set((state) => {
          const entry: SpinHistoryEntry = {
            at: new Date().toISOString(),
            rows: result.rows,
            prizeWon: result.prizeWon,
            balanceAfter: result.currentBalance,
            isWinner: result.isWinner,
            betAmount: result.betAmount,
          };
          const history = [entry, ...state.history].slice(0, 200);
          return {
            lastResult: result,
            history,
            totalSpins: state.totalSpins + 1,
            totalWagered: state.totalWagered + result.betAmount,
            totalWon: state.totalWon + result.prizeWon,
          };
        }),

      stopSpin: () => set({ isSpinning: false }),

      resetHistory: () =>
        set({
          history: [],
          totalSpins: 0,
          totalWagered: 0,
          totalWon: 0,
          lastResult: null,
        }),

      setSelectedBet: (bet) =>
        set({
          selectedBet: clampBet(bet),
        }),

      toggleTurbo: () => set((s) => ({ turboMode: !s.turboMode })),

      setAutoSpin: (active) =>
        set({
          autoSpin: active,
          autoSpinCount: active ? 0 : 0,
        }),

      incAutoSpinCount: () =>
        set((s) => ({ autoSpinCount: s.autoSpinCount + 1 })),
    }),
    {
      name: "lucky-spin:game",
      // Nao persistir autoSpin nem autoSpinCount — sempre comecam zerados
      partialize: (state) => ({
        history: state.history,
        totalSpins: state.totalSpins,
        totalWagered: state.totalWagered,
        totalWon: state.totalWon,
        selectedBet: state.selectedBet,
        turboMode: state.turboMode,
      }),
    }
  )
);
