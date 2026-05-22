using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Infrastructure.Repositories
{
    /// <summary>
    /// Implementação em memória do pote global de jackpot.
    /// O campo estático garante que um único pote é compartilhado por toda a
    /// aplicação, independente de quantas instâncias do repositório sejam criadas.
    /// As operações são thread-safe via lock.
    /// </summary>
    public class InMemoryGlobalJackpotRepository : IGlobalJackpotRepository
    {
        private static decimal _pot = 0m;
        private static readonly object _lock = new();

        public decimal GetPot()
        {
            lock (_lock)
            {
                return _pot;
            }
        }

        public void AddContribution(decimal amount)
        {
            if (amount <= 0) return;
            lock (_lock)
            {
                _pot += amount;
                _pot = decimal.Round(_pot, 2);
            }
        }

        public decimal ClaimPot()
        {
            lock (_lock)
            {
                var won = _pot;
                _pot = 0m;
                return won;
            }
        }
    }
}
