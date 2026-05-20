import { apiClient } from "./client";
import type {
  AuditResultDto,
  BetConfigDto,
  CreatePlayerRequest,
  PlayerDto,
  SpinRequestDto,
  SpinResponseDto,
} from "../types/api";

/**
 * Cria um jogador no backend.
 * POST /api/slot/player
 */
export async function createPlayer(payload: CreatePlayerRequest): Promise<PlayerDto> {
  const { data } = await apiClient.post<PlayerDto>("/slot/player", payload);
  return data;
}

/**
 * Executa um spin para o jogador informado, enviando o valor da aposta.
 * POST /api/slot/spin/{playerId}
 */
export async function spin(
  playerId: string,
  betAmount: number
): Promise<SpinResponseDto> {
  const body: SpinRequestDto = { betAmount };
  const { data } = await apiClient.post<SpinResponseDto>(
    `/slot/spin/${playerId}`,
    body
  );
  return data;
}

/**
 * Lê configuração de aposta (presets e limites) direto do backend.
 * GET /api/slot/bet-config
 */
export async function getBetConfig(): Promise<BetConfigDto> {
  const { data } = await apiClient.get<BetConfigDto>("/slot/bet-config");
  return data;
}

/**
 * Roda uma simulação de auditoria (RTP / House Edge).
 * GET /api/slot/audit?spins=...
 */
export async function runAudit(spins = 100_000): Promise<AuditResultDto> {
  const { data } = await apiClient.get<AuditResultDto>("/slot/audit", {
    params: { spins },
  });
  return data;
}
