using SlotMachine.Application.DTOs;

namespace SlotMachine.Application.Services
{
    public interface ISlotAppService
    {
        PlayerDto CreatePlayer(string name, decimal initialBalance);
        SpinResponseDto PlaySpin(Guid playerId, decimal betAmount);
        AuditResultDto RunAuditSimulation(int numberOfSpins);
    }
}
