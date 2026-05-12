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
            var expectedSpin = new SpinResponseDto(new string[3][], 0, 100, false);
            _appServiceMock.PlaySpin(playerId).Returns(expectedSpin);

            // Act
            var result = _controller.Spin(playerId);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be(expectedSpin);
        }

        [Fact]
        public void Spin_WhenPlayerNotFound_ShouldReturnBadRequest()
        {
            // Arrange
            var playerId = Guid.NewGuid();
            _appServiceMock.PlaySpin(playerId).Throws(new Exception("Jogador não encontrado."));

            // Act
            var result = _controller.Spin(playerId);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.ToString().Should().Contain("Jogador não encontrado.");
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