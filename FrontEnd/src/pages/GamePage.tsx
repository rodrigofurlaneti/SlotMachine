import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { SlotGrid } from "../components/SlotMachine/SlotGrid";
import { SpinButton } from "../components/SlotMachine/SpinButton";
import { BetSelector } from "../components/SlotMachine/BetSelector";
import { Lantern } from "../components/SlotMachine/Lantern";
import { BalancePanel } from "../components/HUD/BalancePanel";
import { JackpotPanel } from "../components/HUD/JackpotPanel";
import { WinOverlay } from "../components/Rewards/WinOverlay";
import { FortuneRain } from "../components/Background/FortuneRain";
import { usePlayerStore } from "../store/playerStore";
import { useGameStore } from "../store/gameStore";
import { classifyPrize, useSpin } from "../hooks/useSpin";
import { useSounds } from "../hooks/useSounds";
import { formatBRL } from "../utils/format";
import { getJackpot } from "../api/slot";

export function GamePage() {
  const navigate = useNavigate();
  const player = usePlayerStore((s) => s.player);
  const setJackpotPot = usePlayerStore((s) => s.setJackpotPot);
  const lastResult = useGameStore((s) => s.lastResult);
  const isSpinning = useGameStore((s) => s.isSpinning);
  const selectedBet = useGameStore((s) => s.selectedBet);
  const setSelectedBet = useGameStore((s) => s.setSelectedBet);
  const turboMode = useGameStore((s) => s.turboMode);
  const toggleTurbo = useGameStore((s) => s.toggleTurbo);
  const autoSpin = useGameStore((s) => s.autoSpin);
  const setAutoSpin = useGameStore((s) => s.setAutoSpin);
  const autoSpinCount = useGameStore((s) => s.autoSpinCount);
  const incAutoSpinCount = useGameStore((s) => s.incAutoSpinCount);

  const { doSpin } = useSpin();
  const { muted, toggleMute, play, playChip, ensureMusic, stopBgMusic } = useSounds();

  const [overlay, setOverlay] = useState<{
    show: boolean;
    prize: number;
    kind: "win" | "bigWin" | "jackpot";
  } | null>(null);

  const [jackpotFlash, setJackpotFlash] = useState(false);

  useEffect(() => {
    if (!player) {
      navigate("/", { replace: true });
    }
  }, [player, navigate]);

  // Hidrata o pote GLOBAL do jackpot ao carregar a pagina de jogo.
  // Esse valor cresce com os giros de todos os jogadores e nao deve
  // vir zerado para um jogador que acabou de logar.
  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    (async () => {
      try {
        const pot = await getJackpot();
        if (!cancelled) setJackpotPot(pot);
      } catch {
        // silencioso — o pote sera atualizado no primeiro spin
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [player, setJackpotPot]);

  // Para a musica e o auto-spin quando sair da pagina de jogo.
  useEffect(() => {
    return () => {
      stopBgMusic();
      setAutoSpin(false);
    };
  }, [stopBgMusic, setAutoSpin]);

  const kind = useMemo(() => {
    if (!lastResult) return "lose" as const;
    return classifyPrize(
      lastResult.prizeWon,
      lastResult.rows,
      lastResult.betAmount
    );
  }, [lastResult]);

  async function triggerSpin() {
    ensureMusic();
    setOverlay(null);
    const res = await doSpin();
    if (res && res.jackpotWon > 0) {
      window.setTimeout(() => {
        setJackpotFlash(true);
        toast.success(`JACKPOT! Voce ganhou ${formatBRL(res.jackpotWon)} do pote!`, {
          duration: 6000,
        });
        window.setTimeout(() => setJackpotFlash(false), 5000);
      }, turboMode ? 900 : 2200);
    }
    if (res && res.kind !== "lose") {
      const winKind: "win" | "bigWin" | "jackpot" = res.kind;
      const winPrize = res.result.prizeWon;
      window.setTimeout(() => {
        setOverlay({ show: true, prize: winPrize, kind: winKind });
        window.setTimeout(
          () => setOverlay((o) => (o ? { ...o, show: false } : null)),
          turboMode ? 1400 : 2200
        );
      }, turboMode ? 900 : 2200);
    }
    return res;
  }

  function handleManualSpin() {
    play("click");
    void triggerSpin();
  }

  function handleBetSelect(bet: number) {
    if (autoSpin) {
      setAutoSpin(false);
      toast("Auto-spin desligado para trocar a aposta.");
    }
    ensureMusic();
    playChip(bet);
    setSelectedBet(bet);
  }

  function handleToggleAuto() {
    play("click");
    if (autoSpin) {
      setAutoSpin(false);
      toast(`Auto-spin desligado apos ${autoSpinCount} giros.`);
      return;
    }
    if (!player || player.balance < selectedBet) {
      toast.error("Saldo insuficiente para iniciar auto-spin.");
      return;
    }
    setAutoSpin(true);
    ensureMusic();
    toast.success(`Auto-spin ON · aposta ${formatBRL(selectedBet)} por giro`);
  }

  function handleToggleTurbo() {
    play("click");
    toggleTurbo();
    toast(turboMode ? "Turbo OFF" : "Turbo ON · giros mais rapidos");
  }

  const autoLoopBusy = useRef(false);
  useEffect(() => {
    if (!autoSpin || isSpinning || !player) return;
    if (player.balance < selectedBet) {
      setAutoSpin(false);
      toast.error(`Auto-spin parou: saldo insuficiente apos ${autoSpinCount} giros.`);
      return;
    }
    if (autoLoopBusy.current) return;
    autoLoopBusy.current = true;
    const t = window.setTimeout(() => {
      autoLoopBusy.current = false;
      incAutoSpinCount();
      void triggerSpin();
    }, 350);
    return () => {
      window.clearTimeout(t);
      autoLoopBusy.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin, isSpinning, player?.balance, selectedBet]);

  if (!player) return null;

  const insufficientBalance = player.balance < selectedBet;

  return (
    <>
      <FortuneRain />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        <JackpotPanel pot={player.jackpotPot ?? 0} justWon={jackpotFlash} />
        <div className="flex items-center justify-between mb-4">
          <BalancePanel
            balance={player.balance}
            lastPrize={lastResult ? lastResult.prizeWon : null}
          />
          <button
            onClick={() => {
              toggleMute();
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
              disabled={isSpinning || autoSpin}
              balance={player.balance}
            />
          </div>

          <div className="flex flex-col items-center mt-6 gap-3">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleToggleTurbo}
                className={[
                  "px-3 py-2 rounded-xl text-xs font-display tracking-widest border-2 transition",
                  turboMode
                    ? "bg-fortune-jade text-black border-fortune-jade shadow-[0_0_18px_rgba(61,220,151,0.6)]"
                    : "border-fortune-gold/40 text-fortune-goldLight hover:bg-fortune-red/20",
                ].join(" ")}
                aria-pressed={turboMode}
                title="Acelera a animacao dos reels"
              >
                {turboMode ? "TURBO ON" : "TURBO"}
              </button>

              <SpinButton
                onClick={handleManualSpin}
                disabled={isSpinning || insufficientBalance || autoSpin}
                loading={isSpinning}
                bet={selectedBet}
              />

              <button
                type="button"
                onClick={handleToggleAuto}
                disabled={!autoSpin && insufficientBalance}
                className={[
                  "px-3 py-2 rounded-xl text-xs font-display tracking-widest border-2 transition",
                  autoSpin
                    ? "bg-fortune-redLight text-white border-fortune-redLight animate-pulse shadow-[0_0_18px_rgba(255,54,81,0.6)]"
                    : "border-fortune-gold/40 text-fortune-goldLight hover:bg-fortune-red/20",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                ].join(" ")}
                aria-pressed={autoSpin}
                title="Auto-spin: gira automaticamente ate acabar o saldo"
              >
                {autoSpin ? `AUTO (${autoSpinCount})` : "AUTO"}
              </button>
            </div>

            {insufficientBalance && (
              <p className="text-xs text-fortune-redLight">
                Saldo insuficiente para essa aposta. Escolha um valor menor ou recarregue.
              </p>
            )}
            {autoSpin && (
              <p className="text-[11px] text-fortune-jade/90 tracking-wider uppercase">
                Auto rodando · clique em AUTO para parar
              </p>
            )}
            {lastResult && !isSpinning && !autoSpin && (
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
