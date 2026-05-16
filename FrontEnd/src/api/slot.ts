import { apiClient } from "./client";
import type {
  AuditResultDto,
  CreatePlayerRequest,
  PlayerDto,
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
 * Executa um spin para o jogador informado.
 * POST /api/slot/spin/{playerId}
 */
export async function spin(playerId: string): Promise<SpinResponseDto> {
  const { data } = await apiClient.post<SpinResponseDto>(`/slot/spin/${playerId}`);
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
