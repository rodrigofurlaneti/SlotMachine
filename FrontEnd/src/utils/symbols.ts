/**
 * Mantém metadados dos símbolos espelhando o backend (SlotMachine.Domain.Entities.SlotMachine).
 * Usado apenas para visualização — a fonte da verdade do sorteio continua sendo a API.
 */
export interface SymbolMeta {
  face: string;
  payout: number;
  weight: number;
  color: string;
  label: string;
}

export const SYMBOLS: SymbolMeta[] = [
  { face: "🍒", payout: 2, weight: 40, color: "#ff5d6c", label: "Cereja" },
  { face: "🍋", payout: 5, weight: 20, color: "#f5d442", label: "Limão" },
  { face: "🔔", payout: 10, weight: 10, color: "#f5a742", label: "Sino" },
  { face: "💎", payout: 100, weight: 2, color: "#2afad1", label: "Diamante" },
  { face: "❌", payout: 0, weight: 60, color: "#6b6b6b", label: "Vazio" },
];

/** Faces dos símbolos repetidas para a animação de "esteira" de cada reel. */
export const REEL_STRIP: string[] = (() => {
  const strip: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    for (const s of SYMBOLS) {
      // repete proporcional ao peso (mas com no máx 5 por bloco para não explodir o DOM)
      const repeats = Math.max(1, Math.min(5, Math.round(s.weight / 10)));
      for (let r = 0; r < repeats; r += 1) strip.push(s.face);
    }
  }
  return strip;
})();
