using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using SlotMachine.Api.Controllers;
using SlotMachine.Application.DTOs;
using SlotMachine.Application.Services;
using FluentAssertions; 

namespace SlotMachine.Test.UnitTest.Api.Controllers
{
    public class SlotControllerTests
    {
        private readonly ISlotAppService _appServiceMock;
        private readonly SlotController _controller;

        public SlotControllerTests()
        {
            _appServiceMock = Substitute.For<ISlotAppService>();
            _controller = new SlotController(_appServiceMock);
        }

        [Fact]
        public void CreatePlayer_WhenRequestIsValid_ShouldReturnOk()
        {
            // Arrange
            var request = new CreatePlayerRequest("Danilo", 100m);
            var expectedResponse = new PlayerDto(Guid.NewGuid(), "Danilo", 100m);

            _appServiceMock.CreatePlayer(request.Name, request.Balance).Returns(expectedResponse);

            // Act
            var result = _controller.CreatePlayer(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedResponse);
            _appServiceMock.Received(1).CreatePlayer(request.Name, request.Balance);
        }

        [Fact]
        public void CreatePlayer_WhenExceptionOccurs_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new CreatePlayerRequest("Erro", 10m);
            _appServiceMock.CreatePlayer(Arg.Any<string>(), Arg.Any<decimal>())
                           .Throws(new Exception("Erro simulado"));

            // Act
            var result = _controller.CreatePlayer(request);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.ToString().Should().Contain("Erro simulado");
        }

        [Fact]
        public void Spin_WhenPlayerExists_ShouldReturnSpinResult()
        {
            // Arrange
            var playerId = Guid.NewGuid();
            var request = new SpinRequestDto(3.00m);
            var expectedSpin = new SpinResponseDto(new string[3][], 0, 100, false, 3.00m);
            _appServiceMock.PlaySpin(playerId, request.BetAmount).Returns(expectedSpin);

            // Act
            var result = _controller.Spin(playerId, request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be(expectedSpin);
        }

        [Fact]
        public void Spin_WhenPlayerNotFound_ShouldReturnBadRequest()
        {
            // Arrange
            var playerId = Guid.NewGuid();
            var request = new SpinRequestDto(3.00m);
            _appServiceMock.PlaySpin(playerId, request.BetAmount)
                           .Throws(new Exception("Jogador não encontrado."));

            // Act
            var result = _controller.Spin(playerId, request);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.ToString().Should().Contain("Jogador não encontrado.");
        }

        [Fact]
        public void Spin_WhenBetIsOutOfRange_ShouldReturnBadRequest()
        {
            // Arrange
            var playerId = Guid.NewGuid();
            var request = new SpinRequestDto(0.10m); // abaixo do mínimo
            _appServiceMock.PlaySpin(playerId, request.BetAmount)
                           .Throws(new ArgumentOutOfRangeException(
                               "betAmount",
                               "Aposta inválida. Permitido entre R$ 0,50 e R$ 30,00."));

            // Act
            var result = _controller.Spin(playerId, request);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void GetBetConfig_ShouldReturnPresetsAndRange()
        {
            // Act
            var result = _controller.GetBetConfig();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public void RunAudit_ShouldReturnAuditDto()
        {
            // Arrange
            int spins = 1000;
            var expectedAudit = new AuditResultDto(spins, 95.5m, 4.5m);
            _appServiceMock.RunAuditSimulation(spins).Returns(expectedAudit);

            // Act
            var result = _controller.RunAudit(spins);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be(expectedAudit);
        }
    }
}