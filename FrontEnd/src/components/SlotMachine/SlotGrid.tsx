import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reel } from "./Reel";

interface SlotGridProps {
  /** Resultado de 3x3 (linhas, depois colunas) vindo da API. */
  result: string[][] | null;
  spinning: boolean;
  onAllStopped?: () => void;
}

interface WinAnalysis {
  /** Set de "rowIdx-colIdx" das células que fazem parte de alguma linha vencedora */
  cells: Set<string>;
  /** Índices das linhas horizontais vencedoras */
  horizontalLines: number[];
  /** Diagonal principal ↘: [0][0] - [1][1] - [2][2] */
  mainDiagonal: boolean;
  /** Diagonal secundária ↙: [0][2] - [1][1] - [2][0] */
  antiDiagonal: boolean;
}

function analyzeWins(result: string[][] | null): WinAnalysis {
  const cells = new Set<string>();
  const horizontalLines: number[] = [];
  let mainDiagonal = false;
  let antiDiagonal = false;

  if (!result) return { cells, horizontalLines, mainDiagonal, antiDiagonal };

  // Linhas horizontais
  for (let r = 0; r < 3; r += 1) {
    const row = result[r];
    if (row && row[0] === row[1] && row[1] === row[2] && row[0] !== "🎋") {
      horizontalLines.push(r);
      cells.add(`${r}-0`);
      cells.add(`${r}-1`);
      cells.add(`${r}-2`);
    }
  }

  // Diagonal principal ↘
  const a = result[0]?.[0];
  const b = result[1]?.[1];
  const c = result[2]?.[2];
  if (a && a !== "🎋" && a === b && b === c) {
    mainDiagonal = true;
    cells.add("0-0");
    cells.add("1-1");
    cells.add("2-2");
  }

  // Diagonal secundária ↙
  const d = result[0]?.[2];
  const e = result[1]?.[1];
  const f = result[2]?.[0];
  if (d && d !== "🎋" && d === e && e === f) {
    antiDiagonal = true;
    cells.add("0-2");
    cells.add("1-1");
    cells.add("2-0");
  }

  return { cells, horizontalLines, mainDiagonal, antiDiagonal };
}

/**
 * Renderiza o grid 3×3 do slot. Cada linha horizontal vencedora ganha halo + sweep + label.
 * Cada célula em qualquer combinação vencedora (horizontal ou diagonal) tem pulse/sparkle.
 * Diagonais vencedoras ganham uma linha dourada SVG por cima do grid.
 */
export function SlotGrid({ result, spinning, onAllStopped }: SlotGridProps) {
  const [stoppedCount, setStoppedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lineCoords, setLineCoords] = useState<{
    rows: (readonly [number, number, number, number] | undefined)[];
    main?: readonly [number, number, number, number];
    anti?: readonly [number, number, number, number];
  }>({ rows: [undefined, undefined, undefined] });

  useEffect(() => {
    if (spinning) setStoppedCount(0);
  }, [spinning]);

  useEffect(() => {
    if (stoppedCount === 3 && !spinning) onAllStopped?.();
  }, [stoppedCount, spinning, onAllStopped]);

  const wins = useMemo(() => analyzeWins(result), [result]);

  // Mede os centros das células dos cantos e bordas para desenhar as linhas com precisão.
  useEffect(() => {
    if (spinning || !containerRef.current) {
      setLineCoords({ rows: [undefined, undefined, undefined] });
      return;
    }
    const c = containerRef.current.getBoundingClientRect();
    const center = (key: string) => {
      const el = cellRefs.current[key];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [r.left - c.left + r.width / 2, r.top - c.top + r.height / 2] as const;
    };
    // Esquerda e direita de cada linha horizontal
    const rowEndpoints = [0, 1, 2].map((r) => {
      const left = center(`${r}-0`);
      const right = center(`${r}-2`);
      return left && right
        ? ([left[0], left[1], right[0], right[1]] as const)
        : undefined;
    });
    // Cantos para as diagonais
    const tl = center("0-0");
    const br = center("2-2");
    const tr = center("0-2");
    const bl = center("2-0");
    setLineCoords({
      rows: rowEndpoints,
      main: tl && br ? ([tl[0], tl[1], br[0], br[1]] as const) : undefined,
      anti: tr && bl ? ([tr[0], tr[1], bl[0], bl[1]] as const) : undefined,
    });
  }, [result, spinning]);

  return (
    <div ref={containerRef} className="relative space-y-3">
      {[0, 1, 2].map((rowIdx) => {
        const row = result?.[rowIdx] ?? null;
        const isHorizWin = !spinning && wins.horizontalLines.includes(rowIdx);
        return (
          <motion.div
            key={rowIdx}
            className="relative flex justify-center items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg"
            animate={isHorizWin ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={
              isHorizWin
                ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.25 }
            }
          >
            {/* Halo dourado pulsante atrás da linha horizontal vencedora */}
            <AnimatePresence>
              {isHorizWin && (
                <motion.div
                  key="halo"
                  className="absolute inset-0 -z-10 rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.35, 0.7, 0.35],
                    background: [
                      "radial-gradient(120% 80% at 50% 50%, rgba(245,197,24,0.25) 0%, transparent 70%)",
                      "radial-gradient(140% 90% at 50% 50%, rgba(245,197,24,0.55) 0%, transparent 75%)",
                      "radial-gradient(120% 80% at 50% 50%, rgba(245,197,24,0.25) 0%, transparent 70%)",
                    ],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>

            {/* Raio de luz dourado varrendo a linha horizontal */}
            <AnimatePresence>
              {isHorizWin && (
                <motion.div
                  key="sweep"
                  className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute top-0 bottom-0 w-1/3"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,247,192,0.55) 50%, transparent 100%)",
                      filter: "blur(6px)",
                    }}
                    initial={{ left: "-40%" }}
                    animate={{ left: ["-40%", "120%"] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.4,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {[0, 1, 2].map((colIdx) => {
              const cellKey = `${rowIdx}-${colIdx}`;
              return (
                <div
                  key={cellKey}
                  ref={(el) => {
                    cellRefs.current[cellKey] = el;
                  }}
                >
                  <Reel
                    finalSymbol={row?.[colIdx] ?? null}
                    spinning={spinning}
                    stopDelayMs={rowIdx * 250 + colIdx * 200}
                    onStop={() => {
                      if (rowIdx === 2 && colIdx === 0) setStoppedCount((c) => c + 1);
                      if (rowIdx === 2 && colIdx === 1) setStoppedCount((c) => c + 1);
                      if (rowIdx === 2 && colIdx === 2) setStoppedCount((c) => c + 1);
                    }}
                    isWinning={!spinning && wins.cells.has(cellKey)}
                  />
                </div>
              );
            })}

            {/* Label "WIN!" surgindo à esquerda quando a linha horizontal fecha */}
            <AnimatePresence>
              {isHorizWin && (
                <motion.div
                  key="winlabel"
                  className="absolute -left-2 sm:left-1 top-1/2 -translate-y-1/2 text-display text-xs sm:text-sm gold-text pointer-events-none"
                  initial={{ opacity: 0, x: -20, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1], x: 0, scale: [0.5, 1.2, 1] }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                >
                  WIN!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Overlay SVG com as diagonais vencedoras desenhadas em ouro */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
        aria-hidden
      >
        <defs>
          <filter id="diagGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff7c0" />
            <stop offset="50%" stopColor="#f5c518" />
            <stop offset="100%" stopColor="#fff7c0" />
          </linearGradient>
        </defs>
        <AnimatePresence>
          {/* Linhas horizontais vencedoras */}
          {wins.horizontalLines.map((rowIdx) => {
            const coords = lineCoords.rows[rowIdx];
            if (!coords || spinning) return null;
            return (
              <motion.line
                key={`row-${rowIdx}`}
                x1={coords[0]}
                y1={coords[1]}
                x2={coords[2]}
                y2={coords[3]}
                stroke="url(#goldGradient)"
                strokeWidth={6}
                strokeLinecap="round"
                filter="url(#diagGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0.7, 1, 0.7] }}
                exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeOut", repeat: 0 } }}
                transition={{
                  pathLength: { duration: 0.6, ease: "easeOut" },
                  opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            );
          })}

          {/* Diagonal principal ↘ */}
          {wins.mainDiagonal && lineCoords.main && !spinning && (
            <motion.line
              key="main-diag"
              x1={lineCoords.main[0]}
              y1={lineCoords.main[1]}
              x2={lineCoords.main[2]}
              y2={lineCoords.main[3]}
              stroke="url(#goldGradient)"
              strokeWidth={6}
              strokeLinecap="round"
              filter="url(#diagGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0.7, 1, 0.7] }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeOut", repeat: 0 } }}
              transition={{
                pathLength: { duration: 0.6, ease: "easeOut" },
                opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          )}

          {/* Diagonal secundária ↙ */}
          {wins.antiDiagonal && lineCoords.anti && !spinning && (
            <motion.line
              key="anti-diag"
              x1={lineCoords.anti[0]}
              y1={lineCoords.anti[1]}
              x2={lineCoords.anti[2]}
              y2={lineCoords.anti[3]}
              stroke="url(#goldGradient)"
              strokeWidth={6}
              strokeLinecap="round"
              filter="url(#diagGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0.7, 1, 0.7] }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeOut", repeat: 0 } }}
              transition={{
                pathLength: { duration: 0.6, ease: "easeOut" },
                opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}