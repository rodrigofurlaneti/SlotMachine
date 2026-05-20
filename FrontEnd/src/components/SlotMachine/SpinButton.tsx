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
      whileHover={!disabled ? { scale: 1.04 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="relative px-10 py-4 rounded-full text-imperial text-2xl gold-text bg-gradient-to-b from-fortune-redLight via-fortune-red to-fortune-redDeep border-2 border-fortune-gold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-imperial"
    >
      <span
        className="pointer-events-none absolute inset-1 rounded-full border border-fortune-gold/60"
        aria-hidden
      />
      <span className="relative z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
        {loading ? "GIRANDO..." : `GIRAR - R$ ${bet.toFixed(2)}`}
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
