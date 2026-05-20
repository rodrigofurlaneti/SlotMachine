namespace SlotMachine.Application.DTOs
{
    public record SpinResponseDto(
        string[][] Rows,
        decimal PrizeWon,
        decimal CurrentBalance,
        bool IsWinner,
        decimal BetAmount
    );
}
