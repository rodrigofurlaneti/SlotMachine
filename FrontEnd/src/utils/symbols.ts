/**
 * Mantem metadados dos simbolos espelhando o backend.
 * Tema "Fortune" oriental:
 *   Tigre    - multiplicador  2x  (peso 40)
 *   Moeda    - multiplicador  5x  (peso 20)
 *   Lanterna - multiplicador 10x  (peso 10)
 *   Dragao   - multiplicador 100x (peso  2)
 *   Bambu    - vazio          0x  (peso 60)
 */
export interface SymbolMeta {
  face: string;
  payout: number;
  weight: number;
  color: string;
  label: string;
}

export const BLANK_FACE = "\u{1F38B}"; // bambu
export const TOP_FACE = "\u{1F409}";   // dragao

export const SYMBOLS: SymbolMeta[] = [
  { face: "\u{1F42F}", payout: 2,   weight: 40, color: "#ff6b3d", label: "Tigre" },
  { face: "\u{1FA99}", payout: 5,   weight: 20, color: "#f5c518", label: "Moeda" },
  { face: "\u{1F3EE}", payout: 10,  weight: 10, color: "#ff2e4a", label: "Lanterna" },
  { face: "\u{1F409}", payout: 100, weight: 2,  color: "#3ddc97", label: "Dragao" },
  { face: "\u{1F38B}", payout: 0,   weight: 60, color: "#6b6b6b", label: "Bambu" },
];

export const REEL_STRIP: string[] = (() => {
  const strip: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    for (const s of SYMBOLS) {
      const repeats = Math.max(1, Math.min(5, Math.round(s.weight / 10)));
      for (let r = 0; r < repeats; r += 1) strip.push(s.face);
    }
  }
  return strip;
})();
