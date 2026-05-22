import type { SpinResponseDto } from "../types/api";

interface SymbolDef {
  face: string;
  multiplier: number;
  weight: number;
}

const SYMBOLS: SymbolDef[] = [
  { face: "🐯",   multiplier: 2,   weight: 40 },
  { face: "🪙",    multiplier: 5,   weight: 20 },
  { face: "🏮", multiplier: 10,  weight: 10 },
  { face: "🐉",  multiplier: 100, weight: 2  },
  { face: "🧧", multiplier: 0,   weight: 4  },
  { face: "🎋",   multiplier: 0,   weight: 60 },
];

const JACKPOT_FACE = "🧧";
const GRID_SIZE = 5;
const JACKPOT_CONTRIBUTION_RATE = 0.01;
const TOTAL_WEIGHT = SYMBOLS.reduce((acc, s) => acc + s.weight, 0);

function randomSymbol(): SymbolDef {
  let roll = Math.floor(Math.random() * TOTAL_WEIGHT);
  for (const sym of SYMBOLS) {
    if (roll < sym.weight) return sym;
    roll -= sym.weight;
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

function generateGrid(): SymbolDef[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => randomSymbol())
  );
}

function calcLinePrize(line: SymbolDef[], betAmount: number): number {
  if (line.length !== GRID_SIZE) return 0;
  const first = line[0].face;
  for (let i = 1; i < line.length; i++) {
    if (line[i].face !== first) return 0;
  }
  return betAmount * line[0].multiplier;
}

function isJackpotLine(line: SymbolDef[]): boolean {
  return line.every((s) => s.face === JACKPOT_FACE);
}

interface OfflineState {
  balance: number;
  jackpotPot: number;
}

let _state: OfflineState | null = null;

export function initOfflineState(balance: number, jackpotPot: number): void {
  _state = { balance, jackpotPot };
}

/**
 * Sincroniza apenas o pote global com o valor vindo do servidor,
 * sem tocar no saldo local. Chamado após getJackpot() retornar
 * o pote acumulado por todos os jogadores.
 */
export function syncJackpotPot(pot: number): void {
  if (_state) {
    _state.jackpotPot = pot;
  }
}

export function getOfflineState(): OfflineState | null {
  return _state;
}

export function spinOffline(betAmount: number): SpinResponseDto {
  if (!_state) {
    throw new Error("Offline engine not initialized.");
  }
  if (_state.balance < betAmount) {
    throw new Error("Saldo insuficiente para girar.");
  }

  _state.balance = Math.round((_state.balance - betAmount) * 100) / 100;
  const contribution = Math.round(betAmount * JACKPOT_CONTRIBUTION_RATE * 100) / 100;
  _state.jackpotPot = Math.round((_state.jackpotPot + contribution) * 100) / 100;

  const grid = generateGrid();
  let prize = 0;
  let jackpotLineWon = false;

  for (let r = 0; r < GRID_SIZE; r++) {
    prize += calcLinePrize(grid[r], betAmount);
    if (isJackpotLine(grid[r])) jackpotLineWon = true;
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    const col = grid.map((row) => row[c]);
    prize += calcLinePrize(col, betAmount);
    if (isJackpotLine(col)) jackpotLineWon = true;
  }
  const mainDiag = grid.map((row, i) => row[i]);
  prize += calcLinePrize(mainDiag, betAmount);
  if (isJackpotLine(mainDiag)) jackpotLineWon = true;

  const antiDiag = grid.map((row, i) => row[GRID_SIZE - 1 - i]);
  prize += calcLinePrize(antiDiag, betAmount);
  if (isJackpotLine(antiDiag)) jackpotLineWon = true;

  prize = Math.round(prize * 100) / 100;
  if (prize > 0) {
    _state.balance = Math.round((_state.balance + prize) * 100) / 100;
  }

  // Paga o jackpot global quando uma linha completa de envelopes 🧧 alinha.
  let jackpotWon = 0;
  if (jackpotLineWon && _state.jackpotPot > 0) {
    jackpotWon = _state.jackpotPot;
    _state.balance = Math.round((_state.balance + jackpotWon) * 100) / 100;
    _state.jackpotPot = 0;
  }

  return {
    rows: grid.map((row) => row.map((s) => s.face)),
    prizeWon: prize,
    currentBalance: _state.balance,
    isWinner: prize > 0 || jackpotWon > 0,
    betAmount,
    jackpotWon,
    jackpotPot: _state.jackpotPot,
  };
}
