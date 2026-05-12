using SlotMachine.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SlotMachine.Test.UnitTest.Infrastructure.Services
{
    public class SystemRandomGeneratorTests
    {
        private readonly SystemRandomGenerator _generator;

        public SystemRandomGeneratorTests()
        {
            _generator = new SystemRandomGenerator();
        }

        [Fact]
        public void Next_ShouldReturnValuesWithinRange()
        {
            // Arrange
            int min = 1;
            int max = 10;

            // Act
            // Vamos rodar 1000 vezes para garantir que nunca saia do range
            for (int i = 0; i < 1000; i++)
            {
                int result = _generator.Next(min, max);

                // Assert
                result.Should().BeInRange(min, max - 1);
            }
        }

        [Fact]
        public void Next_ShouldBeRandomEnough()
        {
            // Act
            int firstResult = _generator.Next(0, 1000000);
            int secondResult = _generator.Next(0, 1000000);

            // Assert
            // É tecnicamente possível serem iguais, mas estatisticamente improvável
            firstResult.Should().NotBe(secondResult);
        }
    }
}