# Graph Report - SlotMachine  (2026-05-11)

## Corpus Check
- 73 files · ~7,548 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 271 nodes · 232 edges · 66 communities (42 shown, 24 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]

## God Nodes (most connected - your core abstractions)
1. `SlotMachineSteps` - 17 edges
2. `JogarNaSlotMachineFeature` - 16 edges
3. `SlotAppService` - 9 edges
4. `SlotAppServiceTests` - 9 edges
5. `SlotControllerTests` - 8 edges
6. `SlotAuditorTests` - 8 edges
7. `SlotMachine` - 7 edges
8. `SlotController` - 6 edges
9. `IRandomGenerator` - 6 edges
10. `SlotMachineTests` - 6 edges

## Surprising Connections (you probably didn't know these)
- `SlotAppService` --inherits--> `ISlotAppService`  [EXTRACTED]
  SlotMachine.Application/Services/SlotAppService.cs → SlotMachine.UnitTest/Api/Controllers/SlotControllerTests.cs
- `SlotAppService` --references--> `IRandomGenerator`  [EXTRACTED]
  SlotMachine.Application/Services/SlotAppService.cs → SlotMachine.UnitTest/Domain/Services/SlotAuditorTests.cs
- `SlotAppService` --references--> `SlotMachine`  [EXTRACTED]
  SlotMachine.Application/Services/SlotAppService.cs → SlotMachine.UnitTest/Domain/Services/SlotAuditorTests.cs
- `SlotMachineSteps` --references--> `IRandomGenerator`  [EXTRACTED]
  SlotMachine.TestSpecs/StepDefinitions/SlotMachineSteps.cs → SlotMachine.UnitTest/Domain/Services/SlotAuditorTests.cs
- `SlotMachineSteps` --references--> `SlotMachine`  [EXTRACTED]
  SlotMachine.TestSpecs/StepDefinitions/SlotMachineSteps.cs → SlotMachine.UnitTest/Domain/Services/SlotAuditorTests.cs

## Communities (66 total, 24 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (12): ConcurrentDictionary, IAuditLogger, IPlayerRepository, FileAuditLogger, SlotMachine.Infrastructure.Logging, InMemoryPlayerRepository, SlotMachine.Infrastructure.Repositories, SlotAppService (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (9): SlotMachine.Test.UnitTest.Domain.Entities, SlotMachineTests, IRandomGenerator, SlotAuditorTests, SlotMachine.Test.UnitTest.Domain.Services, SlotMachine.Infrastructure.Services, SystemRandomGenerator, SlotAuditor (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (6): FixtureData, JogarNaSlotMachineFeature, SlotMachine.Test.Specs.Features, ITestOutputHelper, ITestRunner, string

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (7): ControllerBase, SlotController, SlotMachine.Api.Controllers, SlotControllerTests, SlotMachine.Test.UnitTest.Api.Controllers, ISlotAppService, SlotController

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (5): Exception, Player, SpinResult, SlotMachine.Test.Specs.StepDefinitions, SlotMachineSteps

### Community 5 - "Community 5"
Cohesion: 0.31
Nodes (4): decimal, SlotMachine, SlotMachine.Domain.Entities, Symbol

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (3): InMemoryPlayerRepository, InMemoryPlayerRepositoryTests, SlotMachine.Test.UnitTest.Infrastructure.Repositories

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (3): Assembly, SlotMachine_Test_Specs_SpecFlowNonParallelizableFeaturesCollectionDefinition, SlotMachine_Test_Specs_XUnitAssemblyFixture

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (3): SlotMachine.Test.UnitTest.Infrastructure.Services, SystemRandomGeneratorTests, SystemRandomGenerator

## Knowledge Gaps
- **53 isolated node(s):** `Program`, `SlotMachine.Api.Controllers`, `SlotMachine.Application`, `SlotMachine.Application.DTOs`, `SlotMachine.Application.DTOs` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SlotAppService` connect `Community 0` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `IRandomGenerator` connect `Community 1` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `SlotMachineSteps` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `Program`, `SlotMachine.Api.Controllers`, `SlotMachine.Application` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._