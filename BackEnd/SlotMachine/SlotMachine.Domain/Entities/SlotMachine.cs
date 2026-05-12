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

            // Sorteio das 3 linhas
            var row1 = GenerateRow(rng);
            var row2 = GenerateRow(rng);
            var row3 = GenerateRow(rng);

            // Cálculo do prêmio somando as 3 linhas (estilo 3-line slot)
            decimal prize = 0;
            prize += CalculateRowPrize(row1);
            prize += CalculateRowPrize(row2);
            prize += CalculateRowPrize(row3);

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

        private decimal CalculateRowPrize(Symbol[] row)
        {
            if (row[0].Face == row[1].Face && row[1].Face == row[2].Face)
            {
                return FixedBetAmount * row[0].PayoutMultiplier;
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