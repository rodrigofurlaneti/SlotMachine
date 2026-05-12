namespace SlotMachine.Domain.Interfaces
{
    public interface IAuditLogger
    {
        void LogAction(string action, object data);
    }
}
