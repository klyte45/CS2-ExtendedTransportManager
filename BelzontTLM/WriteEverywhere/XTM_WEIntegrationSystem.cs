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

namespace BelzontTLM
{
    public partial class XTM_WEIntegrationSystem : GameSystemBase, IBelzontBindable
    {
        private bool weInitialized;
        private bool weAvailable;
        private NameSystem m_nameSystem;
        private EntityQuery m_uninitiatedRoutesStatic;
        private EntityQuery m_uninitiatedRoutesDynamic;
        private EntityQuery m_deletedLinesGarbage;
        private EntityQuery m_routeChanged;
        private TransportLineSystem m_lineSystem;
        private ModificationEndBarrier m_modificationEndBarrier;
        private XTMLineManagementSystem m_managementSystem;
        private SimulationSystem m_simulationSystem;

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("weIntegration.isAvailable", () => weAvailable);
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        protected override void OnCreate()
        {
            base.OnCreate();
            m_nameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_lineSystem = World.GetOrCreateSystemManaged<TransportLineSystem>();
            m_modificationEndBarrier = World.GetOrCreateSystemManaged<ModificationEndBarrier>();
            m_managementSystem = World.GetOrCreateSystemManaged<XTMLineManagementSystem>();
            m_simulationSystem = World.GetOrCreateSystemManaged<SimulationSystem>();
            m_uninitiatedRoutesStatic = GetEntityQuery(new EntityQueryDesc[] {
                new() {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<TransportLine>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTM_WEDestinationStatic>(),
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>(),
                    }
                }
            });
            m_uninitiatedRoutesDynamic = GetEntityQuery(new EntityQueryDesc[] {
                new() {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<TransportLine>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTM_WEDestinationDynamic>(),
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>(),
                    }
                }
            });
            m_deletedLinesGarbage = GetEntityQuery(new EntityQueryDesc[] {
                new() {
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTM_WEDestinationDynamic>(),
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
                        ComponentType.ReadOnly<XTM_WEDestinationStatic>(),
                        ComponentType.ReadOnly<XTM_WEDestinationDynamic>(),
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
            RequireAnyForUpdate(m_routeChanged, m_deletedLinesGarbage, m_uninitiatedRoutesDynamic, m_uninitiatedRoutesStatic);
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
                            => EntityManager.TryGetComponent<Target>(entity, out var target)
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
                            => EntityManager.TryGetComponent<Target>(entity, out var target)
                            && target.m_Target != Entity.Null
                            && EntityManager.TryGetComponent<Owner>(target.m_Target, out var ownerRoute)
                                ? GetDynamicData(target.m_Target, ownerRoute.m_Owner)
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
            if (EntityManager.TryGetBuffer<XTM_WEDestinationStatic>(route, true, out var destinations) && destinations.Length > 0)
            {
                if (destinations.Length == 1) return ((IXTM_WEDestinationData)destinations[0]).GetString(EntityManager, m_nameSystem, m_managementSystem, stop);
            }
            return "XTM INIT...";
        }
        private string GetDynamicData(Entity stop, Entity route)
        {
            if (EntityManager.TryGetBuffer<XTM_WEDestinationDynamic>(route, true, out var destinations) && destinations.Length > 0)
            {
                if (destinations.Length == 1) return destinations[0].GetCurrentText(m_simulationSystem.frameIndex, EntityManager, m_nameSystem, m_managementSystem, stop);
            }
            return "XTM INIT...";
        }



        protected override void OnUpdate()
        {
            if (GameManager.instance.isGameLoading) return;
            if (!m_uninitiatedRoutesStatic.IsEmptyIgnoreFilter)
            {
                Dependency = new XTM_WEInitStatic
                {
                    m_entityHdl = GetEntityTypeHandle(),
                    m_cmdBuffer = m_modificationEndBarrier.CreateCommandBuffer().AsParallelWriter(),
                }.ScheduleParallel(m_uninitiatedRoutesStatic, Dependency);
            }
            if (!m_uninitiatedRoutesDynamic.IsEmptyIgnoreFilter)
            {
                Dependency = new XTM_WEInitDynamic
                {
                    m_entityHdl = GetEntityTypeHandle(),
                    m_cmdBuffer = m_modificationEndBarrier.CreateCommandBuffer().AsParallelWriter(),
                }.ScheduleParallel(m_uninitiatedRoutesDynamic, Dependency);
            }
            if (!m_routeChanged.IsEmptyIgnoreFilter)
            {

            }
            if (!m_deletedLinesGarbage.IsEmptyIgnoreFilter)
            {
                LogUtils.DoInfoLog("CLEANING WE");
                Dependency = new XTM_WEDestroyDynamic
                {
                    m_entityHdl = GetEntityTypeHandle(),
                    m_cmdBuffer = m_modificationEndBarrier.CreateCommandBuffer().AsParallelWriter(),
                    m_destinationHdl = GetBufferTypeHandle<XTM_WEDestinationDynamic>()
                }.ScheduleParallel(m_deletedLinesGarbage, Dependency);

            }
            Dependency.Complete();
        }

        [BurstCompile]
        private struct XTM_WEInitStatic : IJobChunk
        {
            public EntityTypeHandle m_entityHdl;
            public EntityCommandBuffer.ParallelWriter m_cmdBuffer;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                var entities = chunk.GetNativeArray(m_entityHdl);
                var size = entities.Length;
                for (int i = 0; i < size; i++)
                {
                    var entity = entities[i];
                    var buff = m_cmdBuffer.AddBuffer<XTM_WEDestinationStatic>(unfilteredChunkIndex, entity);
                    buff.Add(new XTM_WEDestinationStatic
                    {
                        type = XTM_WEDestinationKeyframeType.RouteName
                    });
                }
            }
        }
        [BurstCompile]
        private struct XTM_WEInitDynamic : IJobChunk
        {
            public EntityTypeHandle m_entityHdl;
            public EntityCommandBuffer.ParallelWriter m_cmdBuffer;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                var entities = chunk.GetNativeArray(m_entityHdl);
                var size = entities.Length;
                for (int i = 0; i < size; i++)
                {
                    var entity = entities[i];
                    var buff = m_cmdBuffer.AddBuffer<XTM_WEDestinationDynamic>(unfilteredChunkIndex, entity);
                    var singleFrame = new XTM_WEDestinationDynamic();
                    singleFrame.AddKeyframe(new XTM_WEDestinationDynamicKeyframe
                    {
                        type = XTM_WEDestinationKeyframeType.RouteName,
                        framesLength = 1
                    });
                    buff.Add(singleFrame);
                }
            }
        }
        [BurstCompile]
        private struct XTM_WEDestroyDynamic : IJobChunk
        {
            public EntityTypeHandle m_entityHdl;
            public BufferTypeHandle<XTM_WEDestinationDynamic> m_destinationHdl;
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
                    m_cmdBuffer.RemoveComponent<XTM_WEDestinationDynamic>(unfilteredChunkIndex, entity);
                }
            }
        }
    }
}
