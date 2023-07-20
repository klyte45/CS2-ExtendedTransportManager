using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Palettes;
using Colossal.Entities;
using Game;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using System;
using Unity.Collections;
using Unity.Entities;
using static BelzontTLM.XTMLineViewerSection;
using static Game.UI.NameSystem;

namespace BelzontTLM
{
    public class XTMLineViewerSystem : SystemBase, IBelzontBindable
    {
        public Action<string, object[]> EventCaller { get; set; }
        protected void SendEvent(string eventName, params object[] eventArgs)
        {
            EventCaller?.Invoke(eventName, eventArgs);
        }

        private void GetCityLines(bool force = false)
        {
            m_LineListingSection.Enqueue(Entity.Null, (x) =>
            {
                LogUtils.DoLog("SENDING OBJ: {0}", x);
                SendEvent("lineViewer.getCityLines->", x);
            }, force);
        }


        protected override void OnUpdate()
        {
            if (!m_UnititalizedXTMLineQuery.IsEmptyIgnoreFilter)
            {
                NativeArray<Entity> unitializedLines = m_UnititalizedXTMLineQuery.ToEntityArray(Allocator.TempJob);
                int length = unitializedLines.Length;
                EntityCommandBuffer entityCommandBuffer = this.m_EndFrameBarrier.CreateCommandBuffer();
                for (int i = 0; i < length; i++)
                {
                    entityCommandBuffer.AddComponent<XTMRouteExtraData>(unitializedLines[i]);
                    entityCommandBuffer.AddComponent<Updated>(unitializedLines[i]);
                    LogUtils.DoInfoLog($"Initialized Line data @ entity id #{unitializedLines[i].Index}");
                }
            }

        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("lineViewer.setAcronym", SetRouteAcronym);
            eventCaller("lineViewer.setRouteName", SetRouteName);
            eventCaller("lineViewer.setRouteNumber", SetRouteInternalNumber);
            eventCaller("lineViewer.getCityLines", GetCityLines);
            eventCaller("lineViewer.getRouteDetail", GetRouteDetail);
        }

        private EntityQuery m_UnititalizedXTMLineQuery;
        private NameSystem m_NameSystem;
        private EndFrameBarrier m_EndFrameBarrier;
        private XTMLineViewerSection m_LineVisualizerSection;
        private XTMLineListingSection m_LineListingSection;

        private string SetRouteAcronym(Entity targetEntity, string acronym)
        {
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            var componentExists = EntityManager.TryGetComponent<XTMRouteExtraData>(targetEntity, out var component);
            component.SetAcronym(acronym);
            if (componentExists)
            {
                entityCommandBuffer.SetComponent(targetEntity, component);
            }
            else
            {
                entityCommandBuffer.AddComponent(targetEntity, component);
            }
            entityCommandBuffer.AddComponent<Updated>(targetEntity);
            return acronym;
        }
        private int SetRouteInternalNumber(Entity entity, int routeNum)
        {
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            EntityManager.TryGetComponent<RouteNumber>(entity, out var component);
            component.m_Number = routeNum;
            entityCommandBuffer.SetComponent(entity, component);
            entityCommandBuffer.AddComponent<Updated>(entity);
            entityCommandBuffer.AddComponent<XTMPaletteRequireUpdate>(entity);
            return routeNum;
        }

        private void GetRouteDetail(Entity entity, bool force)
        {
            m_LineVisualizerSection.Enqueue(entity, SendRouteDetail, true);
        }

        private void SendRouteDetail(XTMLineViewerResult result)
        {
            SendEvent("lineViewer.getRouteDetail->", result);
        }

        private Name SetRouteName(Entity entity, string newName)
        {
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            m_NameSystem.SetCustomName(entity, newName ?? String.Empty);
            entityCommandBuffer.AddComponent<Updated>(entity);
            return m_NameSystem.GetName(entity);
        }

        protected override void OnCreate()
        {
            m_UnititalizedXTMLineQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                new EntityQueryDesc
                {
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
                        ComponentType.ReadOnly<XTMRouteExtraData>()
                    }
                }
            });
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();
            m_LineVisualizerSection = World.GetOrCreateSystemManaged<XTMLineViewerSection>();
            m_LineListingSection = World.GetOrCreateSystemManaged<XTMLineListingSection>();
        }


        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            EventCaller = eventCaller;
        }
    }
}
