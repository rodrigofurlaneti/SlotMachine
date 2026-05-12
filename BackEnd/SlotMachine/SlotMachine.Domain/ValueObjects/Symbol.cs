namespace SlotMachine.Domain.ValueObjects
{
    public record Symbol(string Face, decimal PayoutMultiplier, int ProbabilityWeight);
}
