using SlotMachine.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SlotMachine.Test.UnitTest.Application.DTOs
{
    public class CreatePlayerRequestTests
    {
        [Fact]
        public void CreatePlayerRequest_ShouldInitializeCorrectly()
        {
            // Arrange
            var name = "Danilo";
            var balance = 500m;

            // Act
            var request = new CreatePlayerRequest(name, balance);

            // Assert
            request.Name.Should().Be(name);
            request.Balance.Should().Be(balance);
        }

        [Fact]
        public void CreatePlayerRequest_Equality_ShouldBeBasedOnValue()
        {
            // Arrange
            var req1 = new CreatePlayerRequest("Danilo", 100m);
            var req2 = new CreatePlayerRequest("Danilo", 100m);

            // Assert
            // Como é um Record, a igualdade é pelo valor das propriedades
            req1.Should().Be(req2);
        }

        [Theory]
        [InlineData("", -100)]
        [InlineData(" ", 0)]
        [InlineData(null, 1000)]
        public void CreatePlayerRequest_ShouldAcceptAnyData_LeavingValidationToDomain(string name, decimal balance)
        {
            // O DTO é apenas um "carregador" de dados. 
            // Ele deve aceitar os dados para que o SlotAppService/Player possa validá-los.

            // Act
            var request = new CreatePlayerRequest(name, balance);

            // Assert
            request.Name.Should().Be(name);
            request.Balance.Should().Be(balance);
        }
    }
}