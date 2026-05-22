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

          <div className="mt-3">
            <BetSelector
              value={selectedBet}
              onChange={handleBetSelect}
              disabled={isSpinning || autoSpin}
              balance={player.balance}
            />
          </div>

          {/* Área de ação: TURBO | GIRAR | AUTO lado a lado sem gaps */}
          <div className="mt-4 flex items-stretch gap-0 rounded-2xl overflow-hidden border-2 border-fortune-gold/40 shadow-[0_0_18px_rgba(245,197,24,0.2)]">
            {/* TURBO */}
            <button
              type="button"
              onClick={handleToggleTurbo}
              className={[
                "flex-none w-20 flex flex-col items-center justify-center py-3 text-[10px] font-display tracking-widest border-r-2 border-fortune-gold/30 transition",
                turboMode
                  ? "bg-fortune-jade/20 text-fortune-jade"
                  : "bg-fortune-redDeep/60 text-fortune-goldLight/70 hover:bg-fortune-redDeep/80",
              ].join(" ")}
              aria-pressed={turboMode}
              title="Acelera a animacao dos reels"
            >
              <span className="text-lg mb-0.5">⚡</span>
              <span>{turboMode ? "ON" : "TURBO"}</span>
            </button>

            {/* GIRAR — cresce para preencher */}
            <div className="flex-1">
              <SpinButton
                onClick={handleManualSpin}
                disabled={isSpinning || insufficientBalance || autoSpin}
                loading={isSpinning}
                bet={selectedBet}
                fullWidth
              />
            </div>

            {/* AUTO */}
            <button
              type="button"
              onClick={handleToggleAuto}
              disabled={!autoSpin && insufficientBalance}
              className={[
                "flex-none w-20 flex flex-col items-center justify-center py-3 text-[10px] font-display tracking-widest border-l-2 border-fortune-gold/30 transition",
                autoSpin
                  ? "bg-fortune-redLight/20 text-fortune-redLight"
                  : "bg-fortune-redDeep/60 text-fortune-goldLight/70 hover:bg-fortune-redDeep/80",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              ].join(" ")}
              aria-pressed={autoSpin}
              title="Auto-spin: gira automaticamente ate acabar o saldo"
            >
              <span className="text-lg mb-0.5">🔄</span>
              <span>{autoSpin ? `${autoSpinCount}` : "AUTO"}</span>
            </button>
          </div>

          {/* Mensagens de status abaixo dos botões */}
          <div className="mt-2 min-h-[20px] text-center">
            {insufficientBalance && (
              <p className="text-xs text-fortune-redLight">
                Saldo insuficiente · escolha um valor menor
              </p>
            )}
            {autoSpin && (
              <p className="text-[11px] text-fortune-jade/90 tracking-wider uppercase">
                Auto rodando · toque em AUTO para parar
              </p>
            )}
            {lastResult && !isSpinning && !autoSpin && !insufficientBalance && (
              <div
                className={`text-xs ${
                  lastResult.isWinner ? "text-fortune-gold" : "text-neutral-500"
                }`}
              >
                {lastResult.isWinner
                  ? `${kind.toUpperCase()} · premio nas linhas`
                  : "Tente de novo!"}
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
