using SlotMachine.Application.DTOs;

namespace SlotMachine.Test.UnitTest.Application.DTOs
{
    public class SpinResponseDtoTests
    {
        [Fact]
        public void SpinResponseDto_ShouldStoreValuesCorrectly()
        {
            // Arrange
            string[][] rows = new[]
            {
                new[] { "🍒", "🍒", "🍒" },
                new[] { "❌", "💎", "❌" },
                new[] { "🍋", "🔔", "🍋" }
            };
            decimal prize = 6.00m;
            decimal balance = 105.00m;
            bool isWinner = true;
            decimal bet = 3.00m;

            // Act
            var dto = new SpinResponseDto(rows, prize, balance, isWinner, bet);

            // Assert
            dto.Rows.Should().BeEquivalentTo(rows);
            dto.PrizeWon.Should().Be(prize);
            dto.CurrentBalance.Should().Be(balance);
            dto.IsWinner.Should().BeTrue();
            dto.BetAmount.Should().Be(bet);
        }

        [Fact]
        public void SpinResponseDto_ShouldHandleLossCorrectly()
        {
            // Arrange
            string[][] rows = new[]
            {
                new[] { "❌", "🍋", "🍒" },
                new[] { "🔔", "❌", "💎" },
                new[] { "🍒", "🍒", "❌" }
            };

            // Act
            var dto = new SpinResponseDto(rows, 0m, 97.00m, false, 3.00m);

            // Assert
            dto.IsWinner.Should().BeFalse();
            dto.PrizeWon.Should().Be(0m);
        }

        [Fact]
        public void SpinResponseDto_Rows_ShouldHaveCorrectDimensions()
        {
            // Arrange
            string[][] rows = new[]
            {
                new[] { "A", "B", "C" },
                new[] { "D", "E", "F" },
                new[] { "G", "H", "I" }
            };

            // Act
            var dto = new SpinResponseDto(rows, 10m, 100m, true, 5.00m);

            // Assert
            dto.Rows.Should().HaveCount(3); // 3 linhas
            dto.Rows[0].Should().HaveCount(3); // 3 colunas
            dto.BetAmount.Should().Be(5.00m);
        }
    }
}
