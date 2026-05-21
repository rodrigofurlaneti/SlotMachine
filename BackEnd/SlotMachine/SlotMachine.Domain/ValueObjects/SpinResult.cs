using System.Collections.Generic;

namespace SlotMachine.Domain.ValueObjects
{
    public record SpinResult(
        List<Symbol[]> Rows,
        decimal PrizeWon,
        decimal BetAmount,
        decimal JackpotWon = 0m,
        decimal JackpotPot = 0m
    )
    {
        public bool IsWinner => PrizeWon > 0;
        public bool IsJackpotWinner => JackpotWon > 0;
    }
}
