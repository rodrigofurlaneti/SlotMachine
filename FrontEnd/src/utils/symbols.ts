/**
 * Mantem metadados dos simbolos espelhando o backend (.NET).
 *
 * Calibragem atual: Casa lucra ~25% (RTP ~75%, alta volatilidade).
 * Pesos somam 100 (= probabilidade direta em %).
 *
 *   Tigre    - multiplicador  3x  (peso 35) - comum, pequenas vitorias
 *   Moeda    - multiplicador  6x  (peso 23) - medio
 *   Lanterna - multiplicador 35x  (peso 13) - alto, vitorias emocionantes
 *   Dragao   - multiplicador 600x (peso  4) - topo, premio raro grande
 *   Bambu    - vazio          0x  (peso 22) - filler vazio
 *
 * (Hongbao fica fora desta lista porque so dispara o jackpot.)
 */
export interface SymbolMeta {
  face: string;
  payout: number;
  weight: number;
  color: string;
  label: string;
}

export const BLANK_FACE = "\u{1F38B}";
export const TOP_FACE = "\u{1F409}";

export const SYMBOLS: SymbolMeta[] = [
  { face: "\u{1F42F}", payout: 3,   weight: 35, color: "#ff6b3d", label: "Tigre" },
  { face: "\u{1FA99}", payout: 6,   weight: 23, color: "#f5c518", label: "Moeda" },
  { face: "\u{1F3EE}", payout: 35,  weight: 13, color: "#ff2e4a", label: "Lanterna" },
  { face: "\u{1F409}", payout: 600, weight: 4,  color: "#3ddc97", label: "Dragao" },
  { face: "\u{1F38B}", payout: 0,   weight: 22, color: "#6b6b6b", label: "Bambu" },
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
