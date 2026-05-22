import { create } from "zustand";
import { apiClient } from "../api/client";

export type ConnectionStatus = "online" | "offline" | "recovering";

interface ConnectionState {
  status: ConnectionStatus;
  offlineSince: Date | null;
  lastOnline: Date | null;
  failureCount: number;
  markOffline: () => void;
  markOnline: () => void;
  markRecovering: () => void;
  startMonitor: () => () => void;
}

const PING_INTERVAL_MS = 8_000;
const HEALTH_ENDPOINT = "/slot/bet-config";

export const useConnectionStore = create<ConnectionState>()((set, get) => ({
  status: "online",
  offlineSince: null,
  lastOnline: null,
  failureCount: 0,

  markOffline: () =>
    set((s) => ({
      status: "offline",
      offlineSince: s.offlineSince ?? new Date(),
      failureCount: s.failureCount + 1,
    })),

  markOnline: () =>
    set({ status: "online", offlineSince: null, lastOnline: new Date(), failureCount: 0 }),

  markRecovering: () => set({ status: "recovering" }),

  startMonitor: () => {
    const ping = async () => {
      const { status, markOnline, markRecovering } = get();
      if (status === "online") return;
      try {
        await apiClient.get(HEALTH_ENDPOINT, { timeout: 5_000 });
        markRecovering();
        setTimeout(markOnline, 1_500);
      } catch {
        // still offline
      }
    };
    const id = setInterval(ping, PING_INTERVAL_MS);
    window.addEventListener("online", ping);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", ping);
    };
  },
}));
