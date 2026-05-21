using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Infrastructure.Repositories
{
    /// <summary>
    /// Pote progressivo global em memoria.
    ///
    /// Usa um campo estatico para sobreviver entre injecoes de DI dentro
    /// do mesmo processo (o singleton da DI ja garantiria isso, mas o
    /// 'static' adiciona uma camada extra de seguranca).
    ///
    /// IMPORTANTE: como esta em memoria, o pote zera quando o processo
    /// reinicia. Para producao, trocar por uma implementacao que persista
    /// em banco de dados (Postgres/Redis/etc).
    /// </summary>
    public class InMemoryJackpotPotRepository : IJackpotPotRepository
    {
        /// <summary>
        /// Valor semente do pote — quando o servico sobe pela primeira vez,
        /// o jackpot ja comeca com este montante para nao parecer vazio.
        /// </summary>
        private const decimal SeedAmount = 250.00m;

        private static readonly object _lock = new();
        private static decimal _pot = SeedAmount;

        public decimal GetCurrentPot()
        {
            lock (_lock)
            {
                return _pot;
            }
        }

        public void Contribute(decimal amount)
        {
            if (amount <= 0) return;
            lock (_lock)
            {
                _pot += amount;
            }
        }

        public decimal Claim()
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
