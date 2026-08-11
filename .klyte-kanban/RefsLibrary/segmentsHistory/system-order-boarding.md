# SystemOrder: where PT boarding / occupancy sampling belongs

Reference for Cities Skylines II update-phase ordering relevant to **historical line segment occupancy** (`XTMSegmentOccupancyHistorySystem`).

## Sources

| Source | Path |
|---|---|
| Vanilla system registration | `Game/Common/SystemOrder.cs` (`SystemOrder.Initialize`) |
| Phase enum | `Game/SystemUpdatePhase.cs` |
| Boarding apply job (not a SystemBase) | `Game/Simulation/TransportBoardingHelpers.cs` |
| Example AI host | `Game/Simulation/TransportCarAISystem.cs` |
| Decompile root | `V:/GameModding/Cities Skylines/CodedMods/Belzont/AI_Workspace/refs/CS2_decompile` |

## Verdict

**`SystemUpdatePhase.GameSimulation` is the correct phase** for detecting boarding-end and sampling vehicle load.

`EndBoarding` is **not** registered as its own system in `SystemOrder`. It runs as `TransportBoardingHelpers.TransportBoardingJob`, scheduled **inside** each `Transport*AISystem.OnUpdate` during `GameSimulation`.

## Relevant `SystemOrder` entries

### ModificationEnd (not the departure sample phase)

Cleanup / route graph work, including stale boarding refs:

```text
ModificationEnd:
  ...
  RoutePathSystem
  BoardingVehicleSystem          ← clears stale BoardingVehicle refs; NOT EndBoarding
  ...
```

Do **not** put occupancy sampling here: boarding flags are flipped during sim AI, not in this modification pass.

### GameSimulation — vehicle AI cluster (boarding happens here)

Approximate registration order from `SystemOrder.Initialize` (line numbers refer to decompile `SystemOrder.cs`):

```text
GameSimulation (navigation → PT AI → move → …):
  CarNavigationSystem (+ Actions)
  TrainNavigationSystem
  WatercraftNavigationSystem
  AircraftNavigationSystem
  AmbulanceAISystem
  TransportCarAISystem              ← ~L319; schedules TransportBoardingJob after tick job
  GarbageTruckAISystem
  TransportTrainAISystem            ← ~L321
  ...
  TransportWatercraftAISystem       ← ~L326
  ...
  TransportAircraftAISystem         ← ~L329
  ...
  CarMoveSystem / TrainMoveSystem / …
  ...
  TimeSystem                        ← ~L361 (AFTER PT AI cluster)
  ...
  TransportLineSystem               ← ~L589 (much later; segment timing refresh)
  TransportStopSystem
  WaitingPassengersSystem
  TransportUsageTrackSystem         ← ~L597 (building cargo stats via events; not per-stop EMA)
  TransportRequirementSystem (UpdateAfter UsageTrack)
```

### How `EndBoarding` is actually applied

From `TransportCarAISystem.OnUpdate` (same pattern on train/watercraft/aircraft AI):

1. Tick job queues begin/end boarding items into `TransportBoardingHelpers.BoardingData`.
2. Same `OnUpdate` calls `boardingData.ScheduleBoarding(...)` → `TransportBoardingJob`.
3. That job’s `EndBoarding` clears `PublicTransportFlags.Boarding` / `CargoTransportFlags.Boarding` (and stop `BoardingVehicle`).
4. AI tick path that requested end boarding then advances `Target` via `SetNextWaypointTarget` (same sim update window).

So by the time a **later** `GameSimulation` system runs (or the next frame’s mark pass after ECB), boarding-end is visible on components.

`TransportBoardingHelpers` itself does **not** appear in `SystemOrder`; only the host AI systems do.

## Implications for XTM

| Choice | Finding |
|---|---|
| Phase | **`GameSimulation`** — confirmed by vanilla PT AI registration |
| Not `UIUpdate` | UI phase does not host transport AI / boarding jobs |
| Not `ModificationEnd` | `BoardingVehicleSystem` there is cleanup only |
| Relative order | Prefer running **after** the last PT AI system that schedules boarding (`TransportAircraftAISystem` is the last of the four in `SystemOrder`) so mark pass sees cleared `Boarding` |
| Time read | Vanilla `TimeSystem` is registered **after** the PT AI cluster (~L361). Reading `TimeSystem.normalizedTime` / `TimeSystem.GetDay` from a system ordered after PT AI (or after `TimeSystem`) is consistent with vanilla |
| Wrong layer | `TransportUsageTrackSystem` tracks building transport usage events, not per-waypoint vehicle occupancy history |

### Current mod registration

[`ExtendedTransportManagerMod.DoOnCreateWorld`](../../BelzontTLM/ExtendedTransportManagerMod.cs):

```csharp
updateSystem.UpdateAt<XTMSegmentOccupancyHistorySystem>(SystemUpdatePhase.GameSimulation);
```

`UpdateAt` alone does not pin order vs vanilla PT AI. Safer if mark/apply must always see post-`EndBoarding` state in the **same** sim frame:

```csharp
updateSystem.UpdateAfter<XTMSegmentOccupancyHistorySystem, TransportAircraftAISystem>(
    SystemUpdatePhase.GameSimulation);
```

(or `UpdateAfter<..., TimeSystem>` if clock fields from that system’s update matter).

Mod systems registered only with `UpdateAt` may still work across frames via the boarding tracker + 32-frame batch, but explicit `UpdateAfter` matches the dependency implied by `SystemOrder`.

## Related types (quick map)

| Type | Role |
|---|---|
| `TransportCarAISystem` / `Train` / `Watercraft` / `Aircraft` | Host boarding queue + AI tick |
| `TransportBoardingHelpers.TransportBoardingJob` | Applies `BeginBoarding` / `EndBoarding` |
| `BoardingVehicleSystem` | ModificationEnd cleanup of stop→vehicle boarding links |
| `TransportLineSystem` | Late GameSimulation line/segment maintenance |
| `TransportUsageTrackSystem` | Cargo usage event drain (buildings) |
| `TimeSystem` | Day/time-of-day for EMA buckets |

## See also

- Occupancy draft: [`segmentsHistory/draft.cs`](draft.cs)
- Implementation: `BelzontTLM/Systems/XTMSegmentOccupancyHistorySystem.cs`
