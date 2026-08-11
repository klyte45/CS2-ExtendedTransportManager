using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Palettes;
using Colossal.Entities;
using Game;
using Game.Areas;
using Game.Buildings;
using Game.Common;
using Game.Objects;
using Game.Prefabs;
using Game.Routes;
using Game.Simulation;
using Game.Tools;
using Game.UI;
using Game.UI.InGame;
using System;
using System.Collections.Generic;
using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;
using Color = Game.Routes.Color;
using OutsideConnection = Game.Objects.OutsideConnection;
using Transform = Game.Objects.Transform;
using TransportStop = Game.Routes.TransportStop;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    /// <summary>
    /// On-demand city-wide segment occupancy report binder.
    /// Burst scans routes; line names are filled on the main thread while that job runs;
    /// stop/district names are resolved after the scan completes.
    /// </summary>
    public partial class XTMSegmentOccupancyController : SystemBase, IBelzontBindable
    {
        private EntityQuery m_LinesQuery;
        private EntityQuery m_TimeDataQuery;
        private NameSystem m_NameSystem;
        private TimeSystem m_TimeSystem;
        private SimulationSystem m_SimulationSystem;

        public void SetupCaller(Action<string, object[]> eventCaller) { }

        public void SetupEventBinder(Action<string, Delegate> eventCaller) { }

        public void SetupCallBinder(Action<string, Delegate> callBinder)
        {
            callBinder("segmentOccupancy.getCityReport", GetCityReport);
        }

        protected override void OnCreate()
        {
            m_LinesQuery = GetEntityQuery(new EntityQueryDesc
            {
                All = new ComponentType[]
                {
                    ComponentType.ReadOnly<Route>(),
                    ComponentType.ReadOnly<RouteNumber>(),
                    ComponentType.ReadOnly<TransportLine>(),
                    ComponentType.ReadOnly<RouteWaypoint>(),
                    ComponentType.ReadOnly<PrefabRef>()
                },
                None = new ComponentType[]
                {
                    ComponentType.ReadOnly<Deleted>(),
                    ComponentType.ReadOnly<Temp>()
                }
            });
            m_TimeDataQuery = GetEntityQuery(ComponentType.ReadOnly<TimeData>());
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_TimeSystem = World.GetOrCreateSystemManaged<TimeSystem>();
            m_SimulationSystem = World.GetOrCreateSystemManaged<SimulationSystem>();
        }

        protected override void OnUpdate() { }

        private SegmentOccupancyReport GetCityReport(bool cargo)
        {
            TimeData timeData = TimeData.GetSingleton(m_TimeDataQuery);
            int currentDay = TimeSystem.GetDay(m_SimulationSystem.frameIndex, timeData);

            using NativeList<Entity> matchingLines = new(m_LinesQuery.CalculateEntityCount(), Allocator.TempJob);
            CollectMatchingLines(cargo, matchingLines);

            using NativeList<NativeSegmentEntry> nativeSegments = new(matchingLines.Length * 24, Allocator.TempJob);
            using NativeList<NativeStopEntry> nativeStops = new(matchingLines.Length * 8, Allocator.TempJob);

            JobHandle scanHandle = new ScanRoutesJob
            {
                m_Lines = matchingLines.AsArray(),
                m_CurrentDay = currentDay,
                m_RouteWaypoints = GetBufferLookup<RouteWaypoint>(true),
                m_Connected = GetComponentLookup<Connected>(true),
                m_TransportStops = GetComponentLookup<TransportStop>(true),
                m_Occupancy = GetComponentLookup<LineSegmentHistoricalOccupancy>(true),
                m_Transforms = GetComponentLookup<Transform>(true),
                m_OutsideConnections = GetComponentLookup<OutsideConnection>(true),
                m_Owners = GetComponentLookup<Owner>(true),
                m_CurrentDistricts = GetComponentLookup<CurrentDistrict>(true),
                m_Attacheds = GetComponentLookup<Attached>(true),
                m_Buildings = GetComponentLookup<Building>(true),
                m_BorderDistricts = GetComponentLookup<BorderDistrict>(true),
                m_Segments = nativeSegments,
                m_Stops = nativeStops
            }.Schedule(Dependency);

            // Overlap NameSystem line naming with Burst route scan (main thread + worker).
            LineShieldInfo[] candidateLines = BuildLineShields(matchingLines);

            scanHandle.Complete();
            Dependency = default;

            LineShieldInfo[] lines = FilterLinesWithStops(candidateLines, nativeStops);
            SegmentOccupancyStop[] stops = BuildStops(nativeStops);
            SegmentOccupancyEntry[] segments = CopySegments(nativeSegments);

            return new SegmentOccupancyReport
            {
                cityDateTime = SimulationDateTimeJson.FromDateTime(m_TimeSystem.GetCurrentDateTime()),
                lines = lines,
                stops = stops,
                segments = segments
            };
        }

        private void CollectMatchingLines(bool cargo, NativeList<Entity> matchingLines)
        {
            using NativeArray<Entity> lineEntities = m_LinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lineEntities.Length; i++)
            {
                Entity lineEntity = lineEntities[i];
                if (!EntityManager.TryGetComponent(lineEntity, out Route route)
                    || RouteUtils.CheckOption(route, RouteOption.Inactive))
                {
                    continue;
                }
                if (!EntityManager.TryGetComponent(lineEntity, out PrefabRef prefabRef)
                    || !EntityManager.TryGetComponent(prefabRef.m_Prefab, out TransportLineData lineData)
                    || lineData.m_CargoTransport != cargo)
                {
                    continue;
                }
                matchingLines.Add(lineEntity);
            }
        }

        private LineShieldInfo[] BuildLineShields(NativeList<Entity> matchingLines)
        {
            var lines = new LineShieldInfo[matchingLines.Length];
            for (int i = 0; i < matchingLines.Length; i++)
            {
                Entity lineEntity = matchingLines[i];
                EntityManager.TryGetComponent(lineEntity, out XTMRouteExtraData xtmData);
                EntityManager.TryGetComponent(lineEntity, out RouteNumber routeNumber);
                Color color = EntityManager.GetComponentData<Color>(lineEntity);
                PrefabRef prefabRef = EntityManager.GetComponentData<PrefabRef>(lineEntity);
                TransportLineData lineData = EntityManager.GetComponentData<TransportLineData>(prefabRef.m_Prefab);
                Route route = EntityManager.GetComponentData<Route>(lineEntity);
                RouteSchedule schedule = RouteUtils.CheckOption(route, RouteOption.Day)
                    ? RouteSchedule.Day
                    : (RouteUtils.CheckOption(route, RouteOption.Night) ? RouteSchedule.Night : RouteSchedule.DayAndNight);

                lines[i] = new LineShieldInfo
                {
                    entity = lineEntity,
                    name = m_NameSystem.GetName(lineEntity).ToValueableName(),
                    routeNumber = routeNumber.m_Number,
                    xtmData = xtmData,
                    color = color.m_Color.ToRGB(true),
                    type = lineData.m_TransportType.ToString(),
                    isCargo = lineData.m_CargoTransport,
                    isFixedColor = EntityManager.HasComponent<XTMPaletteLockedColor>(lineEntity),
                    schedule = (int)schedule
                };
            }
            return lines;
        }

        private static LineShieldInfo[] FilterLinesWithStops(LineShieldInfo[] candidates, NativeList<NativeStopEntry> nativeStops)
        {
            var included = new HashSet<Entity>(nativeStops.Length);
            for (int i = 0; i < nativeStops.Length; i++)
            {
                included.Add(nativeStops[i].lineEntity);
            }

            var lines = new List<LineShieldInfo>(included.Count);
            for (int i = 0; i < candidates.Length; i++)
            {
                if (included.Contains(candidates[i].entity))
                {
                    lines.Add(candidates[i]);
                }
            }
            return lines.ToArray();
        }

        private SegmentOccupancyStop[] BuildStops(NativeList<NativeStopEntry> nativeStops)
        {
            var stops = new SegmentOccupancyStop[nativeStops.Length];
            for (int i = 0; i < nativeStops.Length; i++)
            {
                NativeStopEntry src = nativeStops[i];
                stops[i] = new SegmentOccupancyStop
                {
                    lineEntity = src.lineEntity,
                    waypoint = src.waypoint,
                    entity = src.stopEntity,
                    name = m_NameSystem.GetName(src.stopEntity).ToValueableName(),
                    worldPosition = new Vector3Json((Vector3)src.worldPosition),
                    district = src.district,
                    districtName = src.district != Entity.Null
                        ? m_NameSystem.GetName(src.district).ToValueableName()
                        : default,
                    isOutsideConnection = src.isOutsideConnection,
                    azimuth = ((Quaternion)src.rotation).eulerAngles.y
                };
            }
            return stops;
        }

        private static SegmentOccupancyEntry[] CopySegments(NativeList<NativeSegmentEntry> nativeSegments)
        {
            var segments = new SegmentOccupancyEntry[nativeSegments.Length];
            for (int i = 0; i < nativeSegments.Length; i++)
            {
                NativeSegmentEntry src = nativeSegments[i];
                segments[i] = new SegmentOccupancyEntry
                {
                    lineEntity = src.lineEntity,
                    sourceWaypointStopEntity = src.sourceWaypointStopEntity,
                    targetWaypointStopEntity = src.targetWaypointStopEntity,
                    occupancyNumber = src.occupancyNumber,
                    capacityRegistered = src.capacityRegistered,
                    timeSpanBucket = src.timeSpanBucket
                };
            }
            return segments;
        }

        private struct NativeStopEntry
        {
            public Entity lineEntity;
            public Entity waypoint;
            public Entity stopEntity;
            public Entity district;
            public float3 worldPosition;
            public quaternion rotation;
            public bool isOutsideConnection;
        }

        private struct NativeSegmentEntry
        {
            public Entity lineEntity;
            public Entity sourceWaypointStopEntity;
            public Entity targetWaypointStopEntity;
            public float occupancyNumber;
            public float capacityRegistered;
            public int timeSpanBucket;
        }

        [BurstCompile]
        private struct ScanRoutesJob : IJob
        {
            [ReadOnly] public NativeArray<Entity> m_Lines;
            public int m_CurrentDay;

            [ReadOnly] public BufferLookup<RouteWaypoint> m_RouteWaypoints;
            [ReadOnly] public ComponentLookup<Connected> m_Connected;
            [ReadOnly] public ComponentLookup<TransportStop> m_TransportStops;
            [ReadOnly] public ComponentLookup<LineSegmentHistoricalOccupancy> m_Occupancy;
            [ReadOnly] public ComponentLookup<Transform> m_Transforms;
            [ReadOnly] public ComponentLookup<OutsideConnection> m_OutsideConnections;
            [ReadOnly] public ComponentLookup<Owner> m_Owners;
            [ReadOnly] public ComponentLookup<CurrentDistrict> m_CurrentDistricts;
            [ReadOnly] public ComponentLookup<Attached> m_Attacheds;
            [ReadOnly] public ComponentLookup<Building> m_Buildings;
            [ReadOnly] public ComponentLookup<BorderDistrict> m_BorderDistricts;

            public NativeList<NativeSegmentEntry> m_Segments;
            public NativeList<NativeStopEntry> m_Stops;

            public void Execute()
            {
                for (int lineIndex = 0; lineIndex < m_Lines.Length; lineIndex++)
                {
                    Entity lineEntity = m_Lines[lineIndex];
                    if (!m_RouteWaypoints.TryGetBuffer(lineEntity, out DynamicBuffer<RouteWaypoint> waypoints))
                    {
                        continue;
                    }

                    int stopStart = m_Stops.Length;
                    for (int w = 0; w < waypoints.Length; w++)
                    {
                        Entity waypoint = waypoints[w].m_Waypoint;
                        if (!m_Connected.TryGetComponent(waypoint, out Connected connected)
                            || !m_TransportStops.HasComponent(connected.m_Connected))
                        {
                            continue;
                        }

                        Entity stopEntity = connected.m_Connected;
                        float3 worldPosition = default;
                        quaternion rotation = quaternion.identity;
                        if (m_Transforms.TryGetComponent(stopEntity, out Transform transform))
                        {
                            worldPosition = transform.m_Position;
                            rotation = transform.m_Rotation;
                        }

                        m_Stops.Add(new NativeStopEntry
                        {
                            lineEntity = lineEntity,
                            waypoint = waypoint,
                            stopEntity = stopEntity,
                            district = ResolveDistrict(stopEntity),
                            worldPosition = worldPosition,
                            rotation = rotation,
                            isOutsideConnection = m_OutsideConnections.HasComponent(stopEntity)
                        });
                    }

                    int stopCount = m_Stops.Length - stopStart;
                    if (stopCount < 2)
                    {
                        continue;
                    }

                    for (int s = 0; s < stopCount; s++)
                    {
                        Entity source = m_Stops[stopStart + s].waypoint;
                        Entity target = m_Stops[stopStart + (s + 1) % stopCount].waypoint;
                        AppendSegmentBuckets(lineEntity, source, target);
                    }
                }
            }

            private void AppendSegmentBuckets(Entity lineEntity, Entity sourceWaypoint, Entity targetWaypoint)
            {
                float o00 = 0f, o04 = 0f, o08 = 0f, o12 = 0f, o16 = 0f, o20 = 0f;
                float c00 = 0f, c04 = 0f, c08 = 0f, c12 = 0f, c16 = 0f, c20 = 0f;

                if (m_Occupancy.TryGetComponent(sourceWaypoint, out LineSegmentHistoricalOccupancy occupancy))
                {
                    occupancy.GetRawLoadAndCapacity(m_CurrentDay,
                        out o00, out o04, out o08, out o12, out o16, out o20,
                        out c00, out c04, out c08, out c12, out c16, out c20);
                }

                AddBucket(lineEntity, sourceWaypoint, targetWaypoint, 0, o00, c00);
                AddBucket(lineEntity, sourceWaypoint, targetWaypoint, 1, o04, c04);
                AddBucket(lineEntity, sourceWaypoint, targetWaypoint, 2, o08, c08);
                AddBucket(lineEntity, sourceWaypoint, targetWaypoint, 3, o12, c12);
                AddBucket(lineEntity, sourceWaypoint, targetWaypoint, 4, o16, c16);
                AddBucket(lineEntity, sourceWaypoint, targetWaypoint, 5, o20, c20);
            }

            private void AddBucket(
                Entity lineEntity,
                Entity sourceWaypoint,
                Entity targetWaypoint,
                int bucket,
                float occupancy,
                float capacity)
            {
                m_Segments.Add(new NativeSegmentEntry
                {
                    lineEntity = lineEntity,
                    sourceWaypointStopEntity = sourceWaypoint,
                    targetWaypointStopEntity = targetWaypoint,
                    occupancyNumber = occupancy,
                    capacityRegistered = capacity,
                    timeSpanBucket = bucket
                });
            }

            private Entity ResolveDistrict(Entity stopEntity)
            {
                Entity parent = Entity.Null;
                if (m_Owners.TryGetComponent(stopEntity, out Owner owner))
                {
                    parent = owner.m_Owner;
                    while (m_Owners.TryGetComponent(parent, out Owner ownerParent))
                    {
                        parent = ownerParent.m_Owner;
                    }
                }

                if (parent != Entity.Null)
                {
                    return m_CurrentDistricts.TryGetComponent(parent, out CurrentDistrict currentDistrict)
                        ? currentDistrict.m_District
                        : Entity.Null;
                }

                if (m_Attacheds.TryGetComponent(stopEntity, out Attached attached))
                {
                    return TryGetByBorderDistrict(attached.m_Parent);
                }

                if (m_Buildings.TryGetComponent(stopEntity, out Building building))
                {
                    return TryGetByBorderDistrict(building.m_RoadEdge);
                }

                return Entity.Null;
            }

            private Entity TryGetByBorderDistrict(Entity attachParent)
            {
                if (!m_BorderDistricts.TryGetComponent(attachParent, out BorderDistrict borders))
                {
                    return Entity.Null;
                }
                return borders.m_Left != Entity.Null ? borders.m_Left : borders.m_Right;
            }
        }
    }
}
