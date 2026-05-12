namespace SlotMachine.Domain.Interfaces
{
    // Abstraímos o gerador de números para não dependermos do System.Random no domínio.
    // Isso é vital para criar testes unitários previsíveis e simulações de auditoria.
    public interface IRandomGenerator
    {
        int Next(int min, int maxExclusive);
    }
}
