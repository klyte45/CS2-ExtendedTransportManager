using Belzont.Utils;
using Colossal.Collections;
using Colossal.Entities;
using Game;
using Game.Common;
using Game.Objects;
using Game.Routes;
using Game.Tools;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public class XTMStopsLinkingSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            LogUtils.DoLog($"XTMStopsLinkingSystem On Update!");
            var entitesToCheck = m_connectableRoutesNotMapped.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < entitesToCheck.Length; i++)
            {
                //LogUtils.DoLog($"XTMMapStopsJob Start: {entitesToCheck[i].Index}");

                if (EntityManager.TryGetComponent<Owner>(entitesToCheck[i], out var owner))
                {
                    while (EntityManager.TryGetComponent<Owner>(owner.m_Owner, out var parentOwner))
                    {
                        owner = parentOwner;
                    }
                    if (!EntityManager.HasBuffer<XTMChildConnectedRoute>(owner.m_Owner))
                    {
                        var buff = EntityManager.AddBuffer<XTMChildConnectedRoute>(owner.m_Owner);
                        buff.ResizeUninitialized(1);
                        buff[0] = new XTMChildConnectedRoute(entitesToCheck[i]);
                        //LogUtils.DoLog($"XTMMapStopsJob INIT BUFFER: {entitesToCheck[i].Index}");
                    }
                    else
                    {
                        var buffer = EntityManager.GetBuffer<XTMChildConnectedRoute>(owner.m_Owner);
                        if (CollectionUtils.TryAddUniqueValue(buffer, new XTMChildConnectedRoute(entitesToCheck[i])))
                        {
                            //LogUtils.DoLog($"XTMMapStopsJob ADD BUFFER: {entitesToCheck[i].Index}");
                        }
                    }

                }

                if (EntityManager.TryGetComponent<Attached>(entitesToCheck[i], out var parent))
                {
                    if (!EntityManager.HasBuffer<XTMChildConnectedRoute>(parent.m_Parent))
                    {
                        var buff = EntityManager.AddBuffer<XTMChildConnectedRoute>(parent.m_Parent);
                        buff.ResizeUninitialized(1);
                        buff[0] = new XTMChildConnectedRoute(entitesToCheck[i]);
                        //LogUtils.DoLog($"XTMMapStopsJob INIT BUFFER2: {entitesToCheck[i].Index}");
                    }
                    else
                    {
                        var buffer = EntityManager.GetBuffer<XTMChildConnectedRoute>(parent.m_Parent);
                        if (CollectionUtils.TryAddUniqueValue(buffer, new XTMChildConnectedRoute(entitesToCheck[i])))
                        {
                            //LogUtils.DoLog($"XTMMapStopsJob ADD BUFFER2: {entitesToCheck[i].Index}");
                        }
                    }

                }

                EntityManager.AddComponent<XTMStopLinkMapped>(entitesToCheck[i]);
                //LogUtils.DoLog($"XTMMapStopsJob SET MARKED: {entitesToCheck[i].Index}");
            }

            entitesToCheck.Dispose();
        }

        private EntityQuery m_connectableRoutesNotMapped;

        protected override void OnCreate()
        {
            LogUtils.DoLog("XTMStopsLinkingSystem OnCreate");
            m_connectableRoutesNotMapped = GetEntityQuery(new EntityQueryDesc[] {
                new EntityQueryDesc
                {
                    Any = new ComponentType[]
                    {
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
