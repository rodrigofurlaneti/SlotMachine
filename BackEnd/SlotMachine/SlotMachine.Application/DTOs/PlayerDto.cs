namespace SlotMachine.Application.DTOs
{
    public record PlayerDto(
        Guid Id,
        string Name,
        decimal Balance,
        decimal JackpotPot = 0m
    );
}
