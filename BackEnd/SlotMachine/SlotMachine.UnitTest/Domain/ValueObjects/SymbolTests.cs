using SlotMachine.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace SlotMachine.Test.UnitTest.Domain.ValueObjects
{
    public class SymbolTests
    {
        [Fact]
        public void Symbol_ShouldInitializePropertiesCorrectly()
        {
            // Arrange
            string face = "💎";
            decimal multiplier = 100m;
            int weight = 5;

            // Act
            var symbol = new Symbol(face, multiplier, weight);

            // Assert
            symbol.Face.Should().Be(face);
            symbol.PayoutMultiplier.Should().Be(multiplier);
            symbol.ProbabilityWeight.Should().Be(weight);
        }

        [Fact]
        public void Symbols_WithSameValues_ShouldBeEqual()
        {
            // Arrange & Act
            var symbol1 = new Symbol("🍒", 2m, 50);
            var symbol2 = new Symbol("🍒", 2m, 50);

            // Assert
            // Records comparam valores, não a referência na memória.
            symbol1.Should().Be(symbol2);
        }

        [Fact]
        public void Symbols_WithDifferentValues_ShouldNotBeEqual()
        {
            // Arrange
            var symbol1 = new Symbol("🍒", 2m, 50);
            var symbol2 = new Symbol("🍋", 2m, 50);

            // Assert
            symbol1.Should().NotBe(symbol2);
        }

        [Theory]
        [InlineData("🍒", 2.0, 50)]
        [InlineData("💎", 100.0, 2)]
        [InlineData("❌", 0.0, 60)]
        public void Symbol_ShouldHandleDifferentInputValues(string face, decimal multiplier, int weight)
        {
            // Act
            var symbol = new Symbol(face, multiplier, weight);

            // Assert
            symbol.Face.Should().Be(face);
            symbol.PayoutMultiplier.Should().Be(multiplier);
            symbol.ProbabilityWeight.Should().Be(weight);
        }
    }
}