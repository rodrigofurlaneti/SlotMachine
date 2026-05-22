import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  // base "./" garante paths relativos no build — necessario para o Capacitor
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5232",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // No build para Android, VITE_API_BASE_URL deve ser o IP da maquina
  // ex: http://192.168.1.100:5232/api
  // Isso e configurado pelo android-build.bat automaticamente
}));
