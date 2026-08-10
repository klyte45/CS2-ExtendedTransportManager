using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Entities;
using Game;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using Game.UI.InGame;
using System;
using Unity.Collections;
using Unity.Entities;
using static BelzontTLM.XTMLineListingSection;

namespace BelzontTLM
{
    public partial class XTMLineViewerController : SystemBase, IBelzontBindable
    {
        public Action<string, object[]> EventCaller { get; set; }
        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("lineViewer.getCityLines", GetCityLines);
            eventCaller("settings.getUseXtmLineListingDefault", () =>
                (BasicIMod.ModData as XTMModData)?.UseXtmLineListingDefault ?? true);
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            EventCaller = eventCaller;
        }

        private EntityQuery m_UnititalizedXTMLineQuery;
        private EntityQuery m_modifiedLineQuery;
        private EndFrameBarrier m_EndFrameBarrier;
        private XTMLineListingSection m_LineListingSection;
        private EntityQuery m_linesQueue;
        private PrefabSystem m_PrefabSystem;
        private NameSystem m_NameSystem;

        protected override void OnCreate()
        {
            m_UnititalizedXTMLineQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                new() {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<XTMRouteExtraData>(),
                        ComponentType.ReadOnly<Deleted>()
                    }
                }
            });
            m_modifiedLineQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                new() {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadOnly<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>()
                    },
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Updated>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>()
                    }
                }
            });

            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();
            m_LineListingSection = World.GetOrCreateSystemManaged<XTMLineListingSection>();
            m_linesQueue = GetEntityQuery(new EntityQueryDesc[] {
                new() {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<RouteNumber>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Deleted>(),
                        ComponentType.ReadOnly<Temp>()
                    }
                }
            });
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
        }


        protected override void OnUpdate()
        {
            if (!m_UnititalizedXTMLineQuery.IsEmptyIgnoreFilter)
            {
                NativeArray<Entity> unitializedLines = m_UnititalizedXTMLineQuery.ToEntityArray(Allocator.TempJob);
                int length = unitializedLines.Length;
                EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
                for (int i = 0; i < length; i++)
                {
                    entityCommandBuffer.AddComponent<XTMRouteExtraData>(unitializedLines[i]);
                    entityCommandBuffer.AddComponent<Updated>(unitializedLines[i]);
                    LogUtils.DoInfoLog($"Initialized Line data @ entity id #{unitializedLines[i].Index}");
                }
                unitializedLines.Dispose();
            }
            if (!m_modifiedLineQuery.IsEmptyIgnoreFilter)
            {
                SendEvent("lineViewer.getCityLines->", GetCityLines());
            }

        }
        protected void SendEvent(string eventName, params object[] eventArgs)
        {
            EventCaller?.Invoke(eventName, eventArgs);
        }

        private LineItemStruct[] GetCityLines()
        {
            return ListLines();
        }


        private LineItemStruct[] ListLines()
        {
            NativeArray<UITransportLineData> sortedLines = TransportUIUtils.GetSortedLines(m_linesQueue, EntityManager, m_PrefabSystem);
            var output = new LineItemStruct[sortedLines.Length];
            for (int i = 0; i < sortedLines.Length; i++)
            {
                Entity entity = sortedLines[i].entity;
                var item = new LineItemStruct
                {
                    name = m_NameSystem.GetName(entity).ToValueableName(),
                    vkName = m_NameSystem.GetNameForVirtualKeyboard(entity).ToValueableName(),
                };
                item.FillFromUITransportLine(sortedLines[i]);
                if (EntityManager.TryGetComponent<XTMRouteExtraData>(entity, out var componentData))
                {
                    item.xtmData = componentData;
                }
                if (EntityManager.TryGetComponent<RouteNumber>(entity, out var number))
                {
                    item.routeNumber = number.m_Number;
                }
                output[i] = item;
            }
            return output;
        }

    }
}
