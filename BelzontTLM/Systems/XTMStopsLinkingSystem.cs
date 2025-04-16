using Belzont.Utils;
using Colossal.Entities;
using Game;
using Game.Common;
using Game.Objects;
using Game.Routes;
using Game.SceneFlow;
using Game.Tools;
using System;
using System.Linq;
using Unity.Burst;
using Unity.Burst.Intrinsics;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public partial class XTMStopsLinkingSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            if (GameManager.instance.isGameLoading) return;
            if (ExtendedTransportManagerMod.VerboseMode) LogUtils.DoVerboseLog($"XTMStopsLinkingSystem On Update!");
            if (!m_connectableRoutesNotMapped.IsEmptyIgnoreFilter)
            {
                using var output = new NativeParallelHashSet<PairEntityRoute>(m_connectableRoutesNotMapped.CalculateEntityCount() * 2, Allocator.Temp);
                var cmdBuffer = m_endFrameBarrier.CreateCommandBuffer();
                Dependency = new StopMappingJob
                {
                    m_attachedLookup = GetComponentLookup<Attached>(true),
                    m_ownerLookup = GetComponentLookup<Owner>(true),
                    m_EntityType = GetEntityTypeHandle(),
                    m_cmdBuffer = cmdBuffer.AsParallelWriter(),
                    m_hashSet = output.AsParallelWriter()
                }.ScheduleParallel(m_connectableRoutesNotMapped, Dependency);
                Dependency.Complete();
                using var outputArray = output.ToNativeArray(Allocator.Temp);

                var valuesToSet = outputArray.ToArray().GroupBy(x => x.target).ToDictionary(x => x.Key, x => x.Select(x => x.route).ToHashSet());
                foreach (var kvp in valuesToSet)
                {
                    var valuesToAdd = kvp.Value;
                    DynamicBuffer<XTMChildConnectedRoute> buffer;
                    if (EntityManager.TryGetBuffer<XTMChildConnectedRoute>(kvp.Key, true, out var currentBuffer))
                    {
                        for (int i = 0; i < currentBuffer.Length; i++)
                        {
                            valuesToAdd.Add(currentBuffer[i]); 
                        }
                        buffer = cmdBuffer.SetBuffer<XTMChildConnectedRoute>(kvp.Key);
                        buffer.Clear();
                    }
                    else
                    {
                        buffer = cmdBuffer.AddBuffer<XTMChildConnectedRoute>(kvp.Key);
                    }

                    foreach (var route in valuesToAdd)
                    {
                        buffer.Add(route);
                    }
                }
            }
        }

        private struct PairEntityRoute : IEquatable<PairEntityRoute>
        {
            public readonly Entity target;
            public readonly XTMChildConnectedRoute route;

            public PairEntityRoute(Entity target, XTMChildConnectedRoute route)
            {
                this.target = target;
                this.route = route;
            }

            public override bool Equals(object obj) => obj is PairEntityRoute route && Equals(route);

            public bool Equals(PairEntityRoute other) => target.Equals(other.target) &&
                       route.Equals(other.route);

            public override int GetHashCode() => HashCode.Combine(target, route);

            public static bool operator ==(PairEntityRoute left, PairEntityRoute right) => left.Equals(right);

            public static bool operator !=(PairEntityRoute left, PairEntityRoute right) => !(left == right);
        }

        [BurstCompile]
        private struct StopMappingJob : IJobChunk
        {
            public EntityTypeHandle m_EntityType;
            public ComponentLookup<Owner> m_ownerLookup;
            public ComponentLookup<Attached> m_attachedLookup;
            public EntityCommandBuffer.ParallelWriter m_cmdBuffer;
            public NativeParallelHashSet<PairEntityRoute>.ParallelWriter m_hashSet;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                var entities = chunk.GetNativeArray(m_EntityType);

                for (int i = 0; i < entities.Length; i++)
                {
                    if (m_ownerLookup.TryGetComponent(entities[i], out var owner))
                    {
                        while (m_ownerLookup.TryGetComponent(owner.m_Owner, out var parentOwner))
                        {
                            owner = parentOwner;
                        }
                        m_hashSet.Add(new(owner.m_Owner, new XTMChildConnectedRoute(entities[i])));
                    }
                    if (m_attachedLookup.TryGetComponent(entities[i], out Attached parent) && parent.m_Parent != Entity.Null)
                    {
                        m_hashSet.Add(new(parent.m_Parent, new XTMChildConnectedRoute(entities[i])));
                    }
                    m_cmdBuffer.AddComponent<XTMStopLinkMapped>(unfilteredChunkIndex, entities[i]);
                }

            }
        }

        private EntityQuery m_connectableRoutesNotMapped;
        private EndFrameBarrier m_endFrameBarrier;

        protected override void OnCreate()
        {
            if (ExtendedTransportManagerMod.TraceMode) LogUtils.DoTraceLog("XTMStopsLinkingSystem OnCreate");
            m_endFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();
            m_connectableRoutesNotMapped = GetEntityQuery(new EntityQueryDesc[] {
                new EntityQueryDesc
                {
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<TransportStop>(),
                        ComponentType.ReadOnly<TrainStop>(),
                        ComponentType.ReadOnly<AirplaneStop>(),
                        ComponentType.ReadOnly<BusStop>(),
                        ComponentType.ReadOnly<TramStop>(),
                        ComponentType.ReadOnly<ShipStop>(),
                        ComponentType.ReadOnly<SubwayStop>(),
                    },
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Owner>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTMStopLinkMapped>(),
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>(),
                    }
                },
                new EntityQueryDesc
                {
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<TransportStop>(),
                        ComponentType.ReadOnly<TrainStop>(),
                        ComponentType.ReadOnly<AirplaneStop>(),
                        ComponentType.ReadOnly<BusStop>(),
                        ComponentType.ReadOnly<TramStop>(),
                        ComponentType.ReadOnly<ShipStop>(),
                        ComponentType.ReadOnly<SubwayStop>(),
                    },
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Attached>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTMStopLinkMapped>(),
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>(),
                    }
                }
            }
            );

            CheckedStateRef.RequireForUpdate(m_connectableRoutesNotMapped);
        }
    }
}
