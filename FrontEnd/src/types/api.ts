// Tipos espelhados dos DTOs do backend (.NET / SlotMachine.Application.DTOs)

export interface CreatePlayerRequest {
  name: string;
  balance: number;
}

export interface PlayerDto {
  id: string;
  name: string;
  balance: number;
}

export interface SpinResponseDto {
  /** Matriz 3x3 com a face dos símbolos retornada pela API */
  rows: string[][];
  prizeWon: number;
  currentBalance: number;
  isWinner: boolean;
}

export interface AuditResultDto {
  totalSpins: number;
  expectedRTP: number;
  houseEdge: number;
}

export interface ApiError {
  error: string;
}
