import { useMemo } from "react";

interface FortuneRainProps {
  /** Quantidade de pétalas (default 14). Use baixo pra não pesar. */
  petalCount?: number;
  /** Quantidade de moedas douradas (default 6). */
  coinCount?: number;
}

interface Particle {
  id: string;
  left: number;       // %
  delay: number;      // s
  duration: number;   // s
  size: number;       // px
  glyph: string;
}

const PETAL_GLYPHS = ["🌸", "🌺", "🍃"];
const COIN_GLYPHS = ["🪙", "💰", "🟡"];

function build(n: number, glyphs: string[], minDur: number, maxDur: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${glyphs[i % glyphs.length]}-${i}`,
    left: Math.random() * 100,
    delay: Math.random() * maxDur,
    duration: minDur + Math.random() * (maxDur - minDur),
    size: 14 + Math.round(Math.random() * 14),
    glyph: glyphs[i % glyphs.length],
  }));
}

/**
 * Camada fixa de fundo que faz pétalas e moedas douradas caírem lentamente
 * durante toda a sessão de jogo. Animado por CSS (keyframes petalFall / coinFall),
 * portanto roda na GPU sem custo de re-render.
 */
export function FortuneRain({ petalCount = 14, coinCount = 6 }: FortuneRainProps) {
  const petals = useMemo(() => build(petalCount, PETAL_GLYPHS, 8, 16), [petalCount]);
  const coins = useMemo(() => build(coinCount, COIN_GLYPHS, 10, 18), [coinCount]);

  return (
    <div className="fortune-rain" aria-hidden>
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.glyph}
        </span>
      ))}
      {coins.map((c) => (
        <span
          key={c.id}
          className="coin"
          style={{
            left: `${c.left}%`,
            fontSize: c.size + 4,
            animationDelay: `-${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        >
          {c.glyph}
        </span>
      ))}
    </div>
  );
}
