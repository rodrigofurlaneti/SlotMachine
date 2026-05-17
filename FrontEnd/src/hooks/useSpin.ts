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
 * - jackpot = grid inteiro com 💎 (todas 5 linhas pagantes: 3 horizontais + 2 diagonais)
 *             prêmio máximo = 5 * 100 * 3 = R$1500
 * - bigWin  = prêmio >= R$100
 * - win     = prêmio > 0
 */
export function classifyPrize(prize: number, rows: string[][]): SpinKind {
  if (prize === 0) return "lose";
  const allDiamond = rows.every((r) => r[0] === "💎" && r[1] === "💎" && r[2] === "💎");
  if (allDiamond) return "jackpot";
  if (prize >= 100) return "bigWin";
  return "win";
}

/** Detecta se há alguma linha de 💎 vencedora (horizontal ou diagonal). */
function hasDiamondLine(rows: string[][]): boolean {
  // Horizontais
  for (const r of rows) {
    if (r[0] === "💎" && r[1] === "💎" && r[2] === "💎") return true;
  }
  // Diagonal principal
  if (rows[0]?.[0] === "💎" && rows[1]?.[1] === "💎" && rows[2]?.[2] === "💎") return true;
  // Diagonal secundária
  if (rows[0]?.[2] === "💎" && rows[1]?.[1] === "💎" && rows[2]?.[0] === "💎") return true;
  return false;
}

export function useSpin() {
  const player = usePlayerStore((s) => s.player);
  const setBalance = usePlayerStore((s) => s.setBalance);
  const startSpin = useGameStore((s) => s.startSpin);
  const finishSpin = useGameStore((s) => s.finishSpin);
  const stopSpin = useGameStore((s) => s.stopSpin);
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
      // O reel da última linha/coluna tem duração de 1.2 + 0.9 = 2.1s,
      // então 2.2s garante que todos os reels já pararam.
      const delayMs = 2200;
      window.setTimeout(() => {
        // Encerra o estado de giro (libera o botão GIRAR)
        stopSpin();

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
        if (hasDiamondLine(result.rows)) unlocks.push("diamond_line");
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
      stopSpin();
      return null;
    }
  }, [
    player,
    isSpinning,
    startSpin,
    finishSpin,
    stopSpin,
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
