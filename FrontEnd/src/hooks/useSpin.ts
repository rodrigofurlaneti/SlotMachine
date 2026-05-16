import { useCallback } from "react";
import { toast } from "sonner";
import { spin as apiSpin } from "../api/slot";
import { usePlayerStore } from "../store/playerStore";
import { useGameStore } from "../store/gameStore";
import { useAchievementsStore } from "../store/achievementsStore";
import { useSounds } from "./useSounds";
import { useCelebration } from "./useCelebration";

export type SpinKind = "lose" | "win" | "bigWin" | "jackpot";

/**
 * Classifica o prêmio. Espelha as regras visuais:
 * - jackpot = todas as 3 linhas com diamante (prize >= 900) — backend dá 100x * 3 linhas com aposta 3 = R$900
 * - bigWin = prêmio >= R$100
 * - win    = prêmio > 0
 */
export function classifyPrize(prize: number, rows: string[][]): SpinKind {
  if (prize === 0) return "lose";
  const allDiamondLines = rows.every((r) => r[0] === "💎" && r[1] === "💎" && r[2] === "💎");
  if (allDiamondLines) return "jackpot";
  if (prize >= 100) return "bigWin";
  return "win";
}

export function useSpin() {
  const player = usePlayerStore((s) => s.player);
  const setBalance = usePlayerStore((s) => s.setBalance);
  const startSpin = useGameStore((s) => s.startSpin);
  const finishSpin = useGameStore((s) => s.finishSpin);
  const isSpinning = useGameStore((s) => s.isSpinning);

  const { play } = useSounds();
  const { fire } = useCelebration();

  const addXp = useAchievementsStore((s) => s.addXp);
  const unlock = useAchievementsStore((s) => s.unlock);
  const progressMission = useAchievementsStore((s) => s.progressMission);
  const totalSpins = useGameStore((s) => s.totalSpins);

  const doSpin = useCallback(async () => {
    if (!player || isSpinning) return null;
    if (player.balance < 3) {
      toast.error("Saldo insuficiente para girar (mín. R$ 3,00).");
      return null;
    }

    startSpin();
    play("spin");

    try {
      const result = await apiSpin(player.id);
      finishSpin(result);
      setBalance(result.currentBalance);

      const kind = classifyPrize(result.prizeWon, result.rows);
      // delay sincronizado com o fim da animação dos reels (~2s)
      const delayMs = 2000;
      window.setTimeout(() => {
        if (kind === "lose") {
          play("stop");
        } else {
          if (kind === "win") play("win");
          if (kind === "bigWin") play("bigWin");
          if (kind === "jackpot") play("jackpot");
          fire(kind);
        }

        // Gameficação: XP, conquistas, missões
        const xpGain = 5 + Math.floor(result.prizeWon / 5);
        const { leveledUp, newLevel } = addXp(xpGain);
        if (leveledUp) {
          play("levelUp");
          toast.success(`🆙 Subiu para o nível ${newLevel}!`);
        }

        const spinsNow = totalSpins + 1;
        const unlocks: string[] = ["first_spin"];
        if (result.isWinner) unlocks.push("first_win");
        if (spinsNow >= 10) unlocks.push("ten_spins");
        if (spinsNow >= 50) unlocks.push("fifty_spins");
        if (spinsNow >= 100) unlocks.push("hundred_spins");
        if (result.rows.some((r) => r[0] === "💎" && r[1] === "💎" && r[2] === "💎"))
          unlocks.push("diamond_line");
        if (result.prizeWon >= 100) unlocks.push("big_win");
        if (kind === "jackpot") unlocks.push("jackpot");

        for (const id of unlocks) {
          const a = unlock(id);
          if (a) toast(`${a.icon} ${a.title}`, { description: a.description });
        }

        // Missões diárias
        const completeMission = (id: string, amount: number) => {
          const mission = progressMission(id, amount);
          if (mission) {
            toast.success(`Missão completa: ${mission.title} (+${mission.reward} XP)`);
            addXp(mission.reward);
          }
        };
        completeMission("daily_spins_10", 1);
        if (result.isWinner) completeMission("daily_win_3", 1);
        if (result.rows.some((r) => r.includes("💎"))) completeMission("daily_diamond", 1);
      }, delayMs);

      return { result, kind };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao executar o giro.";
      toast.error(msg);
      // garante que sai do estado de spinning
      finishSpin({
        rows: useGameStore.getState().lastResult?.rows ?? [
          ["❌", "❌", "❌"],
          ["❌", "❌", "❌"],
          ["❌", "❌", "❌"],
        ],
        prizeWon: 0,
        currentBalance: player.balance,
        isWinner: false,
      });
      return null;
    }
  }, [
    player,
    isSpinning,
    startSpin,
    finishSpin,
    setBalance,
    play,
    fire,
    addXp,
    unlock,
    progressMission,
    totalSpins,
  ]);

  return { doSpin, isSpinning };
}
