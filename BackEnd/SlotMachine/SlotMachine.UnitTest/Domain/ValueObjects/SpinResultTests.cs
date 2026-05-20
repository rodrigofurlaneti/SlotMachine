using SlotMachine.Domain.ValueObjects;
using System.Collections.Generic;

namespace SlotMachine.Test.UnitTest.Domain.ValueObjects
{
    public class SpinResultTests
    {
        [Fact]
        public void IsWinner_ShouldBeTrue_WhenPrizeIsGreaterThanZero()
        {
            // Arrange
            var rows = new List<Symbol[]>();
            var prize = 0.50m;

            // Act
            var result = new SpinResult(rows, prize, 3.00m);

            // Assert
            result.IsWinner.Should().BeTrue();
        }

        [Fact]
        public void IsWinner_ShouldBeFalse_WhenPrizeIsZero()
        {
            // Arrange
            var rows = new List<Symbol[]>();
            var prize = 0m;

            // Act
            var result = new SpinResult(rows, prize, 3.00m);

            // Assert
            result.IsWinner.Should().BeFalse();
        }

        [Fact]
        public void SpinResult_ShouldStoreBetAmountCorrectly()
        {
            // Arrange
            var rows = new List<Symbol[]>();

            // Act
            var result = new SpinResult(rows, 10m, 5.00m);

            // Assert
            result.BetAmount.Should().Be(5.00m);
        }

        [Fact]
        public void SpinResult_ShouldStoreRowsCorrectly()
        {
            // Arrange
            var symbol = new Symbol("🍒", 2m, 50);
            var row = new Symbol[] { symbol, symbol, symbol };
            var rows = new List<Symbol[]> { row, row, row };

            // Act
            var result = new SpinResult(rows, 0m, 3.00m);

            // Assert
            result.Rows.Should().HaveCount(3);
            result.Rows[0][0].Face.Should().Be("🍒");
        }
    }
}
