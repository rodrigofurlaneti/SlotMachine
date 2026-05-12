using SlotMachine.Domain.Entities;

namespace SlotMachine.Domain.Interfaces
{
    public interface IPlayerRepository
    {
        Player GetById(Guid id);
        void Save(Player player);
    }
}
