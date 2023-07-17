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
using Game.UI.InGame;
using System;
using System.Linq;
using Unity.Collections;
using Unity.Entities;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public class XTMLineViewerSystem : SystemBase, IBelzontBindable
    {
        public Action<string, object[]> EventCaller { get; set; }
        protected void SendEvent(string eventName, params object[] eventArgs)
        {
            EventCaller?.Invoke(eventName, eventArgs);
        }

        private LineItemStruct[] GetCityLines()
        {
            NativeArray<UITransportLineData> sortedLines = TransportUIUtils.GetSortedLines(this.m_linesQueue, base.EntityManager, this.m_PrefabSystem);
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

        private struct LineItemStruct
        {
            public ValuableName name;
            public ValuableName vkName;
            public Entity entity;
            public bool active;
            public bool visible;
            public bool isCargo;
            public string color;
            public int schedule;
            public string type;
            public float length;
            public int stops;
            public int vehicles;
            public int cargo;
            public float usage;
            public XTMRouteExtraData xtmData;
            public int routeNumber;

            public void FillFromUITransportLine(UITransportLineData data)
            {
                entity = data.entity;
                active = data.active;
                visible = data.visible;
                isCargo = data.isCargo;
                color = data.color.ToRGB(true);
                schedule = data.schedule;
                type = data.type.ToString();
                length = data.length;
                stops = data.stops;
                vehicles = data.vehicles;
                cargo = data.cargo;
                usage = data.usage;
            }
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
            if (!m_ModifiedLineQuery.IsEmptyIgnoreFilter || m_UpdateState.Advance())
            {
                OnLinesUpdated();
            }
        }

        private void OnLinesUpdated()
        {
            SendEvent("lineViewer.onLinesUpdated");
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("lineViewer.setAcronym", SetRouteAcronym);
            eventCaller("lineViewer.setRouteNumber", SetRouteInternalNumber);
            eventCaller("lineViewer.getCityLines", GetCityLines);
        }

        private EntityQuery m_linesQueue;
        private PrefabSystem m_PrefabSystem;
        private NameSystem m_NameSystem;
        private EntityQuery m_ModifiedLineQuery;
        private EntityQuery m_UnititalizedXTMLineQuery;
        private UIUpdateState m_UpdateState;
        private EndFrameBarrier m_EndFrameBarrier;


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
            OnLinesUpdated();
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
            OnLinesUpdated();
            return routeNum;
        }

        protected override void OnCreate()
        {
            m_linesQueue = GetEntityQuery(new EntityQueryDesc[] {
                new EntityQueryDesc
                {
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
            m_ModifiedLineQuery = GetEntityQuery(new EntityQueryDesc[]
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
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Created>(),
                        ComponentType.ReadOnly<Deleted>(),
                        ComponentType.ReadOnly<Updated>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>()
                    }
                }
           });
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
            m_UpdateState = UIUpdateState.Create(base.World, 32);
            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();
        }


        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            EventCaller = eventCaller;
        }
    }
}
