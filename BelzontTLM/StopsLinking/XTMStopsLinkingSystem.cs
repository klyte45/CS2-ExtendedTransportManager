﻿using Belzont.Utils;
using Colossal.Collections;
using Colossal.Entities;
using Game.Common;
using Game.Objects;
using Game.Routes;
using Game.Tools;
using System;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public partial class XTMStopsLinkingSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            if (ExtendedTransportManagerMod.VerboseMode) LogUtils.DoVerboseLog($"XTMStopsLinkingSystem On Update!");
            var entitesToCheck = m_connectableRoutesNotMapped.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < entitesToCheck.Length; i++)
            {
                var gotError = false;
                //LogUtils.DoLog($"XTMMapStopsJob Start: {entitesToCheck[i].Index}");
                try
                {
                    if (EntityManager.TryGetComponent<Owner>(entitesToCheck[i], out var owner))
                    {
                        while (EntityManager.TryGetComponent<Owner>(owner.m_Owner, out var parentOwner))
                        {
                            owner = parentOwner;
                        }
                        DynamicBuffer<XTMChildConnectedRoute> buffer = !EntityManager.HasBuffer<XTMChildConnectedRoute>(owner.m_Owner)
                            ? EntityManager.AddBuffer<XTMChildConnectedRoute>(owner.m_Owner)
                            : EntityManager.GetBuffer<XTMChildConnectedRoute>(owner.m_Owner);
                        if (!buffer.IsCreated) continue;
                        if (CollectionUtils.TryAddUniqueValue(buffer, new XTMChildConnectedRoute(entitesToCheck[i])))
                        {
                            //LogUtils.DoLog($"XTMMapStopsJob ADD BUFFER: {entitesToCheck[i].Index}");
                        }

                    }
                }
                catch (Exception e)
                {
                    gotError = true;
                    if (ExtendedTransportManagerMod.DebugMode)
                    {
                        LogUtils.DoWarnLog($"Error trying to map connections... (Owner)\n{e}");
                    }
                }
                Attached parent = default;
                try
                {
                    if (EntityManager.TryGetComponent(entitesToCheck[i], out parent) && parent.m_Parent != Entity.Null)
                    {
                        DynamicBuffer<XTMChildConnectedRoute> buffer = EntityManager.HasBuffer<XTMChildConnectedRoute>(parent.m_Parent)
                            ? EntityManager.GetBuffer<XTMChildConnectedRoute>(parent.m_Parent)
                            : EntityManager.AddBuffer<XTMChildConnectedRoute>(parent.m_Parent);
                        if (!buffer.IsCreated) continue;
                        if (CollectionUtils.TryAddUniqueValue(buffer, new XTMChildConnectedRoute(entitesToCheck[i])))
                        {
                            //LogUtils.DoLog($"XTMMapStopsJob ADD BUFFER2: {entitesToCheck[i].Index}");
                        }
                    }
                }
                catch (Exception e)
                {
                    gotError = true;
                    if (ExtendedTransportManagerMod.DebugMode)
                    {
                        LogUtils.DoWarnLog($"Error trying to map connections... (Attached - {entitesToCheck[i]} : {parent.m_Parent})\n{e}");
                    }
                }
                if (!gotError) EntityManager.AddComponent<XTMStopLinkMapped>(entitesToCheck[i]);
                //LogUtils.DoLog($"XTMMapStopsJob SET MARKED: {entitesToCheck[i].Index}");
            }

            entitesToCheck.Dispose();
        }

        private EntityQuery m_connectableRoutesNotMapped;

        protected override void OnCreate()
        {
            if (ExtendedTransportManagerMod.TraceMode) LogUtils.DoTraceLog("XTMStopsLinkingSystem OnCreate");
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
