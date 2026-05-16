import { motion } from "framer-motion";
import { formatBRL } from "../../utils/format";

interface BalancePanelProps {
  balance: number;
  lastPrize: number | null;
}

export function BalancePanel({ balance, lastPrize }: BalancePanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      <div className="bg-casino-panel rounded-xl border border-casino-gold/30 p-3">
        <div className="text-xs uppercase tracking-widest text-neutral-400">Saldo</div>
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
      <div className="bg-casino-panel rounded-xl border border-casino-neon/30 p-3">
        <div className="text-xs uppercase tracking-widest text-neutral-400">Último prêmio</div>
        <div
          className={`text-2xl font-bold tabular-nums ${
            lastPrize && lastPrize > 0 ? "text-casino-neonCyan" : "text-neutral-500"
          }`}
        >
          {lastPrize !== null ? formatBRL(lastPrize) : "—"}
        </div>
      </div>
    </div>
  );
}
