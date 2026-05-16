import { motion } from "framer-motion";

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  bet: number;
}

export function SpinButton({ onClick, disabled, loading, bet }: SpinButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="relative px-10 py-4 rounded-full text-display text-2xl gold-text bg-gradient-to-b from-casino-rim to-black border-2 border-casino-gold shadow-gold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      <span className="relative z-10">
        {loading ? "GIRANDO..." : `GIRAR · R$ ${bet.toFixed(2)}`}
      </span>
      {!disabled && (
        <span
          className="absolute inset-0 shimmer animate-shimmer pointer-events-none"
          aria-hidden
        />
      )}
    </motion.button>
  );
}
