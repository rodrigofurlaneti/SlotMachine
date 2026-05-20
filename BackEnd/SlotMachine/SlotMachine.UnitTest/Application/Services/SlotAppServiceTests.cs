using System;
using SlotMachine.Application.Services;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;
using NSubstitute;
using Xunit;
using FluentAssertions;

namespace SlotMachine.Test.UnitTest.Application.Services
{
    public class SlotAppServiceTests
    {
        private readonly IPlayerRepository _repositoryMock;
        private readonly IRandomGenerator _rngMock;
        private readonly IAuditLogger _loggerMock; // Novo Mock para o Logger
        private readonly SlotAppService _service;

        public SlotAppServiceTests()
        {
            // Criamos "dublês" (mocks) das interfaces necessárias
            _repositoryMock = Substitute.For<IPlayerRepository>();
            _rngMock = Substitute.For<IRandomGenerator>();
            _loggerMock = Substitute.For<IAuditLogger>(); // Inicializa o mock do logger

            // Instanciamos o serviço injetando os mocks (inclusive o novo logger)
            _service = new SlotAppService(_repositoryMock, _rngMock, _loggerMock);
        }

        [Fact]
        public void CreatePlayer_ShouldSaveInRepository_AndLogAction()
        {
            // Arrange
            string name = "Danilo";
            decimal balance = 50m;

            // Act
            var result = _service.CreatePlayer(name, balance);

            // Assert
            result.Name.Should().Be(name);
            result.Balance.Should().Be(balance);

            // Verifica se salvou no repositório
            _repositoryMock.Received(1).Save(Arg.Is<Player>(p => p.Name == name));

            // Verifica se o log de auditoria foi acionado
            _loggerMock.Received(1).LogAction("PLAYER_CREATED", Arg.Any<object>());
        }

        [Fact]
        public void PlaySpin_WhenPlayerExists_ShouldUpdateBalance_Save_AndLog()
        {
            // Arrange
            var playerId = Guid.NewGuid();
            var player = new Player("Danilo", 100m);

            _repositoryMock.GetById(playerId).Returns(player);
            // Peso 0 força o primeiro símbolo da sua lista (ex: Cereja)
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0);

            // Act
            var response = _service.PlaySpin(playerId, 3.00m);

            // Assert
            player.Balance.Should().NotBe(100m); // Saldo alterado
            response.Rows.Should().HaveCount(3); // Retornou 3 linhas

            // Verificações de persistência e auditoria
            _repositoryMock.Received(1).Save(player);
            _loggerMock.Received(1).LogAction("SLOT_SPIN", Arg.Any<object>());
        }

        [Fact]
        public void RunAuditSimulation_ShouldReturnValidAuditResult_AndLogSimulation()
        {
            // Arrange
            int numberOfSpins = 100;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0);

            // Act
            var result = _service.RunAuditSimulation(numberOfSpins);

            // Assert
            result.TotalSpins.Should().Be(numberOfSpins);
            result.ExpectedRTP.Should().BeGreaterThan(0);
            (result.ExpectedRTP + result.HouseEdge).Should().Be(100m);

            // Verifica se a simulação também foi auditada no log
            _loggerMock.Received(1).LogAction("AUDIT_SIMULATION_RUN", Arg.Any<object>());
        }

        [Fact]
        public void PlaySpin_WhenPlayerDoesNotExist_ShouldThrowException()
        {
            // Arrange
            var invalidId = Guid.NewGuid();
            _repositoryMock.GetById(invalidId).Returns((Player)null);

            // Act
            Action action = () => _service.PlaySpin(invalidId, 3.00m);

            // Assert
            action.Should().Throw<Exception>().WithMessage("Jogador não encontrado.");

            // Garante que, se o jogador não existe, o log de giro NÃO é chamado
            _loggerMock.DidNotReceive().LogAction("SLOT_SPIN", Arg.Any<object>());
        }
    }
}