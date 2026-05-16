/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        casino: {
          bg: "#0a0a0a",
          panel: "#161616",
          felt: "#0f3d2e",
          gold: "#f5c518",
          goldDark: "#a8860f",
          neon: "#ff2e88",
          neonCyan: "#2afad1",
          rim: "#2a1f12",
        },
      },
      boxShadow: {
        gold: "0 0 24px rgba(245,197,24,0.55), inset 0 0 12px rgba(245,197,24,0.4)",
        neon: "0 0 18px rgba(255,46,136,0.7), 0 0 36px rgba(255,46,136,0.4)",
        reel: "inset 0 8px 16px rgba(0,0,0,0.7), inset 0 -8px 16px rgba(0,0,0,0.7)",
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
      },
      animation: {
        marquee: "marquee 1.2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        bigwin: "bigwin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};
