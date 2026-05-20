using System;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Domain.Services
{
    public sealed class SlotAuditor
    {
        /// <summary>Aposta usada na simulação de auditoria.</summary>
        private const decimal AuditBetAmount = 1.00m;

        public long TotalSpins { get; private set; }
        public decimal TotalWagered { get; private set; }
        public decimal TotalPaidOut { get; private set; }

        // CORREÇÃO AQUI: Usamos 'Entities.SlotMachine' para o compilador não confundir com o namespace
        public void RunSimulation(Entities.SlotMachine machine, IRandomGenerator rng, int numberOfSpins)
        {
            if (numberOfSpins <= 0)
                throw new ArgumentException("O número de giros deve ser maior que zero.");

            // Criamos um jogador "fantasma" com saldo infinito para a auditoria
            decimal totalNeededBalance = numberOfSpins * AuditBetAmount;
            var botPlayer = new Player("AuditorBot", totalNeededBalance);

            for (int i = 0; i < numberOfSpins; i++)
            {
                var result = machine.Spin(botPlayer, rng, AuditBetAmount);

                TotalSpins++;
                TotalWagered += result.BetAmount;
                TotalPaidOut += result.PrizeWon;
            }
        }

        // Calcula o RTP: (Total Pago / Total Apostado) * 100
        public decimal CalculateRTP()
        {
            if (TotalWagered == 0) return 0;
            return (TotalPaidOut / TotalWagered) * 100m;
        }

        // Calcula o House Edge (Lucro da Casa): 100% - RTP
        public decimal CalculateHouseEdge()
        {
            return 100m - CalculateRTP();
        }

        // Reseta os contadores caso queira rodar nova auditoria
        public void Reset()
        {
            TotalSpins = 0;
            TotalWagered = 0;
            TotalPaidOut = 0;
        }
    }
}
