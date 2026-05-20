import { motion } from "framer-motion";
import { BET_PRESETS } from "../../store/gameStore";
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
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs uppercase tracking-widest text-fortune-goldLight/80">
          Aposta por giro
        </span>
        <span className="text-sm font-display gold-text">
          {formatBRL(value)}
          <span className="ml-2 text-fortune-jade/80 normal-case font-body text-xs">
            ({betLabelEn(value)})
          </span>
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Selecionar valor da aposta"
        className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3"
      >
        {BET_PRESETS.map((preset) => {
          const isSelected = Math.abs(preset - value) < 0.001;
          const tooExpensive =
            typeof balance === "number" && balance < preset;

          return (
            <motion.button
              key={preset}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(preset)}
              whileTap={!disabled ? { scale: 0.9 } : undefined}
              whileHover={!disabled && !isSelected ? { scale: 1.04 } : undefined}
              className={[
                "relative select-none rounded-2xl px-2 py-3 min-h-[68px]",
                "flex flex-col items-center justify-center",
                "border-2 transition-colors",
                "font-display",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-fortune-gold",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected
                  ? "bg-gradient-to-b from-fortune-gold/90 to-fortune-goldDeep text-black border-fortune-gold shadow-imperial"
                  : tooExpensive
                  ? "bg-fortune-redDeep/40 text-neutral-500 border-white/5"
                  : "bg-fortune-redDeep/60 text-fortune-gold border-fortune-redDeep hover:border-fortune-gold/60 hover:bg-fortune-redDeep/80",
              ].join(" ")}
            >
              <span className="text-[10px] uppercase tracking-widest opacity-70">
                R$
              </span>
              <span className="leading-none text-base sm:text-lg">
                {preset.toLocaleString("pt-BR", {
                  minimumFractionDigits: preset < 1 ? 2 : 0,
                })}
              </span>
              <span
                className={`text-[9px] mt-0.5 uppercase tracking-wider font-body ${
                  isSelected ? "text-black/70" : "text-fortune-jade/80"
                }`}
              >
                {betLabelEn(preset)}
              </span>
              {tooExpensive && (
                <span
                  className="absolute inset-x-1 -bottom-1 text-[9px] text-fortune-redLight"
                  aria-hidden
                >
                  sem saldo
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
