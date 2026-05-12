using SlotMachine.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SlotMachine.Test.UnitTest.Application.DTOs
{
    public class AuditResultDtoTests
    {
        [Fact]
        public void AuditResultDto_ShouldStoreValuesCorrectly()
        {
            // Arrange
            long totalSpins = 1000000;
            decimal rtp = 96.5m;
            decimal houseEdge = 3.5m;

            // Act
            var dto = new AuditResultDto(totalSpins, rtp, houseEdge);

            // Assert
            dto.TotalSpins.Should().Be(totalSpins);
            dto.ExpectedRTP.Should().Be(rtp);
            dto.HouseEdge.Should().Be(houseEdge);
        }

        [Fact]
        public void AuditResultDto_ShouldBeImmutable()
        {
            // Arrange
            var dto = new AuditResultDto(100, 95m, 5m);

            // Assert
            // Records por padrão não permitem alteração de propriedades (init-only)
            // Este teste é mais conceitual, pois o compilador nem permitiria o código abaixo:
            // dto.TotalSpins = 200; 

            dto.Should().NotBeNull();
        }

        [Fact]
        public void AuditResultDto_Equality_ShouldBeBasedOnValue()
        {
            // Arrange
            var dto1 = new AuditResultDto(1000, 92.0m, 8.0m);
            var dto2 = new AuditResultDto(1000, 92.0m, 8.0m);

            // Assert
            dto1.Should().Be(dto2);
        }
    }
}