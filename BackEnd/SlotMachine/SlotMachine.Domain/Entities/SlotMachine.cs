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

        /// <summary>Símbolo top normal (dragão) — apenas paga 100x quando alinhado.</summary>
        public const string TopSymbol = "🐉";

        /// <summary>
        /// Símbolo exclusivo do JACKPOT — envelope vermelho (hongbao).
        /// Multiplicador 0 (não paga prêmio normal). Quando 4 alinhados em qualquer
        /// linha de 4 pagantes, paga o pote progressivo inteiro.
        /// </summary>
        public const string JackpotSymbol = "🧧";

        /// <summary>Fração de cada aposta que entra no pote progressivo (1%).</summary>
        public const decimal JackpotContributionRate = 0.01m;

        /// <summary>Valores pré-definidos que a UI deve oferecer (touch).</summary>
        public static readonly decimal[] PresetBetAmounts = new[]
        {
            0.50m, 1.00m, 2.00m, 3.00m, 4.00m, 5.00m,
            10.00m, 15.00m, 20.00m, 25.00m, 30.00m
        };

        private readonly Symbol[] _availableSymbols;

        public SlotMachine()
        {
            _availableSymbols = new[]
            {
                new Symbol("🐯", 2m,   40),
                new Symbol("🪙", 5m,   20),
                new Symbol("🏮", 10m,  10),
                new Symbol("🐉", 100m, 2),
                new Symbol("🧧", 0m,   4),   // jackpot trigger — raro, sem premio direto
                new Symbol("🎋", 0m,   60)
            };
        }

        /// <summary>
        /// Executa um giro com a aposta informada pelo jogador.
        /// Grid 4x4 com 10 linhas pagantes (4 horizontais + 4 verticais + 2 diagonais).
        ///
        /// Mecânica do JACKPOT PROGRESSIVO GLOBAL:
        ///   - 1% de CADA aposta (de qualquer jogador) vai para o pote global.
        ///   - Quando QUALQUER linha de 4 envelopes 🧧 alinhar, o jogador
        ///     ganha o pote global inteiro (independente de quem contribuiu).
        ///   - O pote zera após o pagamento e recomeça a acumular.
        /// </summary>
        public SpinResult Spin(
            Player player,
            IRandomGenerator rng,
            decimal betAmount,
            IGlobalJackpotRepository jackpotRepo)
        {
            ValidateBet(betAmount);

            if (player.Balance < betAmount)
                throw new Exception("Saldo insuficiente para girar.");

            player.Debit(betAmount);

            // 1% de cada aposta alimenta o pote global compartilhado
            var contribution = decimal.Round(betAmount * JackpotContributionRate, 2);
            jackpotRepo.AddContribution(contribution);

            // Sorteia matriz 4x4
            var grid = new Symbol[GridSize][];
            for (int r = 0; r < GridSize; r++)
            {
                grid[r] = GenerateRow(rng);
            }

            decimal prize = 0;
            bool jackpotLineWon = false;

            // Helper: detecta se a linha é inteiramente do símbolo do jackpot.
            bool IsJackpotLine(Symbol[] line)
            {
                for (int i = 0; i < line.Length; i++)
                {
                    if (line[i].Face != JackpotSymbol) return false;
                }
                return true;
            }

            // Horizontais (4 linhas)
            for (int r = 0; r < GridSize; r++)
            {
                prize += CalculateLinePrize(grid[r], betAmount);
                if (IsJackpotLine(grid[r])) jackpotLineWon = true;
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
                if (IsJackpotLine(col)) jackpotLineWon = true;
            }

            // Diagonal principal ↘
            var mainDiag = new Symbol[GridSize];
            for (int i = 0; i < GridSize; i++) mainDiag[i] = grid[i][i];
            prize += CalculateLinePrize(mainDiag, betAmount);
            if (IsJackpotLine(mainDiag)) jackpotLineWon = true;

            // Diagonal secundária ↙
            var antiDiag = new Symbol[GridSize];
            for (int i = 0; i < GridSize; i++) antiDiag[i] = grid[i][GridSize - 1 - i];
            prize += CalculateLinePrize(antiDiag, betAmount);
            if (IsJackpotLine(antiDiag)) jackpotLineWon = true;

            if (prize > 0)
            {
                player.Credit(prize);
            }

            // JACKPOT GLOBAL: se alguma linha de 4 envelopes 🧧 alinhou, paga o pote inteiro.
            decimal jackpotWon = 0m;
            if (jackpotLineWon)
            {
                jackpotWon = jackpotRepo.ClaimPot();
                if (jackpotWon > 0)
                {
                    player.Credit(jackpotWon);
                }
            }

            return new SpinResult(
                Rows: new List<Symbol[]>(grid),
                PrizeWon: prize,
                BetAmount: betAmount,
                JackpotWon: jackpotWon,
                JackpotPot: jackpotRepo.GetPot()  // retorna o pote global atualizado
            );
        }

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
            for (int i = 0; i < GridSize; i++) row[i] = GetRandomSymbol(rng);
            return row;
        }

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
