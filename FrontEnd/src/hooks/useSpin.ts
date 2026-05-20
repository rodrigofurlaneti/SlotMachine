import { useCallback } from "react";
import { toast } from "sonner";
import { spin as apiSpin } from "../api/slot";
import { usePlayerStore } from "../store/playerStore";
import { useGameStore } from "../store/gameStore";
import { useAchievementsStore } from "../store/achievementsStore";
import { useSounds } from "./useSounds";
import { useCelebration } from "./useCelebration";
import { formatBRL } from "../utils/format";

export type SpinKind = "lose" | "win" | "bigWin" | "jackpot";

const DRAGON = "\u{1F409}";
const GRID_SIZE = 4;

/** Conta quantas linhas pagantes venceram no grid 4x4 (4H + 4V + 2D = max 10). */
function countWinningLines(rows: string[][]): number {
  if (!rows || rows.length < GRID_SIZE) return 0;
  let count = 0;

  const isLine = (arr: (string | undefined)[]) => {
    const f = arr[0];
    if (!f || f === "\u{1F38B}") return false;
    for (let i = 1; i < arr.length; i++) if (arr[i] !== f) return false;
    return true;
  };

  // Horizontais
  for (let r = 0; r < GRID_SIZE; r++) {
    if (rows[r] && isLine(rows[r])) count += 1;
  }
  // Verticais
  for (let c = 0; c < GRID_SIZE; c++) {
    const col = [0, 1, 2, 3].map((r) => rows[r]?.[c]);
    if (isLine(col)) count += 1;
  }
  // Diagonais
  if (isLine([0, 1, 2, 3].map((i) => rows[i]?.[i]))) count += 1;
  if (isLine([0, 1, 2, 3].map((i) => rows[i]?.[GRID_SIZE - 1 - i]))) count += 1;

  return count;
}

/**
 * Classifica o premio considerando o grid 4x4:
 *   - jackpot = TODAS as 16 celulas com dragao (todas 10 linhas vencem)
 *   - bigWin  = 3 ou mais linhas vencedoras OU premio >= 50x a aposta
 *   - win     = qualquer premio > 0
 */
export function classifyPrize(
  prize: number,
  rows: string[][],
  betAmount: number
): SpinKind {
  if (prize === 0) return "lose";

  // Jackpot real: grid inteiro de dragoes
  const allDragon = rows.every((r) => r.every((c) => c === DRAGON));
  if (allDragon) return "jackpot";

  const lines = countWinningLines(rows);
  if (lines >= 3 || prize >= betAmount * 50) return "bigWin";
  return "win";
}

function hasDragonLine(rows: string[][]): boolean {
  if (!rows || rows.length < GRID_SIZE) return false;
  const isLine = (arr: (string | undefined)[]) =>
    arr.every((v) => v === DRAGON);
  for (const r of rows) if (isLine(r)) return true;
  for (let c = 0; c < GRID_SIZE; c++) {
    if (isLine([0, 1, 2, 3].map((r) => rows[r]?.[c]))) return true;
  }
  if (isLine([0, 1, 2, 3].map((i) => rows[i]?.[i]))) return true;
  if (isLine([0, 1, 2, 3].map((i) => rows[i]?.[GRID_SIZE - 1 - i]))) return true;
  return false;
}

export function useSpin() {
  const player = usePlayerStore((s) => s.player);
  const setBalance = usePlayerStore((s) => s.setBalance);
  const startSpin = useGameStore((s) => s.startSpin);
  const finishSpin = useGameStore((s) => s.finishSpin);
  const stopSpin = useGameStore((s) => s.stopSpin);
  const isSpinning = useGameStore((s) => s.isSpinning);
  const selectedBet = useGameStore((s) => s.selectedBet);

  const { play, announceMegaWin } = useSounds();
  const { fire } = useCelebration();

  const addXp = useAchievementsStore((s) => s.addXp);
  const unlock = useAchievementsStore((s) => s.unlock);
  const progressMission = useAchievementsStore((s) => s.progressMission);
  const totalSpins = useGameStore((s) => s.totalSpins);

  const doSpin = useCallback(async () => {
    if (!player || isSpinning) return null;
    if (player.balance < selectedBet) {
      toast.error(
        `Saldo insuficiente para girar (necessario ${formatBRL(selectedBet)}).`
      );
      return null;
    }

    startSpin();
    play("spin");

    try {
      const result = await apiSpin(player.id, selectedBet);
      finishSpin(result);
      setBalance(result.currentBalance);

      const kind = classifyPrize(result.prizeWon, result.rows, result.betAmount);
      const lines = countWinningLines(result.rows);

      // Tempo de animacao: ultimo reel (linha 3, col 3) tem delay 3*200 + 3*160 = 1080ms
      // + duracao base 1.0s = ~2.1s. Aguardamos 2.2s para a fanfarra.
      const delayMs = 2200;
      window.setTimeout(() => {
        stopSpin();

        if (kind === "lose") {
          play("stop");
        } else {
          if (kind === "win") play("win");
          if (kind === "bigWin") play("bigWin");
          if (kind === "jackpot") play("jackpot");
          fire(kind);

          // Voz de fanfarra para >=3 linhas
          if (lines >= 3) {
            announceMegaWin(lines, kind);
          }
        }

        // Gameficacao
        const xpGain = 5 + Math.floor(result.prizeWon / 5) + lines * 2;
        const { leveledUp, newLevel } = addXp(xpGain);
        if (leveledUp) {
          play("levelUp");
          toast.success(`Subiu para o nivel ${newLevel}!`);
        }

        const spinsNow = totalSpins + 1;
        const unlocks: string[] = ["first_spin"];
        if (result.isWinner) unlocks.push("first_win");
        if (spinsNow >= 10) unlocks.push("ten_spins");
        if (spinsNow >= 50) unlocks.push("fifty_spins");
        if (spinsNow >= 100) unlocks.push("hundred_spins");
        if (hasDragonLine(result.rows)) unlocks.push("diamond_line");
        if (result.prizeWon >= result.betAmount * 50 || lines >= 3) unlocks.push("big_win");
        if (kind === "jackpot") unlocks.push("jackpot");

        for (const id of unlocks) {
          const a = unlock(id);
          if (a) toast(`${a.icon} ${a.title}`, { description: a.description });
        }

        const completeMission = (id: string, amount: number) => {
          const mission = progressMission(id, amount);
          if (mission) {
            toast.success(`Missao completa: ${mission.title} (+${mission.reward} XP)`);
            addXp(mission.reward);
          }
        };
        completeMission("daily_spins_10", 1);
        if (result.isWinner) completeMission("daily_win_3", 1);
        if (result.rows.some((r) => r.includes(DRAGON))) completeMission("daily_diamond", 1);
      }, delayMs);

      return { result, kind, lines };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao executar o giro.";
      toast.error(msg);
      stopSpin();
      return null;
    }
  }, [
    player,
    isSpinning,
    selectedBet,
    startSpin,
    finishSpin,
    stopSpin,
    setBalance,
    play,
    announceMegaWin,
    fire,
    addXp,
    unlock,
    progressMission,
    totalSpins,
  ]);

  return { doSpin, isSpinning };
}
