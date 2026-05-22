import { motion } from "framer-motion";

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  bet: number;
  fullWidth?: boolean;
}

export function SpinButton({ onClick, disabled, loading, bet, fullWidth }: SpinButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative text-imperial text-xl gold-text bg-gradient-to-b from-fortune-redLight via-fortune-red to-fortune-redDeep border-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        fullWidth
          ? "w-full h-full py-4 rounded-none"
          : "px-10 py-4 rounded-full border-2 border-fortune-gold shadow-imperial",
      ].join(" ")}
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
