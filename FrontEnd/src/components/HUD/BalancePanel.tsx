import { motion } from "framer-motion";
import { formatBRL } from "../../utils/format";

interface BalancePanelProps {
  balance: number;
  lastPrize: number | null;
}

export function BalancePanel({ balance, lastPrize }: BalancePanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      <div className="relative bg-gradient-to-b from-fortune-redDeep to-fortune-ink rounded-xl border-2 border-fortune-gold/60 p-3 shadow-imperial">
        <div className="text-xs uppercase tracking-widest text-fortune-goldLight/80">
          Saldo
        </div>
        <motion.div
          key={balance}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold gold-text tabular-nums"
        >
          {formatBRL(balance)}
        </motion.div>
      </div>
      <div className="relative bg-gradient-to-b from-fortune-redDeep to-fortune-ink rounded-xl border-2 border-fortune-jade/40 p-3">
        <div className="text-xs uppercase tracking-widest text-fortune-goldLight/80">
          Ultimo premio
        </div>
        <div
          className={`text-2xl font-bold tabular-nums ${
            lastPrize && lastPrize > 0 ? "text-fortune-jade" : "text-neutral-400"
          }`}
        >
          {lastPrize !== null ? formatBRL(lastPrize) : "-"}
        </div>
      </div>
    </div>
  );
}
