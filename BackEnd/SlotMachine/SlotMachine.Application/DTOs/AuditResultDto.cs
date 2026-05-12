namespace SlotMachine.Application.DTOs
{
    public record AuditResultDto(
            long TotalSpins,
            decimal ExpectedRTP,
            decimal HouseEdge
        );
}
