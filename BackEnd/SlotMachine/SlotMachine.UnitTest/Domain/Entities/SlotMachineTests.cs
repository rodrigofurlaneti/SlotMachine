using NSubstitute;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Test.UnitTest.Domain.Entities
{
    // Implementação de teste isolada do repositório global de jackpot
    internal sealed class TestJackpotRepository : IGlobalJackpotRepository
    {
        private decimal _pot;
        public TestJackpotRepository(decimal initialPot = 0m) => _pot = initialPot;
        public decimal GetPot() => _pot;
        public void AddContribution(decimal amount) { _pot += amount; _pot = decimal.Round(_pot, 2); }
        public decimal ClaimPot() { var v = _pot; _pot = 0m; return v; }
    }

    public class SlotMachineTests
    {
        // Indices dos simbolos baseados no array do Domain (pesos cumulativos):
        //   Tigre   [0-39]   (peso 40, mult 2)
        //   Moeda   [40-59]  (peso 20, mult 5)
        //   Lanterna[60-69]  (peso 10, mult 10)
        //   Dragao  [70-71]  (peso 2,  mult 100)
        //   Envelope[72-75]  (peso 4,  mult 0  - JACKPOT TRIGGER)
        //   Bambu   [76-135] (peso 60, mult 0)
        private const int TIGER = 0;
        private const int DRAGON = 70;
        private const int ENVELOPE = 72;
        private const int BAMBOO = 80;

        private readonly IRandomGenerator _rngMock;
        private readonly SlotMachine.Domain.Entities.SlotMachine _slotMachine;

        public SlotMachineTests()
        {
            _rngMock = Substitute.For<IRandomGenerator>();
            _slotMachine = new SlotMachine.Domain.Entities.SlotMachine();
        }

        [Fact]
        public void Spin_ShouldDebitBalance_RegardlessOfResult()
        {
            var player = new Player("Teste", 100m);
            var jackpot = new TestJackpotRepository();
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(TIGER);

            _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);

            player.Balance.Should().NotBe(100m);
        }

        [Fact]
        public void Spin_WhenAllSymbolsAreTiger_ShouldPayAll10Lines()
        {
            var player = new Player("Vencedor", 50m);
            var jackpot = new TestJackpotRepository();
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(TIGER);

            var result = _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);

            // 10 linhas pagantes (4H + 4V + 2D) com tigre (mult 2): 10 * 3 * 2 = 60
            result.PrizeWon.Should().Be(60m);
            result.BetAmount.Should().Be(3.00m);
            player.Balance.Should().Be(107m);
            result.Rows.Should().HaveCount(4);
            result.Rows[0].Should().HaveCount(4);
            // Tigre nao dispara jackpot
            result.JackpotWon.Should().Be(0m);
        }

        [Fact]
        public void Spin_WhenAllTiger_WithDifferentBet_ShouldScalePrizeProportionally()
        {
            var player = new Player("Vencedor", 200m);
            var jackpot = new TestJackpotRepository();
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(TIGER);

            var result = _slotMachine.Spin(player, _rngMock, 5.00m, jackpot);

            result.PrizeWon.Should().Be(100m);
            result.BetAmount.Should().Be(5.00m);
            player.Balance.Should().Be(295m);
        }

        [Fact]
        public void Spin_WhenOnlyMainDiagonalMatches_ShouldPayOnlyThatLine()
        {
            var player = new Player("Sortudo", 50m);
            var jackpot = new TestJackpotRepository();
            var sequence = new int[16];
            for (int i = 0; i < 16; i++) sequence[i] = BAMBOO;
            // Diagonal principal: indices 0, 5, 10, 15 no array linear
            sequence[0] = TIGER;
            sequence[5] = TIGER;
            sequence[10] = TIGER;
            sequence[15] = TIGER;

            var callCount = 0;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>())
                .Returns(_ => sequence[callCount++]);

            var result = _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);

            result.PrizeWon.Should().Be(6m);
            player.Balance.Should().Be(53m);
        }

        [Fact]
        public void Spin_WhenSingleHorizontalRowMatches_ShouldPayOnlyThatRow()
        {
            var player = new Player("Sortudo", 50m);
            var jackpot = new TestJackpotRepository();
            var sequence = new int[16];
            for (int i = 0; i < 16; i++) sequence[i] = BAMBOO;
            sequence[0] = TIGER;
            sequence[1] = TIGER;
            sequence[2] = TIGER;
            sequence[3] = TIGER;

            var callCount = 0;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>())
                .Returns(_ => sequence[callCount++]);

            var result = _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);

            result.PrizeWon.Should().Be(6m);
        }

        [Fact]
        public void Spin_WhenSingleVerticalColumnMatches_ShouldPayOnlyThatColumn()
        {
            var player = new Player("Sortudo", 50m);
            var jackpot = new TestJackpotRepository();
            var sequence = new int[16];
            for (int i = 0; i < 16; i++) sequence[i] = BAMBOO;
            sequence[0] = TIGER;
            sequence[4] = TIGER;
            sequence[8] = TIGER;
            sequence[12] = TIGER;

            var callCount = 0;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>())
                .Returns(_ => sequence[callCount++]);

            var result = _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);

            result.PrizeWon.Should().Be(6m);
        }

        [Fact]
        public void Spin_WithInsufficientBalance_ShouldThrowException()
        {
            var player = new Player("Pobre", 0.50m);
            var jackpot = new TestJackpotRepository();
            Action action = () => _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);
            action.Should().Throw<Exception>()
                  .WithMessage("Saldo insuficiente para girar.");
        }

        [Theory]
        [InlineData(0.49)]
        [InlineData(30.01)]
        [InlineData(0)]
        [InlineData(-1)]
        public void Spin_WithBetOutOfRange_ShouldThrowArgumentOutOfRange(decimal bet)
        {
            var player = new Player("Teste", 1000m);
            var jackpot = new TestJackpotRepository();
            Action action = () => _slotMachine.Spin(player, _rngMock, bet, jackpot);
            action.Should().Throw<ArgumentOutOfRangeException>();
        }

        [Fact]
        public void Spin_WithFractionalCents_ShouldThrow()
        {
            var player = new Player("Teste", 1000m);
            var jackpot = new TestJackpotRepository();
            Action action = () => _slotMachine.Spin(player, _rngMock, 1.005m, jackpot);
            action.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void ValidateBet_ShouldAcceptBoundaryValues()
        {
            FluentActions.Invoking(() => SlotMachine.Domain.Entities.SlotMachine.ValidateBet(0.50m))
                .Should().NotThrow();
            FluentActions.Invoking(() => SlotMachine.Domain.Entities.SlotMachine.ValidateBet(30.00m))
                .Should().NotThrow();
        }

        [Fact]
        public void GridSize_ShouldBe4()
        {
            SlotMachine.Domain.Entities.SlotMachine.GridSize.Should().Be(4);
        }

        [Fact]
        public void Spin_ShouldContribute1PercentOfBetToGlobalJackpot()
        {
            var player = new Player("Teste", 100m);
            var jackpot = new TestJackpotRepository();
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(BAMBOO);

            var result = _slotMachine.Spin(player, _rngMock, 5.00m, jackpot);

            // 1% de R$5,00 = R$0,05 vai para o pote global
            jackpot.GetPot().Should().Be(0.05m);
            result.JackpotPot.Should().Be(0.05m);
            result.JackpotWon.Should().Be(0m);
        }

        [Fact]
        public void Spin_WithDragonLine_ShouldPayPrizeButNotJackpot()
        {
            // Dragao NAO dispara o jackpot (so envelope dispara).
            var player = new Player("DragonOnly", 50m);
            // Pote global ja tem 100 de outros jogadores
            var jackpot = new TestJackpotRepository(initialPot: 100m);

            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(DRAGON);

            var result = _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);

            // 10 linhas de dragao (mult 100): 10 * 3 * 100 = 3000
            result.PrizeWon.Should().Be(3000m);
            // Jackpot NAO disparado por dragao
            result.JackpotWon.Should().Be(0m);
            // Pote global: 100 (anterior) + 0.03 (1% de R$3) = 100.03
            jackpot.GetPot().Should().Be(100.03m);
            result.JackpotPot.Should().Be(100.03m);
            // Saldo: 50 - 3 + 3000 = 3047
            player.Balance.Should().Be(3047m);
        }

        [Fact]
        public void Spin_WithEnvelopeLine_ShouldPayGlobalJackpotAndZeroPot()
        {
            // Envelope tem multiplicador 0 (nao paga premio normal) e dispara jackpot global.
            var player = new Player("LuckyEnvelope", 50m);
            // Simula pote global acumulado por varios jogadores
            var jackpot = new TestJackpotRepository(initialPot: 500m);

            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(ENVELOPE);

            var result = _slotMachine.Spin(player, _rngMock, 3.00m, jackpot);

            // Grid todo de envelope: linhas alinham mas mult=0 -> sem premio normal
            result.PrizeWon.Should().Be(0m);
            // Jackpot disparado — jogador ganha o pote global (500 + 0.03 da aposta atual)
            result.JackpotWon.Should().Be(500.03m);
            // Pote zerado apos o pagamento
            result.JackpotPot.Should().Be(0m);
            jackpot.GetPot().Should().Be(0m);
            // Saldo: 50 - 3 + 500.03 = 547.03
            player.Balance.Should().Be(547.03m);
        }

        [Fact]
        public void Spin_GlobalJackpotAccumulatesAcrossMultiplePlayers()
        {
            // Simula dois jogadores contribuindo para o mesmo pote global
            var playerA = new Player("JogadorA", 100m);
            var playerB = new Player("JogadorB", 100m);
            var sharedJackpot = new TestJackpotRepository();

            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(BAMBOO);

            _slotMachine.Spin(playerA, _rngMock, 10.00m, sharedJackpot); // +0.10
            _slotMachine.Spin(playerB, _rngMock, 20.00m, sharedJackpot); // +0.20

            // Pote global deve acumular contribuições de ambos
            sharedJackpot.GetPot().Should().Be(0.30m);
        }
    }
}
