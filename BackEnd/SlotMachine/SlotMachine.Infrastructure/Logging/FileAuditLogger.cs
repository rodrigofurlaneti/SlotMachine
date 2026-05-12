using Serilog;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Infrastructure.Logging
{
    public class FileAuditLogger : IAuditLogger
    {
        public FileAuditLogger()
        {
            Log.Logger = new LoggerConfiguration()
                .WriteTo.Async(a => a.File(
                    path: "logs/audit_log.json",
                    rollingInterval: RollingInterval.Day,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}",
                    shared: true
                ))
                .CreateLogger();
        }

        public void LogAction(string action, object data)
        {
            Log.Information("Action: {Action} | Data: {@Data}", action, data);
        }
    }
}