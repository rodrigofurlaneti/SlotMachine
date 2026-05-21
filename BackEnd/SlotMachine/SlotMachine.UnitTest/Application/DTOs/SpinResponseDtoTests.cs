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
                new[] { "🐯", "🐯", "🐯", "🐯" },
                new[] { "🎋", "🐉", "🎋", "🎋" },
                new[] { "🪙", "🏮", "🪙", "🎋" },
                new[] { "🎋", "🎋", "🎋", "🎋" }
            };
            decimal prize = 6.00m;
            decimal balance = 105.00m;
            bool isWinner = true;
            decimal bet = 3.00m;
            decimal jackpotWon = 0m;
            decimal jackpotPot = 0.03m;

            // Act
            var dto = new SpinResponseDto(rows, prize, balance, isWinner, bet, jackpotWon, jackpotPot);

            // Assert
            dto.Rows.Should().BeEquivalentTo(rows);
            dto.PrizeWon.Should().Be(prize);
            dto.CurrentBalance.Should().Be(balance);
            dto.IsWinner.Should().BeTrue();
            dto.BetAmount.Should().Be(bet);
            dto.JackpotWon.Should().Be(jackpotWon);
            dto.JackpotPot.Should().Be(jackpotPot);
        }

        [Fact]
        public void SpinResponseDto_ShouldHandleLossCorrectly()
        {
            // Arrange
            string[][] rows = new[]
            {
                new[] { "🎋", "🪙", "🐯", "🎋" },
                new[] { "🏮", "🎋", "🐉", "🎋" },
                new[] { "🐯", "🐯", "🎋", "🎋" },
                new[] { "🎋", "🎋", "🎋", "🎋" }
            };

            // Act
            var dto = new SpinResponseDto(rows, 0m, 97.00m, false, 3.00m, 0m, 0m);

            // Assert
            dto.IsWinner.Should().BeFalse();
            dto.PrizeWon.Should().Be(0m);
        }

        [Fact]
        public void SpinResponseDto_ShouldExposeJackpotData()
        {
            // Arrange
            string[][] rows = new[]
            {
                new[] { "🐉", "🐉", "🐉", "🐉" },
                new[] { "🎋", "🎋", "🎋", "🎋" },
                new[] { "🎋", "🎋", "🎋", "🎋" },
                new[] { "🎋", "🎋", "🎋", "🎋" }
            };

            // Act
            var dto = new SpinResponseDto(rows, 300m, 450m, true, 3.00m, 250.55m, 0m);

            // Assert
            dto.JackpotWon.Should().Be(250.55m);
            dto.JackpotPot.Should().Be(0m); // zerou apos ganhar
        }
    }
}
