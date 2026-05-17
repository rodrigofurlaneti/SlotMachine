using System;
using System.Collections.Generic;
using System.Linq;
using SlotMachine.Domain.ValueObjects;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Domain.Entities
{
    public sealed class SlotMachine
    {
        private const decimal FixedBetAmount = 3.00m;
        private readonly Symbol[] _availableSymbols;

        public SlotMachine()
        {
            _availableSymbols = new[]
            {
                new Symbol("🍒", 2m,   40),
                new Symbol("🍋", 5m,   20),
                new Symbol("🔔", 10m,  10),
                new Symbol("💎", 100m, 2),
                new Symbol("❌", 0m,   60)
            };
        }

        public SpinResult Spin(Player player, IRandomGenerator rng)
        {
            if (player.Balance < FixedBetAmount)
                throw new Exception("Saldo insuficiente para girar.");

            player.Debit(FixedBetAmount);

            // Sorteio das 3 linhas (grid 3x3)
            var row1 = GenerateRow(rng);
            var row2 = GenerateRow(rng);
            var row3 = GenerateRow(rng);

            // Cálculo do prêmio: 3 linhas horizontais + 2 diagonais = 5 linhas pagantes
            decimal prize = 0;

            // Horizontais
            prize += CalculateLinePrize(row1[0], row1[1], row1[2]);
            prize += CalculateLinePrize(row2[0], row2[1], row2[2]);
            prize += CalculateLinePrize(row3[0], row3[1], row3[2]);

            // Diagonal principal (↘): [0][0], [1][1], [2][2]
            prize += CalculateLinePrize(row1[0], row2[1], row3[2]);

            // Diagonal secundária (↙): [0][2], [1][1], [2][0]
            prize += CalculateLinePrize(row1[2], row2[1], row3[0]);

            if (prize > 0)
            {
                player.Credit(prize);
            }

            return new SpinResult(
                Rows: new List<Symbol[]> { row1, row2, row3 },
                PrizeWon: prize
            );
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
        /// Paga apenas quando os 3 são iguais; o símbolo ❌ continua valendo 0
        /// porque o PayoutMultiplier dele é zero.
        /// </summary>
        private decimal CalculateLinePrize(Symbol s1, Symbol s2, Symbol s3)
        {
            if (s1.Face == s2.Face && s2.Face == s3.Face)
            {
                return FixedBetAmount * s1.PayoutMultiplier;
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