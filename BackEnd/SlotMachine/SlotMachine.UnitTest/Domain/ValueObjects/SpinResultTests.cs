using SlotMachine.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            var result = new SpinResult(rows, prize);

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
            var result = new SpinResult(rows, prize);

            // Assert
            result.IsWinner.Should().BeFalse();
        }

        [Fact]
        public void SpinResult_ShouldHaveDefaultBetAmount_WhenNotProvided()
        {
            // Arrange
            var rows = new List<Symbol[]>();
            var prize = 10m;

            // Act
            var result = new SpinResult(rows, prize);

            // Assert
            // Verifica se o ajuste que fizemos de 3.00m está funcionando como padrão
            result.BetAmount.Should().Be(3.00m);
        }

        [Fact]
        public void SpinResult_ShouldStoreRowsCorrectly()
        {
            // Arrange
            var symbol = new Symbol("🍒", 2m, 50);
            var row = new Symbol[] { symbol, symbol, symbol };
            var rows = new List<Symbol[]> { row, row, row };

            // Act
            var result = new SpinResult(rows, 0m);

            // Assert
            result.Rows.Should().HaveCount(3);
            result.Rows[0][0].Face.Should().Be("🍒");
        }
    }
}