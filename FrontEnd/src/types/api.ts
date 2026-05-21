// Tipos espelhados dos DTOs do backend (.NET / SlotMachine.Application.DTOs)

export interface CreatePlayerRequest {
  name: string;
  balance: number;
}

export interface PlayerDto {
  id: string;
  name: string;
  balance: number;
  jackpotPot?: number;
}

export interface SpinRequestDto {
  /** Valor da aposta em reais (R$ 0,50 a R$ 30,00). */
  betAmount: number;
}

export interface SpinResponseDto {
  /** Matriz 4x4 com a face dos simbolos retornada pela API */
  rows: string[][];
  prizeWon: number;
  currentBalance: number;
  isWinner: boolean;
  /** Aposta usada neste giro (eco do request) */
  betAmount: number;
  /** Valor pago do jackpot neste giro (0 se nao venceu). */
  jackpotWon: number;
  /** Pote progressivo apos o giro. */
  jackpotPot: number;
}

export interface AuditResultDto {
  totalSpins: number;
  expectedRTP: number;
  houseEdge: number;
}

export interface BetConfigDto {
  minBetAmount: number;
  maxBetAmount: number;
  presets: number[];
}

export interface ApiError {
  error: string;
}
