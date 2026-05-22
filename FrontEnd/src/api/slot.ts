/**
 * Camada de acesso ao jogo — 100% autônoma, sem dependência de rede.
 *
 * Toda a lógica de negócio (sorteio, prêmios, jackpot progressivo) roda
 * no motor offline local. O app funciona sem internet, sem servidor,
 * sem qualquer chamada de rede durante o jogo.
 *
 * As únicas funções que ainda usam rede (getBetConfig / runAudit) são
 * ferramentas administrativas opcionais — não afetam o jogo.
 */
import { apiClient } from "./client";
import {
  spinOffline,
  initOfflineState,
  getOfflineState,
} from "../offline/offlineEngine";
import type {
  AuditResultDto,
  BetConfigDto,
  CreatePlayerRequest,
  PlayerDto,
  SpinResponseDto,
} from "../types/api";

/**
 * Cria o jogador 100% localmente.
 * ID único gerado via crypto.randomUUID() e persistido no localStorage
 * pelo zustand-persist — sem chamada de rede, sem latência.
 */
export function createPlayer(payload: CreatePlayerRequest): Promise<PlayerDto> {
  const player: PlayerDto = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    balance: payload.initialBalance,
    jackpotPot: 0,
  };
  initOfflineState(player.balance, 0);
  return Promise.resolve(player);
}

/**
 * Executa um giro 100% no motor local — sem rede, sem latência, sem falhas de API.
 * O parâmetro playerId é mantido apenas por compatibilidade de interface.
 */
export function spin(_playerId: string, betAmount: number): Promise<SpinResponseDto> {
  const state = getOfflineState();
  if (!state) {
    return Promise.reject(
      new Error("Motor de jogo não inicializado. Por favor, reinicie o app.")
    );
  }
  return Promise.resolve(spinOffline(betAmount));
}

/**
 * Retorna o pote de jackpot atual do motor local — sem rede.
 */
export function getJackpot(): Promise<number> {
  return Promise.resolve(getOfflineState()?.jackpotPot ?? 0);
}

// ─── Funções administrativas (requerem servidor) ──────────────────────────────

/** Busca configuração de aposta no servidor (uso admin/debug). */
export async function getBetConfig(): Promise<BetConfigDto> {
  const { data } = await apiClient.get<BetConfigDto>("/slot/bet-config");
  return data;
}

/** Executa simulação de auditoria no servidor (uso admin/debug). */
export async function runAudit(spins = 100_000): Promise<AuditResultDto> {
  const { data } = await apiClient.get<AuditResultDto>("/slot/audit", {
    params: { spins },
  });
  return data;
}
