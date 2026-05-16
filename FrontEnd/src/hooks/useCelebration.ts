import { useCallback } from "react";
import confetti from "canvas-confetti";

export function useCelebration() {
  const fire = useCallback((kind: "win" | "bigWin" | "jackpot") => {
    if (kind === "win") {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f5c518", "#2afad1", "#ffffff"],
      });
      return;
    }
    if (kind === "bigWin") {
      confetti({
        particleCount: 180,
        spread: 100,
        startVelocity: 50,
        origin: { y: 0.6 },
        colors: ["#f5c518", "#ff2e88", "#2afad1", "#ffffff"],
      });
      return;
    }
    // jackpot — cascata
    const duration = 2500;
    const end = Date.now() + duration;
    const interval = window.setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: 40,
        startVelocity: 60,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: ["#f5c518", "#ff2e88", "#2afad1"],
      });
    }, 200);
  }, []);

  return { fire };
}
