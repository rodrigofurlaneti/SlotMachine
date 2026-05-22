import { useEffect, useMemo, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { REEL_STRIP } from "../../utils/symbols";
import { useGameStore } from "../../store/gameStore";

interface ReelProps {
  finalSymbol: string | null;
  spinning: boolean;
  stopDelayMs: number;
  onStop?: () => void;
  isWinning?: boolean;
}

const SYMBOL_HEIGHT = 72; // px — altura do símbolo dentro do reel unificado

export function Reel({ finalSymbol, spinning, stopDelayMs, onStop, isWinning }: ReelProps) {
  const controls = useAnimation();
  const turbo = useGameStore((s) => s.turboMode);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const strip = useMemo(() => {
    const repeated = [...REEL_STRIP, ...REEL_STRIP, ...REEL_STRIP];
    if (finalSymbol) repeated.push(finalSymbol);
    return repeated;
  }, [finalSymbol]);

  useEffect(() => {
    if (!stripRef.current) return;
    if (!finalSymbol) return;

    controls.set({ y: 0 });
    const targetY = -(strip.length - 1) * SYMBOL_HEIGHT;
    // Turbo encurta a animacao drasticamente para o auto-spin fluir.
    const duration = turbo
      ? 0.35 + (stopDelayMs / 1000) * 0.35
      : 1.0 + stopDelayMs / 1000;

    controls
      .start({
        y: targetY,
        transition: {
          duration,
          ease: [0.22, 0.9, 0.32, 1],
        },
      })
      .then(() => {
        onStop?.();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalSymbol, strip]);

  return (
    <motion.div
      className={`relative overflow-hidden w-[22vw] max-w-[88px] min-w-[60px] h-[72px] ${
        isWinning ? "bg-fortune-gold/10" : ""
      }`}
      aria-label="reel"
      animate={
        isWinning
          ? {
              scale: [1, 1.12, 1.05, 1.12, 1],
              rotate: [0, -3, 3, -2, 0],
              boxShadow: [
                "0 0 0 rgba(245,197,24,0)",
                "0 0 28px rgba(245,197,24,0.9), inset 0 0 14px rgba(245,197,24,0.5)",
                "0 0 10px rgba(245,197,24,0.5)",
                "0 0 28px rgba(245,197,24,0.9), inset 0 0 14px rgba(245,197,24,0.5)",
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

      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-fortune-gold/60 to-transparent" />

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
                y: [-4, -28, -42, -60],
                scale: [0.4, 1, 0.9, 0.5],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.35,
                ease: "easeOut",
              }}
            >
              {"✨"}
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
