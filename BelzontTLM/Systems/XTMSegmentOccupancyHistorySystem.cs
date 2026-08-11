using Game;
using Game.Common;
using Game.Routes;
using Game.Simulation;
using Game.Tools;
using Game.Vehicles;
using Unity.Burst;
using Unity.Burst.Intrinsics;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;
using Target = Game.Common.Target;

namespace BelzontTLM
{
    /// <summary>
    /// Marks PT/cargo vehicles when boarding ends, then every 32 frames applies peak-biased EMA
    /// occupancy history onto departure waypoint entities.
    /// </summary>
    public partial class XTMSegmentOccupancyHistorySystem : GameSystemBase
    {
        private const float Alpha = 0.3f;
        private const uint BatchIntervalFrames = 32;

        private EntityQuery m_VehicleQuery;
        private EntityQuery m_PendingQuery;
        private EntityQuery m_TimeDataQuery;
        private SimulationSystem m_SimulationSystem;
        private TimeSystem m_TimeSystem;
        private EndFrameBarrier m_EndFrameBarrier;

        protected override void OnCreate()
        {
            base.OnCreate();
            m_SimulationSystem = World.GetOrCreateSystemManaged<SimulationSystem>();
            m_TimeSystem = World.GetOrCreateSystemManaged<TimeSystem>();
            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();

            m_VehicleQuery = GetEntityQuery(new EntityQueryDesc
            {
                Any =
                [
                    ComponentType.ReadOnly<PublicTransport>(),
                    ComponentType.ReadOnly<CargoTransport>()
                ],
                All =
                [
                    ComponentType.ReadOnly<CurrentRoute>(),
                    ComponentType.ReadOnly<Target>()
                ],
                None =
                [
                    ComponentType.ReadOnly<Deleted>(),
                    ComponentType.ReadOnly<Temp>()
                ]
            });

            m_PendingQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMSegmentOccupancyPendingSample>(),
                ComponentType.Exclude<Deleted>(),
                ComponentType.Exclude<Temp>());

            m_TimeDataQuery = GetEntityQuery(ComponentType.ReadOnly<TimeData>());
            RequireForUpdate(m_VehicleQuery);
        }

        protected override void OnUpdate()
        {
            uint frame = m_SimulationSystem.frameIndex;
            int hour = Mathf.FloorToInt(24f * m_TimeSystem.normalizedTime);
            hour = math.clamp(hour, 0, 23);

            TimeData timeData = TimeData.GetSingleton(m_TimeDataQuery);
            int currentDay = TimeSystem.GetDay(frame, timeData);

            var commandBuffer = m_EndFrameBarrier.CreateCommandBuffer().AsParallelWriter();

            Dependency = new MarkBoardingDeparturesJob
            {
                m_EntityType = GetEntityTypeHandle(),
                m_CurrentRouteType = GetComponentTypeHandle<CurrentRoute>(true),
                m_TargetType = GetComponentTypeHandle<Target>(true),
                m_PublicTransportType = GetComponentTypeHandle<PublicTransport>(true),
                m_CargoTransportType = GetComponentTypeHandle<CargoTransport>(true),
                m_TrackerType = GetComponentTypeHandle<XTMVehicleBoardingTracker>(false),
                m_Pending = GetComponentLookup<XTMSegmentOccupancyPendingSample>(true),
                m_Waypoints = GetComponentLookup<Waypoint>(true),
                m_CommandBuffer = commandBuffer,
                m_Hour = hour
            }.ScheduleParallel(m_VehicleQuery, Dependency);

            m_EndFrameBarrier.AddJobHandleForProducer(Dependency);

            if (frame % BatchIntervalFrames != 0 || m_PendingQuery.IsEmptyIgnoreFilter)
            {
                return;
            }

            Dependency.Complete();

            NativeArray<Entity> pendingVehicles = m_PendingQuery.ToEntityArray(Allocator.TempJob);
            NativeArray<XTMSegmentOccupancyPendingSample> pendingSamples = m_PendingQuery.ToComponentDataArray<XTMSegmentOccupancyPendingSample>(Allocator.TempJob);
            NativeList<PendingEntry> entries = new(pendingVehicles.Length, Allocator.TempJob);

            for (int i = 0; i < pendingVehicles.Length; i++)
            {
                entries.Add(new PendingEntry
                {
                    m_Vehicle = pendingVehicles[i],
                    m_Sample = pendingSamples[i]
                });
            }
            pendingVehicles.Dispose();
            pendingSamples.Dispose();

            entries.Sort(default(PendingEntryComparer));

            NativeList<int2> ranges = new(16, Allocator.TempJob);
            BuildWaypointRanges(entries, ranges);

            var applyCommands = m_EndFrameBarrier.CreateCommandBuffer().AsParallelWriter();
            var loadLookups = new XTMVehicleLoadUtils.Lookups
            {
                PrefabRefs = GetComponentLookup<Game.Prefabs.PrefabRef>(true),
                Pets = GetComponentLookup<Game.Creatures.Pet>(true),
                PublicTransportVehicleDatas = GetComponentLookup<Game.Prefabs.PublicTransportVehicleData>(true),
                CargoTransportVehicleDatas = GetComponentLookup<Game.Prefabs.CargoTransportVehicleData>(true),
                LayoutElements = GetBufferLookup<LayoutElement>(true),
                Passengers = GetBufferLookup<Passenger>(true),
                Resources = GetBufferLookup<Game.Economy.Resources>(true)
            };

            int rangeCount = ranges.Length;
            Dependency = new ApplyOccupancySamplesJob
            {
                m_Entries = entries.AsArray(),
                m_Ranges = ranges.AsArray(),
                m_Occupancy = GetComponentLookup<LineSegmentHistoricalOccupancy>(false),
                m_LoadLookups = loadLookups,
                m_CommandBuffer = applyCommands,
                m_CurrentDay = currentDay,
                m_Alpha = Alpha
            }.Schedule(rangeCount, 1, Dependency);

            entries.Dispose(Dependency);
            ranges.Dispose(Dependency);
            m_EndFrameBarrier.AddJobHandleForProducer(Dependency);
        }

        private static void BuildWaypointRanges(NativeList<PendingEntry> entries, NativeList<int2> ranges)
        {
            if (entries.Length == 0)
            {
                return;
            }

            int start = 0;
            Entity current = entries[0].m_Sample.m_DepartureWaypoint;
            for (int i = 1; i < entries.Length; i++)
            {
                Entity waypoint = entries[i].m_Sample.m_DepartureWaypoint;
                if (waypoint != current)
                {
                    ranges.Add(new int2(start, i - start));
                    start = i;
                    current = waypoint;
                }
            }
            ranges.Add(new int2(start, entries.Length - start));
        }

        private struct PendingEntry
        {
            public Entity m_Vehicle;
            public XTMSegmentOccupancyPendingSample m_Sample;
        }

        private struct PendingEntryComparer : System.Collections.Generic.IComparer<PendingEntry>
        {
            public int Compare(PendingEntry x, PendingEntry y)
            {
                int indexCompare = x.m_Sample.m_DepartureWaypoint.Index.CompareTo(y.m_Sample.m_DepartureWaypoint.Index);
                if (indexCompare != 0)
                {
                    return indexCompare;
                }
                return x.m_Sample.m_DepartureWaypoint.Version.CompareTo(y.m_Sample.m_DepartureWaypoint.Version);
            }
        }

        [BurstCompile]
        private struct MarkBoardingDeparturesJob : IJobChunk
        {
            [ReadOnly] public EntityTypeHandle m_EntityType;
            [ReadOnly] public ComponentTypeHandle<CurrentRoute> m_CurrentRouteType;
            [ReadOnly] public ComponentTypeHandle<Target> m_TargetType;
            [ReadOnly] public ComponentTypeHandle<PublicTransport> m_PublicTransportType;
            [ReadOnly] public ComponentTypeHandle<CargoTransport> m_CargoTransportType;
            public ComponentTypeHandle<XTMVehicleBoardingTracker> m_TrackerType;
            [ReadOnly] public ComponentLookup<XTMSegmentOccupancyPendingSample> m_Pending;
            [ReadOnly] public ComponentLookup<Waypoint> m_Waypoints;
            public EntityCommandBuffer.ParallelWriter m_CommandBuffer;
            public int m_Hour;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                NativeArray<Entity> entities = chunk.GetNativeArray(m_EntityType);
                NativeArray<CurrentRoute> routes = chunk.GetNativeArray(ref m_CurrentRouteType);
                NativeArray<Target> targets = chunk.GetNativeArray(ref m_TargetType);
                bool hasPublic = chunk.Has(ref m_PublicTransportType);
                bool hasCargo = chunk.Has(ref m_CargoTransportType);
                NativeArray<PublicTransport> publicTransports = hasPublic ? chunk.GetNativeArray(ref m_PublicTransportType) : default;
                NativeArray<CargoTransport> cargoTransports = hasCargo ? chunk.GetNativeArray(ref m_CargoTransportType) : default;
                bool hasTracker = chunk.Has(ref m_TrackerType);
                NativeArray<XTMVehicleBoardingTracker> trackers = hasTracker ? chunk.GetNativeArray(ref m_TrackerType) : default;

                for (int i = 0; i < entities.Length; i++)
                {
                    bool boarding = false;
                    bool enRoute = false;
                    if (hasPublic)
                    {
                        PublicTransportFlags state = publicTransports[i].m_State;
                        boarding |= (state & PublicTransportFlags.Boarding) != 0;
                        enRoute |= (state & PublicTransportFlags.EnRoute) != 0;
                    }
                    if (hasCargo)
                    {
                        CargoTransportFlags state = cargoTransports[i].m_State;
                        boarding |= (state & CargoTransportFlags.Boarding) != 0;
                        enRoute |= (state & CargoTransportFlags.EnRoute) != 0;
                    }

                    Entity vehicle = entities[i];
                    Entity target = targets[i].m_Target;
                    Entity route = routes[i].m_Route;

                    if (boarding)
                    {
                        if (!m_Waypoints.TryGetComponent(target, out Waypoint waypoint))
                        {
                            continue;
                        }

                        var tracker = new XTMVehicleBoardingTracker
                        {
                            m_BoardingWaypoint = target,
                            m_WaypointIndex = waypoint.m_Index,
                            m_WasBoarding = 1
                        };

                        if (hasTracker)
                        {
                            trackers[i] = tracker;
                        }
                        else
                        {
                            m_CommandBuffer.AddComponent(unfilteredChunkIndex, vehicle, tracker);
                        }
                        continue;
                    }

                    if (!hasTracker)
                    {
                        continue;
                    }

                    XTMVehicleBoardingTracker existing = trackers[i];
                    if (existing.m_WasBoarding == 0)
                    {
                        continue;
                    }

                    // Boarding just ended
                    if (enRoute && !m_Pending.HasComponent(vehicle) && existing.m_BoardingWaypoint != Entity.Null)
                    {
                        m_CommandBuffer.AddComponent(unfilteredChunkIndex, vehicle, new XTMSegmentOccupancyPendingSample
                        {
                            m_Route = route,
                            m_DepartureWaypoint = existing.m_BoardingWaypoint,
                            m_WaypointIndex = existing.m_WaypointIndex,
                            m_Hour = m_Hour
                        });
                    }

                    m_CommandBuffer.RemoveComponent<XTMVehicleBoardingTracker>(unfilteredChunkIndex, vehicle);
                }
            }
        }

        [BurstCompile]
        private struct ApplyOccupancySamplesJob : IJobParallelFor
        {
            [ReadOnly] public NativeArray<PendingEntry> m_Entries;
            [ReadOnly] public NativeArray<int2> m_Ranges;
            [NativeDisableParallelForRestriction] public ComponentLookup<LineSegmentHistoricalOccupancy> m_Occupancy;
            [ReadOnly] public XTMVehicleLoadUtils.Lookups m_LoadLookups;
            public EntityCommandBuffer.ParallelWriter m_CommandBuffer;
            public int m_CurrentDay;
            public float m_Alpha;

            public void Execute(int index)
            {
                int2 range = m_Ranges[index];
                int start = range.x;
                int count = range.y;
                if (count <= 0)
                {
                    return;
                }

                Entity waypoint = m_Entries[start].m_Sample.m_DepartureWaypoint;
                bool hadComponent = m_Occupancy.HasComponent(waypoint);
                LineSegmentHistoricalOccupancy data = hadComponent
                    ? m_Occupancy[waypoint]
                    : default;

                for (int i = 0; i < count; i++)
                {
                    PendingEntry entry = m_Entries[start + i];
                    int2 loadCap = XTMVehicleLoadUtils.GetLoadAndCapacity(entry.m_Vehicle, m_LoadLookups);
                    data.ApplySample(entry.m_Sample.m_Hour, m_CurrentDay, loadCap.x, loadCap.y, m_Alpha);
                    m_CommandBuffer.RemoveComponent<XTMSegmentOccupancyPendingSample>(index, entry.m_Vehicle);
                }

                if (hadComponent)
                {
                    m_Occupancy[waypoint] = data;
                }
                else
                {
                    m_CommandBuffer.AddComponent(index, waypoint, data);
                }
            }
        }
    }
}
