using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Entities;
using Game;
using Game.Common;
using Game.Routes;
using Game.SceneFlow;
using Game.Simulation;
using Game.Tools;
using Game.UI;
using System;
using System.Linq;
using System.Reflection;
using Unity.Burst;
using Unity.Burst.Intrinsics;
using Unity.Entities;
using UnityEngine;

namespace BelzontTLM
{
    public partial class XTM_WEIntegrationSystem : GameSystemBase, IBelzontBindable
    {
        private bool weInitialized;
        private bool weAvailable;
        private NameSystem m_nameSystem;
        private EntityQuery m_uninitiatedRoutesDynamic;
        private EntityQuery m_deletedLinesGarbage;
        private EntityQuery m_routeChanged;
        private ModificationEndBarrier m_modificationEndBarrier;
        private XTMLineManagementSystem m_managementSystem;
        private SimulationSystem m_simulationSystem;

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("weIntegration.isAvailable", () => weAvailable);
            eventCaller("weIntegration.getBlindsKeyframes", GetBlindsKeyframes);
            eventCaller("weIntegration.setBlindsKeyframes", SetBlindsKeyframes);
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        #region UI Calls

        private XTM_WEDestinationBlind.UIData[] GetBlindsKeyframes(Entity line)
        {
            if (!EntityManager.TryGetBuffer<XTM_WEDestinationBlind>(line, true, out var data))
            {
                return default;
            }
            var result = new XTM_WEDestinationBlind.UIData[data.Length];
            var stops = EntityManager.GetBuffer<RouteWaypoint>(line);
            RouteWaypoint lastStop = default;
            for (int j = stops.Length - 1; j >= 0; j--)
            {
                lastStop = stops[j];
                if (EntityManager.HasComponent<Connected>(lastStop.m_Waypoint)) break;
            }
            for (int i = 0; i < data.Length; i++)
            {
                result[i] = data[i].ToUI(EntityManager, m_nameSystem, m_managementSystem, lastStop.m_Waypoint);
            }
            return result;
        }

        private bool SetBlindsKeyframes(Entity line, XTM_WEDestinationBlind.UIData[] frames)
        {
            if (!EntityManager.TryGetBuffer<XTM_WEDestinationBlind>(line, false, out var data))
            {
                return false;
            }
            var length = frames.Length;
            var filteredFrames = frames.Where((x, i) => x.keyframes != null).Select(x =>
            {
                x.keyframes = x.keyframes.Where(x => x.IsValid()).ToArray();
                x.staticKeyframeIdx = Math.Min(x.staticKeyframeIdx, x.keyframes.Length - 1);
                return x;
            }).Where(x => x.keyframes.Length > 0).ToArray();
            if (filteredFrames.Length == 0) return false;
            var totalLength = Math.Max(filteredFrames.Length, data.Length);
            for (int i = 0; i < totalLength; i++)
            {
                if (i < filteredFrames.Length)
                {
                    if (i < data.Length)
                    {
                        data[i].Dispose();
                        data[i] = XTM_WEDestinationBlind.From(filteredFrames[i]);
                    }
                    else
                    {
                        data.Add(XTM_WEDestinationBlind.From(filteredFrames[i]));
                    }
                }
                else
                {
                    data[i].Dispose();
                }
            }
            data.Length = filteredFrames.Length;
            return true;
        }

        #endregion

        protected override void OnCreate()
        {
            base.OnCreate();
            m_nameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_modificationEndBarrier = World.GetOrCreateSystemManaged<ModificationEndBarrier>();
            m_managementSystem = World.GetOrCreateSystemManaged<XTMLineManagementSystem>();
            m_simulationSystem = World.GetOrCreateSystemManaged<SimulationSystem>();
            m_uninitiatedRoutesDynamic = GetEntityQuery(new EntityQueryDesc[] {
                new() {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTM_WEDestinationBlind>(),
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>(),
                    }
                }
            });
            m_deletedLinesGarbage = GetEntityQuery(new EntityQueryDesc[] {
                new() {
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTM_WEDestinationBlind>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<TransportLine>(),
                    }
                }
            });
            m_routeChanged = GetEntityQuery(new EntityQueryDesc[] {
                new() {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadWrite<XTM_WEDestinationBlind>(),
                        ComponentType.ReadOnly<TransportLine>(),
                        ComponentType.ReadOnly<Updated>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>(),
                    }
                }
            });
            RequireAnyForUpdate(m_routeChanged, m_deletedLinesGarbage, m_uninitiatedRoutesDynamic);
        }


        protected override void OnStartRunning()
        {
            base.OnStartRunning();
            if (!weInitialized)
            {
                weInitialized = true;
                if (AppDomain.CurrentDomain.GetAssemblies().SingleOrDefault(assembly => assembly.GetName().Name == "BelzontWE") is Assembly weAssembly
                    && weAssembly.GetExportedTypes().FirstOrDefault(x => x.Name == "WEVehicleFn") is Type t)
                {
                    if (t.GetField("GetTargetDestinationStatic_binding", RedirectorUtils.allFlags) is FieldInfo staticDestination)
                    {
                        var originalValue = staticDestination.GetValue(null) as Func<Entity, string>;
                        staticDestination.SetValue(null, (Entity entity)
                            => EntityManager.HasComponent<CurrentRoute>(entity)
                            && EntityManager.TryGetComponent<Target>(entity, out var target)
                            && target.m_Target != Entity.Null
                            && EntityManager.TryGetComponent<Owner>(target.m_Target, out var ownerRoute)
                                ? GetStaticData(target.m_Target, ownerRoute.m_Owner)
                                : originalValue(entity));
                    }
                    else
                    {
                        return;
                    }
                    if (t.GetField("GetTargetDestinationDynamic_binding", RedirectorUtils.allFlags) is FieldInfo dynamicDestination)
                    {
                        var originalValue = dynamicDestination.GetValue(null) as Func<Entity, string>;
                        dynamicDestination.SetValue(null, (Entity entity)
                            => EntityManager.HasComponent<CurrentRoute>(entity)
                            && EntityManager.TryGetComponent<Target>(entity, out var target)
                            && target.m_Target != Entity.Null
                            && EntityManager.TryGetComponent<Owner>(target.m_Target, out var ownerRoute)
                                ? GetDynamicData(entity, target.m_Target, ownerRoute.m_Owner)
                                : originalValue(entity));
                    }
                    else
                    {
                        return;
                    }
                    if (t.GetField("GetTargetTransportLineNumber_binding", RedirectorUtils.allFlags) is FieldInfo lineNumber)
                    {
                        var originalValue = lineNumber.GetValue(null) as Func<Entity, string>;
                        lineNumber.SetValue(null, (Entity entity)
                            => EntityManager.TryGetComponent<CurrentRoute>(entity, out var ownerLine)
                                ? m_managementSystem.GetEffectiveRouteNumber(ownerLine.m_Route)
                                : originalValue(entity));
                    }
                    else
                    {
                        return;
                    }
                    weAvailable = true;
                }
                if (!weAvailable)
                {
                    Enabled = false;
                }
            }
        }

        private string GetStaticData(Entity stop, Entity route)
        {
            if (EntityManager.TryGetBuffer<XTM_WEDestinationBlind>(route, true, out var destinations) && destinations.Length > 0)
            {
                if (destinations.Length == 1) return destinations[0].GetStaticKeyframe().GetString(EntityManager, m_nameSystem, m_managementSystem, stop, destinations[0]);
                if (!EntityManager.TryGetComponent<Waypoint>(stop, out var waypoint)) return "????";
                var idx = waypoint.m_Index;
                for (int i = 0; i < destinations.Length; i++)
                {
                    var stopOrder = destinations[i].StopOrder;
                    if (stopOrder > idx || stopOrder == -1)
                    {
                        return destinations[i].GetStaticKeyframe().GetString(EntityManager, m_nameSystem, m_managementSystem, stop, destinations[i]);
                    }
                }
                return "<MISSING STEP>";
            }
            return "XTM INIT...";
        }
        private string GetDynamicData(Entity srcVehicle, Entity stop, Entity route)
        {
            if (EntityManager.TryGetBuffer<XTM_WEDestinationBlind>(route, true, out var destinations) && destinations.Length > 0)
            {
                var randomSeed = EntityManager.TryGetComponent(srcVehicle, out PseudoRandomSeed seed) ? seed.m_Seed : (ushort)srcVehicle.Index;
                if (destinations.Length == 1) return destinations[0].GetCurrentText(m_simulationSystem.frameIndex + randomSeed, EntityManager, m_nameSystem, m_managementSystem, stop, destinations[0]);
                if (!EntityManager.TryGetComponent<Waypoint>(stop, out var waypoint)) return "????";
                var idx = waypoint.m_Index;
                for (int i = 0; i < destinations.Length; i++)
                {
                    var stopOrder = destinations[i].StopOrder;
                    if (stopOrder > idx || stopOrder <= 0)
                    {
                        return destinations[i].GetCurrentText(m_simulationSystem.frameIndex + randomSeed, EntityManager, m_nameSystem, m_managementSystem, stop, destinations[i]);
                    }
                }
                return "<MISSING STEP>";
            }
            return "XTM INIT...";
        }



        protected override void OnUpdate()
        {
            if (GameManager.instance.isGameLoading) return;
            if (!m_uninitiatedRoutesDynamic.IsEmptyIgnoreFilter)
            {
                Dependency = new XTM_WEInitDynamic
                {
                    m_entityHdl = GetEntityTypeHandle(),
                    m_waypointHdl = GetBufferTypeHandle<RouteWaypoint>(),
                    m_cmdBuffer = m_modificationEndBarrier.CreateCommandBuffer().AsParallelWriter(),
                }.ScheduleParallel(m_uninitiatedRoutesDynamic, Dependency);
            }
            if (!m_routeChanged.IsEmptyIgnoreFilter)
            {
                Dependency = new XTM_WEUpdateDynamic
                {
                    m_entityHdl = GetEntityTypeHandle(),
                    m_cmdBuffer = m_modificationEndBarrier.CreateCommandBuffer().AsParallelWriter(),
                    m_destinationHdl = GetBufferTypeHandle<XTM_WEDestinationBlind>(),
                    m_waypointsLists = GetBufferLookup<RouteWaypoint>(),
                    m_waypointsComponents = GetComponentLookup<Waypoint>()
                }.ScheduleParallel(m_routeChanged, Dependency);
            }
            if (!m_deletedLinesGarbage.IsEmptyIgnoreFilter)
            {
                Dependency = new XTM_WEDestroyDynamic
                {
                    m_entityHdl = GetEntityTypeHandle(),
                    m_cmdBuffer = m_modificationEndBarrier.CreateCommandBuffer().AsParallelWriter(),
                    m_destinationHdl = GetBufferTypeHandle<XTM_WEDestinationBlind>()
                }.ScheduleParallel(m_deletedLinesGarbage, Dependency);

            }
            Dependency.Complete();
        }

        [BurstCompile]
        private struct XTM_WEInitDynamic : IJobChunk
        {
            public EntityTypeHandle m_entityHdl;
            public BufferTypeHandle<RouteWaypoint> m_waypointHdl;
            public EntityCommandBuffer.ParallelWriter m_cmdBuffer;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                var entities = chunk.GetNativeArray(m_entityHdl);
                var waypointBuffs = chunk.GetBufferAccessor(ref m_waypointHdl);
                var size = entities.Length;
                for (int i = 0; i < size; i++)
                {
                    var entity = entities[i];
                    var waypoints = waypointBuffs[i];
                    var buff = m_cmdBuffer.AddBuffer<XTM_WEDestinationBlind>(unfilteredChunkIndex, entity);
                    var frame1 = new XTM_WEDestinationBlind();
                    SetupKeyframes(ref frame1);
                    frame1.SetUseUntilStopIndirect(ref waypoints, Mathf.CeilToInt(waypoints.Length / 2f));
                    buff.Add(frame1);
                    var frame2 = new XTM_WEDestinationBlind();
                    SetupKeyframes(ref frame2);
                    buff.Add(frame2);
                }
            }

            private static void SetupKeyframes(ref XTM_WEDestinationBlind singleFrame)
            {
                singleFrame.AddKeyframe(new XTM_WEDestinationDynamicKeyframe
                {
                    type = XTM_WEDestinationKeyframeType.EntityNameOrDistrict,
                    framesLength = 3
                });
                singleFrame.AddKeyframe(new XTM_WEDestinationDynamicKeyframe
                {
                    type = XTM_WEDestinationKeyframeType.RouteNumber,
                    framesLength = 2
                });
            }
        }
        [BurstCompile]
        private struct XTM_WEUpdateDynamic : IJobChunk
        {
            public EntityTypeHandle m_entityHdl;
            public BufferTypeHandle<XTM_WEDestinationBlind> m_destinationHdl;
            public EntityCommandBuffer.ParallelWriter m_cmdBuffer;
            public BufferLookup<RouteWaypoint> m_waypointsLists;
            public ComponentLookup<Waypoint> m_waypointsComponents;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                var entities = chunk.GetNativeArray(m_entityHdl);
                var destinations = chunk.GetBufferAccessor(ref m_destinationHdl);
                var size = entities.Length;
                for (int i = 0; i < size; i++)
                {
                    var entity = entities[i];
                    var destinationBuffer = destinations[i];
                    var steps = destinationBuffer.Length;
                    for (int j = 0; j < steps; j++)
                    {
                        var destination = destinationBuffer[j];
                        destination.OnLineStopsChanged(m_waypointsLists, m_waypointsComponents, entity);
                    }
                }
            }
        }
        [BurstCompile]
        private struct XTM_WEDestroyDynamic : IJobChunk
        {
            public EntityTypeHandle m_entityHdl;
            public BufferTypeHandle<XTM_WEDestinationBlind> m_destinationHdl;
            public EntityCommandBuffer.ParallelWriter m_cmdBuffer;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                var entities = chunk.GetNativeArray(m_entityHdl);
                var destinations = chunk.GetBufferAccessor(ref m_destinationHdl);
                var size = entities.Length;
                for (int i = 0; i < size; i++)
                {
                    var entity = entities[i];
                    var destinationBuffer = destinations[i];
                    for (int j = 0; j < destinationBuffer.Length; j++)
                    {
                        var destination = destinationBuffer[j];
                        destination.Dispose();
                    }
                    m_cmdBuffer.RemoveComponent<XTM_WEDestinationBlind>(unfilteredChunkIndex, entity);
                }
            }
        }
    }
}
