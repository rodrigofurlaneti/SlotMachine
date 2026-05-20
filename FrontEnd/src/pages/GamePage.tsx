import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SlotGrid } from "../components/SlotMachine/SlotGrid";
import { SpinButton } from "../components/SlotMachine/SpinButton";
import { BetSelector } from "../components/SlotMachine/BetSelector";
import { Lantern } from "../components/SlotMachine/Lantern";
import { BalancePanel } from "../components/HUD/BalancePanel";
import { WinOverlay } from "../components/Rewards/WinOverlay";
import { FortuneRain } from "../components/Background/FortuneRain";
import { usePlayerStore } from "../store/playerStore";
import { useGameStore } from "../store/gameStore";
import { classifyPrize, useSpin } from "../hooks/useSpin";
import { useSounds } from "../hooks/useSounds";

export function GamePage() {
  const navigate = useNavigate();
  const player = usePlayerStore((s) => s.player);
  const lastResult = useGameStore((s) => s.lastResult);
  const isSpinning = useGameStore((s) => s.isSpinning);
  const selectedBet = useGameStore((s) => s.selectedBet);
  const setSelectedBet = useGameStore((s) => s.setSelectedBet);

  const { doSpin } = useSpin();
  const { muted, toggleMute, play, playChip, ensureMusic, stopBgMusic } = useSounds();

  const [overlay, setOverlay] = useState<{
    show: boolean;
    prize: number;
    kind: "win" | "bigWin" | "jackpot";
  } | null>(null);

  useEffect(() => {
    if (!player) {
      navigate("/", { replace: true });
    }
  }, [player, navigate]);

  // Para a musica quando sair da pagina de jogo.
  useEffect(() => {
    return () => {
      stopBgMusic();
    };
  }, [stopBgMusic]);

  const kind = useMemo(() => {
    if (!lastResult) return "lose" as const;
    return classifyPrize(
      lastResult.prizeWon,
      lastResult.rows,
      lastResult.betAmount
    );
  }, [lastResult]);

  async function handleSpin() {
    play("click");
    ensureMusic(); // garante musica rodando apos primeira interacao
    setOverlay(null);
    const res = await doSpin();
    if (res && res.kind !== "lose") {
      const winKind: "win" | "bigWin" | "jackpot" = res.kind;
      const winPrize = res.result.prizeWon;
      window.setTimeout(() => {
        setOverlay({ show: true, prize: winPrize, kind: winKind });
        window.setTimeout(
          () => setOverlay((o) => (o ? { ...o, show: false } : null)),
          2200
        );
      }, 2200);
    }
  }

  function handleBetSelect(bet: number) {
    ensureMusic();
    playChip(bet);
    setSelectedBet(bet);
  }

  if (!player) return null;

  const insufficientBalance = player.balance < selectedBet;

  return (
    <>
      <FortuneRain />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <BalancePanel
            balance={player.balance}
            lastPrize={lastResult ? lastResult.prizeWon : null}
          />
          <button
            onClick={() => {
              toggleMute();
              // Quando desmuta, retoma musica
              if (muted) ensureMusic();
            }}
            className="ml-2 p-2 rounded-lg border border-fortune-gold/40 hover:bg-fortune-red/20"
            aria-label={muted ? "Ativar som" : "Mutar"}
            title={muted ? "Ativar som" : "Mutar"}
          >
            {muted ? "MUTE" : "VOL"}
          </button>
        </div>

        <motion.div layout className="cabinet rounded-3xl p-4 sm:p-6 pulse-gold">
          <div className="cabinet-roof rounded-2xl px-4 py-2 mb-4 flex items-center justify-between">
            <Lantern size={42} />
            <div className="flex flex-col items-center">
              <span className="text-imperial text-2xl sm:text-3xl imperial-text">
                FORTUNE SPIN
              </span>
              <span className="text-[10px] tracking-widest text-fortune-goldLight/80 uppercase">
                Zhao Cai Jin Bao
              </span>
            </div>
            <Lantern size={42} delayed />
          </div>

          <SlotGrid result={lastResult?.rows ?? null} spinning={isSpinning} />

          <div className="mt-6">
            <BetSelector
              value={selectedBet}
              onChange={handleBetSelect}
              disabled={isSpinning}
              balance={player.balance}
            />
          </div>

          <div className="flex flex-col items-center mt-6 gap-2">
            <SpinButton
              onClick={handleSpin}
              disabled={isSpinning || insufficientBalance}
              loading={isSpinning}
              bet={selectedBet}
            />
            {insufficientBalance && (
              <p className="text-xs text-fortune-redLight">
                Saldo insuficiente para essa aposta. Escolha um valor menor ou recarregue.
              </p>
            )}
            {lastResult && !isSpinning && (
              <div
                className={`text-sm mt-1 ${
                  lastResult.isWinner ? "text-fortune-gold" : "text-neutral-400"
                }`}
              >
                {lastResult.isWinner
                  ? `Voce ganhou ${kind.toUpperCase()} - premio acumulado das linhas`
                  : "A sorte esta chegando - tente de novo!"}
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
    </>
  );
}
