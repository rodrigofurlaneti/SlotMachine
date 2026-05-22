import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.fortunespin.app",
  appName: "Fortune Spin",
  webDir: "dist",
  // Durante desenvolvimento com USB: aponta para a API no PC
  // Troque pelo IP da sua maquina na rede local (ex: 192.168.1.100)
  // Para producao, aponte para sua API publica
  server: {
    androidScheme: "https",
    // allowNavigation: ["192.168.1.*"],
  },
  android: {
    allowMixedContent: true, // permite HTTP em dev
    captureInput: true,
    webContentsDebuggingEnabled: true, // desative em producao
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
