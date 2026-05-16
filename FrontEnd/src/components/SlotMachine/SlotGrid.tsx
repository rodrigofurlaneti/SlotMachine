import { useEffect, useState } from "react";
import { Reel } from "./Reel";

interface SlotGridProps {
  /** Resultado de 3x3 (linhas, depois colunas) vindo da API. */
  result: string[][] | null;
  spinning: boolean;
  onAllStopped?: () => void;
}

/**
 * O backend retorna 3 linhas com 3 símbolos cada. Como na UI cada coluna é um reel,
 * transpomos para 3 colunas, e cada coluna mostra seu símbolo final (o do meio).
 */
export function SlotGrid({ result, spinning, onAllStopped }: SlotGridProps) {
  const [stoppedCount, setStoppedCount] = useState(0);

  useEffect(() => {
    if (spinning) setStoppedCount(0);
  }, [spinning]);

  useEffect(() => {
    if (stoppedCount === 3 && !spinning) onAllStopped?.();
  }, [stoppedCount, spinning, onAllStopped]);

  // Linha vencedora detectada (3 iguais e diferente de ❌)
  const winningLines = result
    ? result
        .map((row, i) => ({ i, win: row[0] === row[1] && row[1] === row[2] && row[0] !== "❌" }))
        .filter((r) => r.win)
        .map((r) => r.i)
    : [];

  // Mostra as 3 linhas como 3 visualizações horizontais separadas — uma das mais fiéis ao
  // formato 3-line slot do backend.
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((rowIdx) => {
        const row = result?.[rowIdx] ?? null;
        const isWin = winningLines.includes(rowIdx);
        return (
          <div
            key={rowIdx}
            className={`flex justify-center gap-2 sm:gap-3 px-3 py-2 rounded-lg transition ${
              isWin && !spinning ? "bg-casino-gold/10" : ""
            }`}
          >
            {[0, 1, 2].map((colIdx) => (
              <Reel
                key={`${rowIdx}-${colIdx}`}
                finalSymbol={row?.[colIdx] ?? null}
                spinning={spinning}
                stopDelayMs={rowIdx * 250 + colIdx * 200}
                onStop={() => {
                  // só conta o "stop" do reel da última linha pra detectar fim total
                  if (rowIdx === 2 && colIdx === 2) setStoppedCount((c) => c + 1);
                  if (rowIdx === 2 && colIdx === 0) setStoppedCount((c) => c + 1);
                  if (rowIdx === 2 && colIdx === 1) setStoppedCount((c) => c + 1);
                }}
                isWinning={isWin && !spinning}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
