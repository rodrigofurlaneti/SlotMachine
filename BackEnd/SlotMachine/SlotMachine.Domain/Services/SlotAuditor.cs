using System;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Domain.Services
{
    /// <summary>
    /// Repositório de jackpot descartável para simulações de auditoria.
    /// Acumula e drena em memória local, sem afetar o pote global de produção.
    /// </summary>
    internal sealed class AuditJackpotRepository : IGlobalJackpotRepository
    {
        private decimal _pot = 0m;
        public decimal GetPot() => _pot;
        public void AddContribution(decimal amount) { _pot += amount; _pot = decimal.Round(_pot, 2); }
        public decimal ClaimPot() { var v = _pot; _pot = 0m; return v; }
    }

    public sealed class SlotAuditor
    {
        /// <summary>Aposta usada na simulação de auditoria.</summary>
        private const decimal AuditBetAmount = 1.00m;

        public long TotalSpins { get; private set; }
        public decimal TotalWagered { get; private set; }
        public decimal TotalPaidOut { get; private set; }

        public void RunSimulation(Entities.SlotMachine machine, IRandomGenerator rng, int numberOfSpins)
        {
            if (numberOfSpins <= 0)
                throw new ArgumentException("O número de giros deve ser maior que zero.");

            decimal totalNeededBalance = numberOfSpins * AuditBetAmount;
            var botPlayer = new Player("AuditorBot", totalNeededBalance);
            // Usa pote local isolado — não contamina o jackpot global de produção
            var auditJackpot = new AuditJackpotRepository();

            for (int i = 0; i < numberOfSpins; i++)
            {
                var result = machine.Spin(botPlayer, rng, AuditBetAmount, auditJackpot);

                TotalSpins++;
                TotalWagered += result.BetAmount;
                // Inclui jackpot pago na contagem do RTP — o jogador recebe esse valor.
                TotalPaidOut += result.PrizeWon + result.JackpotWon;
            }
        }

        public decimal CalculateRTP()
        {
            if (TotalWagered == 0) return 0;
            return (TotalPaidOut / TotalWagered) * 100m;
        }

        public decimal CalculateHouseEdge()
        {
            return 100m - CalculateRTP();
        }

        public void Reset()
        {
            TotalSpins = 0;
            TotalWagered = 0;
            TotalPaidOut = 0;
        }
    }
}
