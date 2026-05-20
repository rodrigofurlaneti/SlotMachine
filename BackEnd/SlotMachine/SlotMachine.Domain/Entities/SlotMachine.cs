using System;
using System.Collections.Generic;
using System.Linq;
using SlotMachine.Domain.ValueObjects;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Domain.Entities
{
    public sealed class SlotMachine
    {
        /// <summary>Valor mínimo permitido por giro (R$).</summary>
        public const decimal MinBetAmount = 0.50m;

        /// <summary>Valor máximo permitido por giro (R$).</summary>
        public const decimal MaxBetAmount = 30.00m;

        /// <summary>Valores pré-definidos que a UI deve oferecer (touch).</summary>
        public static readonly decimal[] PresetBetAmounts = new[]
        {
            0.50m, 1.00m, 2.00m, 3.00m, 4.00m, 5.00m,
            10.00m, 15.00m, 20.00m, 25.00m, 30.00m
        };

        private readonly Symbol[] _availableSymbols;

        public SlotMachine()
        {
            // Tema "Fortune" oriental — mesmos multiplicadores e pesos do tema anterior
            // para preservar RTP/House Edge auditado.
            //   🐯 Tigre   → multiplicador  2x  (peso 40)
            //   🪙 Moeda   → multiplicador  5x  (peso 20)
            //   🏮 Lanterna→ multiplicador 10x  (peso 10)
            //   🐉 Dragão  → multiplicador 100x (peso  2) — equivale ao antigo 💎
            //   🎋 Bambu   → vazio          0x  (peso 60)
            _availableSymbols = new[]
            {
                new Symbol("🐯", 2m,   40),
                new Symbol("🪙", 5m,   20),
                new Symbol("🏮", 10m,  10),
                new Symbol("🐉", 100m, 2),
                new Symbol("🎋", 0m,   60)
            };
        }

        /// <summary>
        /// Executa um giro com a aposta informada pelo jogador.
        /// O prêmio escala proporcionalmente à aposta:
        /// prêmio_linha = betAmount * payoutMultiplier do símbolo.
        /// </summary>
        public SpinResult Spin(Player player, IRandomGenerator rng, decimal betAmount)
        {
            ValidateBet(betAmount);

            if (player.Balance < betAmount)
                throw new Exception("Saldo insuficiente para girar.");

            player.Debit(betAmount);

            // Sorteio das 3 linhas (grid 3x3)
            var row1 = GenerateRow(rng);
            var row2 = GenerateRow(rng);
            var row3 = GenerateRow(rng);

            // Cálculo do prêmio: 3 linhas horizontais + 2 diagonais = 5 linhas pagantes
            decimal prize = 0;

            // Horizontais
            prize += CalculateLinePrize(row1[0], row1[1], row1[2], betAmount);
            prize += CalculateLinePrize(row2[0], row2[1], row2[2], betAmount);
            prize += CalculateLinePrize(row3[0], row3[1], row3[2], betAmount);

            // Diagonal principal (↘): [0][0], [1][1], [2][2]
            prize += CalculateLinePrize(row1[0], row2[1], row3[2], betAmount);

            // Diagonal secundária (↙): [0][2], [1][1], [2][0]
            prize += CalculateLinePrize(row1[2], row2[1], row3[0], betAmount);

            if (prize > 0)
            {
                player.Credit(prize);
            }

            return new SpinResult(
                Rows: new List<Symbol[]> { row1, row2, row3 },
                PrizeWon: prize,
                BetAmount: betAmount
            );
        }

        /// <summary>
        /// Garante que o valor da aposta está dentro do range permitido
        /// (R$ 0,50 ≤ bet ≤ R$ 30,00) e em múltiplos de 0,01 (centavos).
        /// </summary>
        public static void ValidateBet(decimal betAmount)
        {
            if (betAmount < MinBetAmount || betAmount > MaxBetAmount)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(betAmount),
                    $"Aposta inválida. Permitido entre R$ {MinBetAmount:F2} e R$ {MaxBetAmount:F2}."
                );
            }

            // Evita centavos quebrados (R$ 0,005 etc.)
            if (decimal.Round(betAmount, 2) != betAmount)
            {
                throw new ArgumentException(
                    "Aposta deve ter no máximo 2 casas decimais.",
                    nameof(betAmount)
                );
            }
        }

        private Symbol[] GenerateRow(IRandomGenerator rng)
        {
            return new Symbol[] {
                GetRandomSymbol(rng),
                GetRandomSymbol(rng),
                GetRandomSymbol(rng)
            };
        }

        /// <summary>
        /// Calcula o prêmio de uma linha de 3 símbolos (horizontal ou diagonal).
        /// Paga apenas quando os 3 são iguais; o símbolo 🎋 continua valendo 0
        /// porque o PayoutMultiplier dele é zero. O prêmio escala com a aposta.
        /// </summary>
        private decimal CalculateLinePrize(Symbol s1, Symbol s2, Symbol s3, decimal betAmount)
        {
            if (s1.Face == s2.Face && s2.Face == s3.Face)
            {
                return betAmount * s1.PayoutMultiplier;
            }
            return 0;
        }

        private Symbol GetRandomSymbol(IRandomGenerator rng)
        {
            int totalWeight = _availableSymbols.Sum(s => s.ProbabilityWeight);
            int randomNumber = rng.Next(0, totalWeight);

            int currentWeight = 0;
            foreach (var symbol in _availableSymbols)
            {
                currentWeight += symbol.ProbabilityWeight;
                if (randomNumber < currentWeight)
                    return symbol;
            }
            return _availableSymbols.First();
        }
    }
}
