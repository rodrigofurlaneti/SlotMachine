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
const VISIBLE_OFFSET = SYMBOL_HEIGHT; // o símbolo final fica na linha central

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

    if (spinning) {
      // Reset visual antes de começar a girar
      controls.set({ y: 0 });

      const totalHeight = strip.length * SYMBOL_HEIGHT;
      // Para na posição do último símbolo (que é o finalSymbol), mostrando-o na linha central.
      const targetY = -(totalHeight - VISIBLE_OFFSET * 2);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, strip]);

  return (
    <div
      className={`reel-window relative overflow-hidden rounded-lg w-20 sm:w-24 h-[72px] ${
        isWinning ? "ring-2 ring-casino-gold shadow-gold" : ""
      }`}
      aria-label="reel"
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
    </div>
  );
}
