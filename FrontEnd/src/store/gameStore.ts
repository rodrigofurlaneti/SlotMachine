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
  /** Aposta efetiva daquele giro */
  betAmount: number;
}

interface GameState {
  isSpinning: boolean;
  lastResult: SpinResponseDto | null;
  history: SpinHistoryEntry[];
  totalSpins: number;
  totalWagered: number;
  totalWon: number;

  /** Aposta atual escolhida pelo jogador (R$). */
  selectedBet: number;

  startSpin: () => void;
  finishSpin: (result: SpinResponseDto) => void;
  stopSpin: () => void;
  resetHistory: () => void;
  setSelectedBet: (bet: number) => void;
}

/** Limites espelhados do backend (Domain.SlotMachine). */
export const MIN_BET_AMOUNT = 0.5;
export const MAX_BET_AMOUNT = 30;

/** Valores fixos exibidos como chips touch-friendly. */
export const BET_PRESETS: number[] = [
  0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30,
];

/** Aposta padrão ao abrir o jogo (mantém R$ 3,00 como antes). */
export const DEFAULT_BET = 3;

/** Normaliza pra 2 casas decimais sem ruído de ponto flutuante. */
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

      // Marca início do giro. Limpa lastResult para que o Reel detecte o
      // novo símbolo final quando ele chegar da API e dispare a animação.
      startSpin: () => set({ isSpinning: true, lastResult: null }),

      // Recebe o resultado da API. Atualiza lastResult, histórico e totais,
      // mas mantém isSpinning=true para a animação dos reels rodar até o fim.
      // Quem encerra o estado de giro (isSpinning=false) é o stopSpin abaixo.
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
          // mantém só os últimos 200 spins para não estourar o localStorage
          const history = [entry, ...state.history].slice(0, 200);
          return {
            lastResult: result,
            history,
            totalSpins: state.totalSpins + 1,
            totalWagered: state.totalWagered + result.betAmount,
            totalWon: state.totalWon + result.prizeWon,
          };
        }),

      // Encerra o estado de giro após a animação dos reels terminar.
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
    }),
    {
      name: "lucky-spin:game",
    }
  )
);
