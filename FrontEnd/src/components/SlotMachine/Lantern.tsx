interface LanternProps {
  /** Tamanho em px da lanterna. */
  size?: number;
  /** Aplica delay nas animações pra duas lanternas não ficarem sincronizadas. */
  delayed?: boolean;
}

/**
 * Lanterna chinesa estilizada em SVG, com balanço suave e brilho pulsante.
 * Usada como ornamento nas laterais do cabinet.
 */
export function Lantern({ size = 56, delayed = false }: LanternProps) {
  return (
    <span
      aria-hidden
      className={`lantern ${delayed ? "delay-1" : ""}`}
      style={{ width: size, height: size * 1.4, display: "inline-block" }}
    >
      <svg
        viewBox="0 0 60 84"
        width={size}
        height={size * 1.4}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cordão superior */}
        <line x1="30" y1="0" x2="30" y2="10" stroke="#f5c518" strokeWidth="2" />
        {/* Tampa de cima dourada */}
        <ellipse cx="30" cy="14" rx="14" ry="4" fill="#f5c518" stroke="#a8860f" strokeWidth="1" />
        {/* Corpo da lanterna */}
        <ellipse
          cx="30"
          cy="44"
          rx="22"
          ry="26"
          fill="url(#lanternBody)"
          stroke="#f5c518"
          strokeWidth="2"
        />
        {/* Faixas verticais */}
        <path d="M 12 44 Q 30 50 48 44" stroke="#a8860f" strokeWidth="1.2" fill="none" />
        <path d="M 14 32 Q 30 38 46 32" stroke="#a8860f" strokeWidth="1" fill="none" />
        <path d="M 14 56 Q 30 62 46 56" stroke="#a8860f" strokeWidth="1" fill="none" />
        {/* Tampa de baixo dourada */}
        <ellipse cx="30" cy="72" rx="13" ry="3.5" fill="#f5c518" stroke="#a8860f" strokeWidth="1" />
        {/* Borla pendurada */}
        <line x1="30" y1="75" x2="30" y2="82" stroke="#f5c518" strokeWidth="2" />
        <circle cx="30" cy="82" r="2" fill="#f5c518" />
        {/* Caractere dourado central — "福" (sorte/fortuna) estilizado como ★ */}
        <text
          x="30"
          y="50"
          textAnchor="middle"
          fontSize="16"
          fontFamily="'Cinzel', serif"
          fontWeight="800"
          fill="#f5c518"
          style={{ filter: "drop-shadow(0 0 4px rgba(245,197,24,0.8))" }}
        >
          福
        </text>
        <defs>
          <radialGradient id="lanternBody" cx="0.5" cy="0.5" r="0.65">
            <stop offset="0%" stopColor="#ff8a5a" />
            <stop offset="55%" stopColor="#ff2e4a" />
            <stop offset="100%" stopColor="#7a0a1c" />
          </radialGradient>
        </defs>
      </svg>
    </span>
  );
}
