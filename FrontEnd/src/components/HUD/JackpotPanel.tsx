import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { formatBRL } from "../../utils/format";

interface JackpotPanelProps {
  /** Valor atual do pote acumulado (R$). */
  pot: number;
  /** Flag para disparar a animacao de "WIN" quando ganhou o jackpot. */
  justWon?: boolean;
}

/**
 * Marquise dourada persistente que mostra o pote acumulado.
 * - Brilho pulsante constante.
 * - Quando o valor muda, dispara micro-animacao de "tilt".
 * - Quando justWon=true, fica em vermelho/dourado piscando.
 */
export function JackpotPanel({ pot, justWon }: JackpotPanelProps) {
  const prevPot = useRef(pot);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (pot !== prevPot.current) {
      prevPot.current = pot;
      setBump((b) => b + 1);
    }
  }, [pot]);

  return (
    <motion.div
      className={[
        "relative mx-auto mb-4 max-w-2xl rounded-2xl border-2 px-4 py-3",
        "flex items-center justify-between gap-3",
        justWon
          ? "border-fortune-redLight bg-gradient-to-r from-fortune-redDeep via-fortune-red to-fortune-redDeep shadow-imperial animate-marquee"
          : "border-fortune-gold/80 bg-gradient-to-r from-fortune-redDeep via-[#3a0a14] to-fortune-redDeep shadow-imperial pulse-gold",
      ].join(" ")}
      initial={false}
      animate={justWon ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{
        duration: justWon ? 0.8 : 0.4,
        repeat: justWon ? 3 : 0,
        ease: "easeInOut",
      }}
    >
      <div className="flex items-center gap-2">
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, -8, 8, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
          aria-hidden
        >
          {"\u{1F451}"}
        </motion.span>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-fortune-goldLight/80">
            Jackpot Imperial
          </div>
          <div className="text-[9px] tracking-widest text-fortune-jade/70 uppercase">
            5 envelopes {"\u{1F9E7}"} em linha pagam tudo
          </div>
        </div>
      </div>
      <motion.div
        key={bump}
        initial={{ scale: 1.18, rotate: -2, opacity: 0.6 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="text-2xl sm:text-3xl text-imperial imperial-text tabular-nums"
      >
        {formatBRL(pot)}
      </motion.div>
    </motion.div>
  );
}
