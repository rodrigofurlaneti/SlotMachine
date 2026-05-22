/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        casino: {
          bg: "#1a0606",
          panel: "#2a0a0a",
          felt: "#0f3d2e",
          gold: "#f5c518",
          goldDark: "#a8860f",
          neon: "#ff2e88",
          neonCyan: "#2afad1",
          rim: "#4a1010",
        },
        // Paleta "Fortune" oriental — vermelho lacre + dourado imperial
        fortune: {
          red: "#d41230",       // vermelho lacre mais vivo (era #c8102e)
          redDeep: "#6b0818",   // sombra vinho escura
          redLight: "#ff3651",  // vermelho destaque / alertas
          gold: "#f5c518",      // dourado base
          goldLight: "#fff2a8", // dourado claro de highlight
          goldDeep: "#7a5e08",  // sombra dourada
          jade: "#3ddc97",      // verde jade
          ink: "#1a0005",       // fundo preto-avermelhado
        },
      },
      boxShadow: {
        gold: "0 0 24px rgba(245,197,24,0.55), inset 0 0 12px rgba(245,197,24,0.4)",
        neon: "0 0 18px rgba(255,46,136,0.7), 0 0 36px rgba(255,46,136,0.4)",
        reel: "inset 0 8px 16px rgba(0,0,0,0.7), inset 0 -8px 16px rgba(0,0,0,0.7)",
        lantern: "0 0 24px rgba(255,90,90,0.6), 0 0 60px rgba(255,90,90,0.3)",
        imperial: "0 0 40px rgba(245,197,24,0.45), inset 0 0 22px rgba(122,10,28,0.7)",
      },
      fontFamily: {
        display: ["'Bungee'", "'Impact'", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.9)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bigwin: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        goldPulse: {
          "0%, 100%": {
            boxShadow:
              "0 0 0 1px #2a0808, 0 0 0 4px rgba(245,197,24,0.75), 0 0 0 5px #1e0408, 0 0 40px rgba(245,197,24,0.4), inset 0 0 24px rgba(100,6,18,0.8)",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px #2a0808, 0 0 0 4px rgba(245,197,24,1), 0 0 0 5px #1e0408, 0 0 70px rgba(245,197,24,0.7), 0 0 120px rgba(200,16,46,0.4), inset 0 0 30px rgba(100,6,18,0.9)",
          },
        },
        lanternSway: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        lanternGlow: {
          "0%, 100%": {
            filter: "drop-shadow(0 0 8px rgba(255,90,90,0.6))",
            opacity: "0.9",
          },
          "50%": {
            filter: "drop-shadow(0 0 18px rgba(255,140,90,0.9))",
            opacity: "1",
          },
        },
        petalFall: {
          "0%": { transform: "translateY(-10vh) translateX(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "0.9" },
          "100%": {
            transform: "translateY(110vh) translateX(40px) rotate(360deg)",
            opacity: "0",
          },
        },
        coinFall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 1.2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        bigwin: "bigwin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        goldPulse: "goldPulse 2.6s ease-in-out infinite",
        lanternSway: "lanternSway 3.2s ease-in-out infinite",
        lanternGlow: "lanternGlow 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
