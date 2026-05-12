using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Infrastructure.Services
{
    public class SystemRandomGenerator : IRandomGenerator
    {
        public int Next(int min, int maxExclusive)
        {
            return Random.Shared.Next(min, maxExclusive);
        }
    }
}