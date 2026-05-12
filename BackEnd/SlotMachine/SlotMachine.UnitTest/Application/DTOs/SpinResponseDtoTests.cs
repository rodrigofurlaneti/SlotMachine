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

            // Act
            var dto = new SpinResponseDto(rows, prize, balance, isWinner);

            // Assert
            dto.Rows.Should().BeEquivalentTo(rows);
            dto.PrizeWon.Should().Be(prize);
            dto.CurrentBalance.Should().Be(balance);
            dto.IsWinner.Should().BeTrue();
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
            var dto = new SpinResponseDto(rows, 0m, 97.00m, false);

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
            var dto = new SpinResponseDto(rows, 10m, 100m, true);

            // Assert
            dto.Rows.Should().HaveCount(3); // 3 linhas
            dto.Rows[0].Should().HaveCount(3); // 3 colunas
        }
    }
}