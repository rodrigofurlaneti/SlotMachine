import { AnimatePresence, motion } from "framer-motion";
import { formatBRL } from "../../utils/format";

interface WinOverlayProps {
  show: boolean;
  prize: number;
  kind: "win" | "bigWin" | "jackpot";
  onDone?: () => void;
}

const labels: Record<WinOverlayProps["kind"], string> = {
  win: "VOCE GANHOU!",
  bigWin: "GRANDE FORTUNA!",
  jackpot: "JACKPOT IMPERIAL!",
};

const COIN_COUNT = 12;

export function WinOverlay({ show, prize, kind, onDone }: WinOverlayProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-fortune-redDeep/70 backdrop-blur-sm pointer-events-none"
        >
          <motion.div
            className="absolute"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.2, 1], opacity: [0, 0.75, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{
              width: 520,
              height: 520,
              background:
                "radial-gradient(circle at center, rgba(245,197,24,0.45) 0%, rgba(255,46,74,0.25) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          <motion.div
            initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="relative text-center"
          >
            <div
              className={`text-imperial text-5xl sm:text-7xl imperial-text drop-shadow-[0_4px_30px_rgba(245,197,24,0.85)] ${
                kind !== "win" ? "animate-marquee" : ""
              }`}
            >
              {labels[kind]}
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-3xl sm:text-4xl gold-text tabular-nums"
            >
              {`+ ${formatBRL(prize)}`}
            </motion.div>
            {kind !== "win" &&
              Array.from({ length: COIN_COUNT }).map((_, i) => {
                const angle = (i / COIN_COUNT) * Math.PI * 2;
                const distance = 180 + Math.random() * 80;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance;
                return (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2 text-3xl pointer-events-none"
                    style={{ marginLeft: -12, marginTop: -12 }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
                    animate={{
                      x: dx,
                      y: dy,
                      opacity: [0, 1, 1, 0],
                      scale: [0.2, 1.1, 1, 0.7],
                      rotate: 720,
                    }}
                    transition={{
                      duration: 1.6,
                      delay: 0.1 + i * 0.04,
                      ease: "easeOut",
                    }}
                  >
                    {"\u{1FA99}"}
                  </motion.span>
                );
              })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
