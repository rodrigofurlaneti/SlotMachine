import { apiClient } from "./client";
import { useConnectionStore } from "../store/connectionStore";
import { spinOffline, initOfflineState, getOfflineState } from "../offline/offlineEngine";
import type {
  AuditResultDto,
  BetConfigDto,
  CreatePlayerRequest,
  PlayerDto,
  SpinRequestDto,
  SpinResponseDto,
} from "../types/api";

let _offlinePlayer: PlayerDto | null = null;
void _offlinePlayer;

export async function createPlayer(payload: CreatePlayerRequest): Promise<PlayerDto> {
  const { status } = useConnectionStore.getState();

  if (status !== "offline") {
    try {
      const { data } = await apiClient.post<PlayerDto>("/slot/player", payload);
      initOfflineState(data.balance, data.jackpotPot ?? 0);
      return data;
    } catch {
      // Network failure -- interceptor already marked offline
    }
  }

  const offlinePlayer: PlayerDto = {
    id: `offline-${Date.now()}`,
    name: payload.name,
    balance: payload.initialBalance,
    jackpotPot: 0,
  };
  _offlinePlayer = offlinePlayer;
  initOfflineState(offlinePlayer.balance, 0);
  return offlinePlayer;
}

export async function spin(
  playerId: string,
  betAmount: number
): Promise<SpinResponseDto> {
  const { status, markOffline } = useConnectionStore.getState();

  if (status !== "offline") {
    try {
      const body: SpinRequestDto = { betAmount };
      const { data } = await apiClient.post<SpinResponseDto>(
        `/slot/spin/${playerId}`,
        body
      );
      initOfflineState(data.currentBalance, data.jackpotPot);
      return data;
    } catch (err) {
      const isNetworkErr =
        err instanceof Error &&
        (err.message.includes("Network") ||
          err.message.includes("timeout") ||
          err.message.includes("ECONNREFUSED") ||
          err.message.includes("status code 500") ||
          err.message.includes("status code 502") ||
          err.message.includes("status code 503") ||
          err.message.includes("status code 504") ||
          err.message.includes("Erro de comunicacao"));

      if (isNetworkErr) {
        markOffline();
        const offlineState = getOfflineState();
        if (!offlineState) {
          throw new Error("Modo offline indisponivel: saldo nao sincronizado. Reinicie o jogo.");
        }
        return spinOffline(betAmount);
      }

      throw err;
    }
  }

  const offlineState = getOfflineState();
  if (!offlineState) {
    throw new Error("Motor offline nao inicializado. Por favor, reinicie o jogo.");
  }
  return spinOffline(betAmount);
}

export async function getJackpot(): Promise<number> {
  const { data } = await apiClient.get<{ jackpotPot: number }>("/slot/jackpot");
  return data.jackpotPot;
}

export async function getBetConfig(): Promise<BetConfigDto> {
  const { data } = await apiClient.get<BetConfigDto>("/slot/bet-config");
  return data;
}

export async function runAudit(spins = 100_000): Promise<AuditResultDto> {
  const { data } = await apiClient.get<AuditResultDto>("/slot/audit", {
    params: { spins },
  });
  return data;
}
