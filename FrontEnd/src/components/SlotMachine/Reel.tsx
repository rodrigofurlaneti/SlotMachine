import { useEffect, useMemo, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { REEL_STRIP } from "../../utils/symbols";

interface ReelProps {
  /** Símbolo final que esse reel deve mostrar quando parar. */
  finalSymbol: string | null;
  /** Estado do giro. */
  spinning: boolean;
  /** Delay em ms antes desse reel parar (cria o efeito cascata). */
  stopDelayMs: number;
  /** Callback quando o reel termina o giro. */
  onStop?: () => void;
  /** Se a linha do reel é parte de uma combinação vencedora. */
  isWinning?: boolean;
}

const SYMBOL_HEIGHT = 72; // px — deve casar com a altura do .reel-window

export function Reel({ finalSymbol, spinning, stopDelayMs, onStop, isWinning }: ReelProps) {
  const controls = useAnimation();
  const stripRef = useRef<HTMLDivElement | null>(null);

  // Pré-monta a esteira de símbolos. Empurra o símbolo final no fim para garantir que ele
  // seja o que aparece na janela visível ao parar.
  const strip = useMemo(() => {
    const repeated = [...REEL_STRIP, ...REEL_STRIP, ...REEL_STRIP];
    if (finalSymbol) repeated.push(finalSymbol);
    return repeated;
  }, [finalSymbol]);

  useEffect(() => {
    if (!stripRef.current) return;

    // Só anima quando o backend já devolveu o símbolo final desse reel.
    // Enquanto isso (período "carregando"), o reel fica parado mostrando o símbolo anterior.
    if (!finalSymbol) return;

    // Reset visual antes de começar a girar.
    controls.set({ y: 0 });

    // O símbolo final está em strip[strip.length - 1]. Como a janela mostra 1 símbolo de
    // altura SYMBOL_HEIGHT, basta deslocar para -(idx * SYMBOL_HEIGHT).
    const targetY = -(strip.length - 1) * SYMBOL_HEIGHT;

    const duration = 1.2 + stopDelayMs / 1000;

    controls
      .start({
        y: targetY,
        transition: {
          duration,
          ease: [0.22, 0.9, 0.32, 1], // cubic-out com snap
        },
      })
      .then(() => {
        onStop?.();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalSymbol, strip]);

  return (
    <motion.div
      className={`reel-window relative overflow-hidden rounded-lg w-20 sm:w-24 h-[72px] ${
        isWinning ? "ring-2 ring-casino-gold" : ""
      }`}
      aria-label="reel"
      animate={
        isWinning
          ? {
              scale: [1, 1.12, 1.05, 1.12, 1],
              rotate: [0, -3, 3, -2, 0],
              boxShadow: [
                "0 0 0 rgba(245,197,24,0)",
                "0 0 32px rgba(245,197,24,0.9), inset 0 0 16px rgba(245,197,24,0.5)",
                "0 0 12px rgba(245,197,24,0.5)",
                "0 0 32px rgba(245,197,24,0.9), inset 0 0 16px rgba(245,197,24,0.5)",
                "0 0 0 rgba(245,197,24,0)",
              ],
            }
          : { scale: 1, rotate: 0, boxShadow: "0 0 0 rgba(245,197,24,0)" }
      }
      transition={
        isWinning
          ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      <motion.div ref={stripRef} animate={controls} initial={{ y: 0 }} className="will-change-transform">
        {strip.map((face, idx) => (
          <div
            key={`${face}-${idx}`}
            style={{ height: SYMBOL_HEIGHT }}
            className="flex items-center justify-center text-4xl sm:text-5xl select-none"
          >
            <span aria-hidden>{face}</span>
          </div>
        ))}
      </motion.div>

      {/* Brilho central na linha de pagamento */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-casino-gold/60 to-transparent" />

      {/* Shimmer dourado varrendo o reel quando vencedor */}
      {isWinning && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,247,192,0.55) 50%, transparent 70%)",
            backgroundSize: "300% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0%", "-100% 0%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Sparkles flutuando saindo do reel vencedor */}
      {isWinning && (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute text-xs"
              style={{ left: `${20 + i * 25}%`, top: "60%" }}
              initial={{ opacity: 0, y: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-4, -36, -56, -72],
                scale: [0.4, 1, 0.9, 0.5],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.35,
                ease: "easeOut",
              }}
            >
              ✨
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
