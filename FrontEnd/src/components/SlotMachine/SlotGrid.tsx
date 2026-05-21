import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reel } from "./Reel";
import { useGameStore } from "../../store/gameStore";

interface SlotGridProps {
  result: string[][] | null;
  spinning: boolean;
  onAllStopped?: () => void;
}

const GRID_SIZE = 4;
const BLANK = "\u{1F38B}"; // bambu

interface WinAnalysis {
  cells: Set<string>;
  horizontalLines: number[];
  verticalLines: number[];
  mainDiagonal: boolean;
  antiDiagonal: boolean;
}

function allEqualAndNotBlank(arr: (string | undefined)[]): boolean {
  if (arr.length < GRID_SIZE) return false;
  const first = arr[0];
  if (!first || first === BLANK) return false;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== first) return false;
  }
  return true;
}

function analyzeWins(result: string[][] | null): WinAnalysis {
  const cells = new Set<string>();
  const horizontalLines: number[] = [];
  const verticalLines: number[] = [];
  let mainDiagonal = false;
  let antiDiagonal = false;

  if (!result) return { cells, horizontalLines, verticalLines, mainDiagonal, antiDiagonal };

  // Horizontais
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = result[r];
    if (row && allEqualAndNotBlank(row)) {
      horizontalLines.push(r);
      for (let c = 0; c < GRID_SIZE; c++) cells.add(`${r}-${c}`);
    }
  }

  // Verticais
  for (let c = 0; c < GRID_SIZE; c++) {
    const col = [0, 1, 2, 3].map((r) => result[r]?.[c]);
    if (allEqualAndNotBlank(col)) {
      verticalLines.push(c);
      for (let r = 0; r < GRID_SIZE; r++) cells.add(`${r}-${c}`);
    }
  }

  // Diagonal principal
  const mainArr = [0, 1, 2, 3].map((i) => result[i]?.[i]);
  if (allEqualAndNotBlank(mainArr)) {
    mainDiagonal = true;
    for (let i = 0; i < GRID_SIZE; i++) cells.add(`${i}-${i}`);
  }

  // Diagonal secundária
  const antiArr = [0, 1, 2, 3].map((i) => result[i]?.[GRID_SIZE - 1 - i]);
  if (allEqualAndNotBlank(antiArr)) {
    antiDiagonal = true;
    for (let i = 0; i < GRID_SIZE; i++) cells.add(`${i}-${GRID_SIZE - 1 - i}`);
  }

  return { cells, horizontalLines, verticalLines, mainDiagonal, antiDiagonal };
}

type LineCoords = readonly [number, number, number, number];

export function SlotGrid({ result, spinning, onAllStopped }: SlotGridProps) {
  const [stoppedCount, setStoppedCount] = useState(0);
  const turbo = useGameStore((s) => s.turboMode);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lineCoords, setLineCoords] = useState<{
    rows: (LineCoords | undefined)[];
    cols: (LineCoords | undefined)[];
    main?: LineCoords;
    anti?: LineCoords;
  }>({
    rows: [undefined, undefined, undefined, undefined],
    cols: [undefined, undefined, undefined, undefined],
  });

  useEffect(() => {
    if (spinning) setStoppedCount(0);
  }, [spinning]);

  useEffect(() => {
    if (stoppedCount === GRID_SIZE && !spinning) onAllStopped?.();
  }, [stoppedCount, spinning, onAllStopped]);

  const EMPTY_WINS: WinAnalysis = {
    cells: new Set<string>(),
    horizontalLines: [],
    verticalLines: [],
    mainDiagonal: false,
    antiDiagonal: false,
  };
  const wins = useMemo(
    () => (spinning || !result ? EMPTY_WINS : analyzeWins(result)),
    [result, spinning]
  );

  // Chave que muda a cada novo resultado/giro — forca o AnimatePresence das
  // linhas SVG a desmontar tudo entre rodadas, eliminando o bug visual
  // onde a linha dourada anterior persistia ao iniciar o proximo giro.
  const winKey = useMemo(() => {
    if (spinning || !result) return "spinning";
    return result.flat().join("|");
  }, [result, spinning]);

  useEffect(() => {
    if (spinning || !containerRef.current) {
      setLineCoords({
        rows: [undefined, undefined, undefined, undefined],
        cols: [undefined, undefined, undefined, undefined],
      });
      return;
    }
    const c = containerRef.current.getBoundingClientRect();
    const center = (key: string): [number, number] | null => {
      const el = cellRefs.current[key];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [r.left - c.left + r.width / 2, r.top - c.top + r.height / 2];
    };

    const rowEndpoints: (LineCoords | undefined)[] = [0, 1, 2, 3].map((r) => {
      const left = center(`${r}-0`);
      const right = center(`${r}-${GRID_SIZE - 1}`);
      return left && right
        ? ([left[0], left[1], right[0], right[1]] as const)
        : undefined;
    });

    const colEndpoints: (LineCoords | undefined)[] = [0, 1, 2, 3].map((c) => {
      const top = center(`0-${c}`);
      const bot = center(`${GRID_SIZE - 1}-${c}`);
      return top && bot
        ? ([top[0], top[1], bot[0], bot[1]] as const)
        : undefined;
    });

    const tl = center("0-0");
    const br = center(`${GRID_SIZE - 1}-${GRID_SIZE - 1}`);
    const tr = center(`0-${GRID_SIZE - 1}`);
    const bl = center(`${GRID_SIZE - 1}-0`);

    setLineCoords({
      rows: rowEndpoints,
      cols: colEndpoints,
      main: tl && br ? ([tl[0], tl[1], br[0], br[1]] as const) : undefined,
      anti: tr && bl ? ([tr[0], tr[1], bl[0], bl[1]] as const) : undefined,
    });
  }, [result, spinning]);

  return (
    <div ref={containerRef} className="relative space-y-2 sm:space-y-3">
      {[0, 1, 2, 3].map((rowIdx) => {
        const row = result?.[rowIdx] ?? null;
        const isHorizWin = !spinning && wins.horizontalLines.includes(rowIdx);
        return (
          <motion.div
            key={rowIdx}
            className="relative flex justify-center items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-lg"
            animate={isHorizWin ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={
              isHorizWin
                ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.25 }
            }
          >
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

            {[0, 1, 2, 3].map((colIdx) => {
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
                    stopDelayMs={turbo ? rowIdx * 60 + colIdx * 50 : rowIdx * 200 + colIdx * 160}
                    onStop={() => {
                      // Conta o ultimo reel de cada linha para saber quando todos pararam
                      if (rowIdx === GRID_SIZE - 1) {
                        setStoppedCount((c) => c + 1);
                      }
                    }}
                    isWinning={!spinning && wins.cells.has(cellKey)}
                  />
                </div>
              );
            })}
          </motion.div>
        );
      })}

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
        <AnimatePresence key={winKey}>
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
                exit={{ opacity: 0 }}
                transition={{
                  pathLength: { duration: 0.6, ease: "easeOut" },
                  opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            );
          })}

          {wins.verticalLines.map((colIdx) => {
            const coords = lineCoords.cols[colIdx];
            if (!coords || spinning) return null;
            return (
              <motion.line
                key={`col-${colIdx}`}
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
                exit={{ opacity: 0 }}
                transition={{
                  pathLength: { duration: 0.6, ease: "easeOut" },
                  opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            );
          })}

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
              exit={{ opacity: 0 }}
              transition={{
                pathLength: { duration: 0.6, ease: "easeOut" },
                opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          )}

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
              exit={{ opacity: 0 }}
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
