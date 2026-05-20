import { useCallback } from "react";
import confetti from "canvas-confetti";

const FORTUNE_COLORS = ["#f5c518", "#fff2a8", "#c8102e", "#ff3651", "#3ddc97"];

export function useCelebration() {
  const fire = useCallback((kind: "win" | "bigWin" | "jackpot") => {
    if (kind === "win") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: FORTUNE_COLORS,
        scalar: 1,
      });
      return;
    }
    if (kind === "bigWin") {
      confetti({
        particleCount: 220,
        spread: 110,
        startVelocity: 55,
        origin: { y: 0.6 },
        colors: FORTUNE_COLORS,
        scalar: 1.1,
      });
      window.setTimeout(() => {
        confetti({
          particleCount: 120,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors: FORTUNE_COLORS,
        });
        confetti({
          particleCount: 120,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors: FORTUNE_COLORS,
        });
      }, 180);
      return;
    }
    const duration = 2500;
    const end = Date.now() + duration;
    const interval = window.setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: 50,
        startVelocity: 60,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: FORTUNE_COLORS,
        scalar: 1.2,
      });
      confetti({
        particleCount: 20,
        spread: 90,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.55 },
        colors: ["#f5c518", "#fff2a8"],
        scalar: 1.4,
      });
    }, 220);
  }, []);

  return { fire };
}
