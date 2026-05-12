using TechTalk.SpecFlow;
using Serilog;
using System.IO;

namespace SlotMachine.Test.Specs.Hooks
{
    [Binding]
    public class Hooks
    {
        // Executa uma única vez antes de todos os testes começarem
        [BeforeTestRun]
        public static void BeforeTestRun()
        {
            // Garante que a pasta de logs de teste exista
            if (!Directory.Exists("TestLogs"))
            {
                Directory.CreateDirectory("TestLogs");
            }
        }

        // Executa antes de CADA cenário (Scenario) no arquivo .feature
        [BeforeScenario]
        public void BeforeScenario()
        {
            // Aqui você poderia resetar um banco de dados em memória 
            // ou limpar caches se estivesse usando a API real.
            Console.WriteLine("Iniciando novo cenário de teste da Slot Machine...");
        }

        // Executa depois de CADA cenário
        [AfterScenario]
        public void AfterScenario(ScenarioContext scenarioContext)
        {
            // Se o teste falhar, podemos tirar um "print" ou logar o erro
            if (scenarioContext.TestError != null)
            {
                Log.Error($"Cenário falhou: {scenarioContext.ScenarioInfo.Title}. Erro: {scenarioContext.TestError.Message}");
            }
        }

        // Executa uma única vez após todos os testes terminarem
        [AfterTestRun]
        public static void AfterTestRun()
        {
            // Encerra o logger e libera os arquivos
            Log.CloseAndFlush();
        }
    }
}