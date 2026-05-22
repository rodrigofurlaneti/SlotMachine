import { motion } from "framer-motion";
import { BET_PRESETS, MAX_BET_AMOUNT, clampBet } from "../../store/gameStore";
import { formatBRL } from "../../utils/format";
import { betLabelEn } from "../../audio/audioEngine";

interface BetSelectorProps {
  value: number;
  onChange: (bet: number) => void;
  disabled?: boolean;
  balance?: number;
}

export function BetSelector({
  value,
  onChange,
  disabled = false,
  balance,
}: BetSelectorProps) {
  const currentIndex = BET_PRESETS.findIndex((p) => Math.abs(p - value) < 0.001);

  const goLeft = () => {
    if (disabled) return;
    const idx = currentIndex > 0 ? currentIndex - 1 : BET_PRESETS.length - 1;
    onChange(BET_PRESETS[idx]);
  };

  const goRight = () => {
    if (disabled) return;
    const idx = currentIndex < BET_PRESETS.length - 1 ? currentIndex + 1 : 0;
    onChange(BET_PRESETS[idx]);
  };

  const setMax = () => {
    if (!disabled) onChange(MAX_BET_AMOUNT);
  };

  const doubleBet = () => {
    if (!disabled) onChange(clampBet(value * 2));
  };

  const tooExpensive = typeof balance === "number" && balance < value;

  return (
    <div className="w-full space-y-2">
      {/* Header: label + 2X + MAX */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-widest text-fortune-goldLight/70">
          Aposta por giro
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || value * 2 > MAX_BET_AMOUNT}
            onClick={doubleBet}
            className="text-[9px] font-display tracking-widest px-2 py-0.5 rounded border border-fortune-gold/50 text-fortune-gold hover:bg-fortune-gold/15 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            2X
          </button>
          <button
            type="button"
            disabled={disabled || Math.abs(value - MAX_BET_AMOUNT) < 0.001}
            onClick={setMax}
            className="text-[9px] font-display tracking-widest px-2 py-0.5 rounded border border-fortune-jade/50 text-fortune-jade hover:bg-fortune-jade/15 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Seletor principal: ← [chips] → */}
      <div className="flex items-center gap-2">
        {/* Seta esquerda */}
        <button
          type="button"
          disabled={disabled}
          onClick={goLeft}
          aria-label="Aposta anterior"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full border-2 border-fortune-gold/50 text-fortune-gold hover:bg-fortune-gold/15 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-90"
        >
          ‹
        </button>

        {/* Faixa de chips — mostra janela de 5 centrada no selecionado */}
        <div className="flex-1 overflow-hidden">
          <div
            role="radiogroup"
            aria-label="Selecionar valor da aposta"
            className="flex gap-1.5 justify-center"
          >
            {BET_PRESETS.map((preset, idx) => {
              const isSelected = Math.abs(preset - value) < 0.001;
              const tooExp = typeof balance === "number" && balance < preset;
              // Só mostra os 5 chips mais próximos do selecionado
              const diff = Math.abs(idx - currentIndex);
              if (diff > 2) return null;

              const distScale = diff === 0 ? 1 : diff === 1 ? 0.88 : 0.74;
              const distOpacity = diff === 0 ? 1 : diff === 1 ? 0.75 : 0.45;

              return (
                <motion.button
                  key={preset}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={disabled}
                  onClick={() => onChange(preset)}
                  whileTap={!disabled ? { scale: 0.88 } : undefined}
                  animate={{ scale: distScale, opacity: distOpacity }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className={[
                    "relative select-none rounded-2xl flex flex-col items-center justify-center",
                    "border-2 transition-colors font-display",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-fortune-gold",
                    "disabled:cursor-not-allowed",
                    isSelected
                      ? "bg-gradient-to-b from-fortune-gold/90 to-fortune-goldDeep text-black border-fortune-gold shadow-imperial w-16 h-14"
                      : tooExp
                      ? "bg-fortune-redDeep/30 text-neutral-600 border-white/5 w-14 h-12"
                      : "bg-fortune-redDeep/60 text-fortune-gold border-fortune-redDeep hover:border-fortune-gold/50 w-14 h-12",
                  ].join(" ")}
                >
                  <span className="text-[8px] uppercase tracking-widest opacity-60">R$</span>
                  <span className={`leading-none font-bold ${isSelected ? "text-base" : "text-sm"}`}>
                    {preset.toLocaleString("pt-BR", {
                      minimumFractionDigits: preset < 1 ? 2 : 0,
                    })}
                  </span>
                  <span
                    className={`text-[8px] mt-0.5 uppercase tracking-wider font-body ${
                      isSelected ? "text-black/60" : "text-fortune-jade/70"
                    }`}
                  >
                    {betLabelEn(preset)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Seta direita */}
        <button
          type="button"
          disabled={disabled}
          onClick={goRight}
          aria-label="Próxima aposta"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full border-2 border-fortune-gold/50 text-fortune-gold hover:bg-fortune-gold/15 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-90"
        >
          ›
        </button>
      </div>

      {/* Valor atual em destaque */}
      <div className="text-center">
        <span
          className={`text-base font-display gold-text ${
            tooExpensive ? "opacity-50" : ""
          }`}
        >
          {formatBRL(value)}
        </span>
        {tooExpensive && (
          <span className="ml-2 text-[10px] text-fortune-redLight">saldo insuficiente</span>
        )}
      </div>
    </div>
  );
}
