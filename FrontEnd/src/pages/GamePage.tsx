import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SlotGrid } from "../components/SlotMachine/SlotGrid";
import { SpinButton } from "../components/SlotMachine/SpinButton";
import { BalancePanel } from "../components/HUD/BalancePanel";
import { WinOverlay } from "../components/Rewards/WinOverlay";
import { usePlayerStore } from "../store/playerStore";
import { BET_AMOUNT_BRL, useGameStore } from "../store/gameStore";
import { classifyPrize, useSpin } from "../hooks/useSpin";
import { useSounds } from "../hooks/useSounds";

export function GamePage() {
  const navigate = useNavigate();
  const player = usePlayerStore((s) => s.player);
  const lastResult = useGameStore((s) => s.lastResult);
  const isSpinning = useGameStore((s) => s.isSpinning);

  const { doSpin } = useSpin();
  const { muted, toggleMute, play } = useSounds();

  const [overlay, setOverlay] = useState<{
    show: boolean;
    prize: number;
    kind: "win" | "bigWin" | "jackpot";
  } | null>(null);

  useEffect(() => {
    if (!player) navigate("/", { replace: true });
  }, [player, navigate]);

  const kind = useMemo(() => {
    if (!lastResult) return "lose" as const;
    return classifyPrize(lastResult.prizeWon, lastResult.rows);
  }, [lastResult]);

  async function handleSpin() {
    play("click");
    setOverlay(null);
    const res = await doSpin();
    if (res && res.kind !== "lose") {
      // sincroniza com o término dos reels
      window.setTimeout(() => {
        setOverlay({ show: true, prize: res.result.prizeWon, kind: res.kind });
        window.setTimeout(() => setOverlay((o) => (o ? { ...o, show: false } : null)), 2200);
      }, 2000);
    }
  }

  if (!player) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <BalancePanel
          balance={player.balance}
          lastPrize={lastResult ? lastResult.prizeWon : null}
        />
        <button
          onClick={toggleMute}
          className="ml-2 p-2 rounded-lg border border-white/10 hover:bg-white/5"
          aria-label={muted ? "Ativar som" : "Mutar"}
          title={muted ? "Ativar som" : "Mutar"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <motion.div
        layout
        className="cabinet rounded-3xl p-4 sm:p-6 shadow-gold"
      >
        <div className="text-center text-display text-2xl gold-text mb-4">LUCKY 3-LINE</div>
        <SlotGrid result={lastResult?.rows ?? null} spinning={isSpinning} />
        <div className="flex flex-col items-center mt-6 gap-2">
          <SpinButton
            onClick={handleSpin}
            disabled={isSpinning || player.balance < BET_AMOUNT_BRL}
            loading={isSpinning}
            bet={BET_AMOUNT_BRL}
          />
          {player.balance < BET_AMOUNT_BRL && (
            <p className="text-xs text-casino-neon">
              Saldo insuficiente. Crie um novo jogador na tela inicial.
            </p>
          )}
          {lastResult && !isSpinning && (
            <div
              className={`text-sm mt-1 ${
                lastResult.isWinner ? "text-casino-neonCyan" : "text-neutral-500"
              }`}
            >
              {lastResult.isWinner
                ? `Você ganhou ${kind.toUpperCase()} · prêmio acumulado das linhas`
                : "Sem prêmio — tente de novo!"}
            </div>
          )}
        </div>
      </motion.div>

      <WinOverlay
        show={!!overlay?.show}
        prize={overlay?.prize ?? 0}
        kind={overlay?.kind ?? "win"}
      />
    </div>
  );
}
