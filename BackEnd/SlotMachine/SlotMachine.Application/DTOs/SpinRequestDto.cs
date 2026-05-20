namespace SlotMachine.Application.DTOs
{
    /// <summary>
    /// Request enviado pelo cliente ao executar um giro.
    /// </summary>
    public record SpinRequestDto(decimal BetAmount);
}
