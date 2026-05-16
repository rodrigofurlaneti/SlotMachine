import { AnimatePresence, motion } from "framer-motion";
import { formatBRL } from "../../utils/format";

interface WinOverlayProps {
  show: boolean;
  prize: number;
  kind: "win" | "bigWin" | "jackpot";
  onDone?: () => void;
}

const labels: Record<WinOverlayProps["kind"], string> = {
  win: "VOCÊ GANHOU!",
  bigWin: "BIG WIN!",
  jackpot: "JACKPOT!",
};

export function WinOverlay({ show, prize, kind, onDone }: WinOverlayProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="text-center"
          >
            <div
              className={`text-display text-5xl sm:text-7xl gold-text drop-shadow-[0_4px_30px_rgba(245,197,24,0.7)] ${
                kind !== "win" ? "animate-marquee" : ""
              }`}
            >
              {labels[kind]}
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-3xl sm:text-4xl text-casino-neonCyan tabular-nums"
            >
              {formatBRL(prize)}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
