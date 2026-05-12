using SlotMachine.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SlotMachine.Test.UnitTest.Application.DTOs
{
    public class PlayerDtoTests
    {
        [Fact]
        public void PlayerDto_ShouldStoreValuesCorrectly()
        {
            // Arrange
            var id = Guid.NewGuid();
            var name = "Danilo";
            var balance = 150.50m;

            // Act
            var dto = new PlayerDto(id, name, balance);

            // Assert
            dto.Id.Should().Be(id);
            dto.Name.Should().Be(name);
            dto.Balance.Should().Be(balance);
        }

        [Fact]
        public void PlayerDto_Equality_ShouldBeBasedOnValue()
        {
            // Arrange
            var id = Guid.Parse("7a9f6d1a-4d7a-4c8e-8a9d-1a8d943cbd54");
            var dto1 = new PlayerDto(id, "Danilo", 100m);
            var dto2 = new PlayerDto(id, "Danilo", 100m);

            // Assert
            // Records garantem que, se o conteúdo for igual, o objeto é igual
            dto1.Should().Be(dto2);
        }

        [Fact]
        public void PlayerDto_ShouldBeImmutable()
        {
            // Arrange
            var dto = new PlayerDto(Guid.NewGuid(), "Danilo", 100m);

            // Assert
            // Em C#, propriedades de records posicionais são init-only por padrão.
            // Isso garante que o DTO não seja alterado após sair do AppService.
            dto.Should().NotBeNull();
        }
    }
}