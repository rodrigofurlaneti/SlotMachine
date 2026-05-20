using System.Collections.Generic;

namespace SlotMachine.Domain.ValueObjects
{
    public record SpinResult(
        List<Symbol[]> Rows,
        decimal PrizeWon,
        decimal BetAmount
    )
    {
        public bool IsWinner => PrizeWon > 0;
    }
}
