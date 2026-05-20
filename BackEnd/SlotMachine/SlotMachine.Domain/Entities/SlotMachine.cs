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

        /// <summary>Dimensão do grid (4x4).</summary>
        public const int GridSize = 4;

        /// <summary>Valores pré-definidos que a UI deve oferecer (touch).</summary>
        public static readonly decimal[] PresetBetAmounts = new[]
        {
            0.50m, 1.00m, 2.00m, 3.00m, 4.00m, 5.00m,
            10.00m, 15.00m, 20.00m, 25.00m, 30.00m
        };

        private readonly Symbol[] _availableSymbols;

        public SlotMachine()
        {
            // Tema "Fortune" oriental — mantém multiplicadores e pesos.
            //   🐯 Tigre    → multiplicador  2x  (peso 40)
            //   🪙 Moeda    → multiplicador  5x  (peso 20)
            //   🏮 Lanterna → multiplicador 10x  (peso 10)
            //   🐉 Dragão   → multiplicador 100x (peso  2)
            //   🎋 Bambu    → vazio          0x  (peso 60)
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
        /// Grid 4x4 com 10 linhas pagantes:
        ///   - 4 linhas horizontais
        ///   - 4 colunas verticais
        ///   - 2 diagonais (principal e secundária, ambas de 4 elementos)
        /// Regra: paga quando os 4 símbolos da linha são iguais.
        /// O prêmio escala proporcionalmente à aposta:
        ///   prêmio_linha = betAmount * payoutMultiplier do símbolo.
        /// </summary>
        public SpinResult Spin(Player player, IRandomGenerator rng, decimal betAmount)
        {
            ValidateBet(betAmount);

            if (player.Balance < betAmount)
                throw new Exception("Saldo insuficiente para girar.");

            player.Debit(betAmount);

            // Sorteia matriz 4x4
            var grid = new Symbol[GridSize][];
            for (int r = 0; r < GridSize; r++)
            {
                grid[r] = GenerateRow(rng);
            }

            decimal prize = 0;

            // Horizontais (4 linhas)
            for (int r = 0; r < GridSize; r++)
            {
                prize += CalculateLinePrize(grid[r], betAmount);
            }

            // Verticais (4 colunas)
            for (int c = 0; c < GridSize; c++)
            {
                var col = new Symbol[GridSize];
                for (int r = 0; r < GridSize; r++)
                {
                    col[r] = grid[r][c];
                }
                prize += CalculateLinePrize(col, betAmount);
            }

            // Diagonal principal ↘
            var mainDiag = new Symbol[GridSize];
            for (int i = 0; i < GridSize; i++)
            {
                mainDiag[i] = grid[i][i];
            }
            prize += CalculateLinePrize(mainDiag, betAmount);

            // Diagonal secundária ↙
            var antiDiag = new Symbol[GridSize];
            for (int i = 0; i < GridSize; i++)
            {
                antiDiag[i] = grid[i][GridSize - 1 - i];
            }
            prize += CalculateLinePrize(antiDiag, betAmount);

            if (prize > 0)
            {
                player.Credit(prize);
            }

            return new SpinResult(
                Rows: new List<Symbol[]>(grid),
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
            var row = new Symbol[GridSize];
            for (int i = 0; i < GridSize; i++)
            {
                row[i] = GetRandomSymbol(rng);
            }
            return row;
        }

        /// <summary>
        /// Calcula o prêmio de uma linha de 4 símbolos (horizontal, vertical ou diagonal).
        /// Paga apenas quando os 4 são iguais. O símbolo 🎋 (bambu) tem multiplicador 0,
        /// portanto também não gera prêmio mesmo se alinhar.
        /// </summary>
        private decimal CalculateLinePrize(Symbol[] line, decimal betAmount)
        {
            if (line.Length != GridSize) return 0;
            var first = line[0].Face;
            for (int i = 1; i < line.Length; i++)
            {
                if (line[i].Face != first) return 0;
            }
            return betAmount * line[0].PayoutMultiplier;
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
