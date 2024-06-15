using Belzont.Utils;
using BelzontTLM.Palettes;
using Colossal.Entities;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using Game.UI.InGame;
using System.Collections.Generic;
using System.Linq;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public partial class XTMLineListingSection : BelzontQueueSystem<List<XTMLineListingSection.LineItemStruct>>
    {
        private EntityQuery m_linesQueue;
        private PrefabSystem m_PrefabSystem;
        private NameSystem m_NameSystem;
        private EntityQuery m_ModifiedLineQuery;

        protected override ComponentType[] ComponentsToCheck => new ComponentType[]
        {
            typeof(Created),
            typeof(Deleted),
            typeof(Updated),
            typeof(BatchesUpdated),
            typeof(XTMPaletteRequireUpdate)
        };

        protected override List<LineItemStruct> OnProcess(Entity e)
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
            return output.ToList();
        }

        protected override void Reset() { }
        protected override void RunUpdate(Entity e) { }

        protected override void OnCreate()
        {
            base.OnCreate();
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
                        ComponentType.ReadOnly<XTMPaletteRequireUpdate>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>()
                    }
                }
           });
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
        }

        public class LineItemStruct
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
            public bool isFixedColor;

            internal static LineItemStruct ForEntity(Entity entity, EntityManager entityManager, PrefabSystem m_PrefabSystem, NameSystem nameSystem)
            {
                Route componentData = entityManager.GetComponentData<Route>(entity);
                var routeNum = entityManager.GetComponentData<RouteNumber>(entity);
                entityManager.TryGetComponent<XTMRouteExtraData>(entity, out var xtmData);
                PrefabRef componentData2 = entityManager.GetComponentData<PrefabRef>(entity);
                TransportLinePrefab prefab = m_PrefabSystem.GetPrefab<TransportLinePrefab>(componentData2.m_Prefab);
                TransportLineData componentData3 = entityManager.GetComponentData<TransportLineData>(componentData2.m_Prefab);
                bool visible = !entityManager.HasComponent<HiddenRoute>(entity);
                Color color = entityManager.GetComponentData<Color>(entity);
                int cargo = 0;
                int capacity = 0;
                int stopCount = TransportUIUtils.GetStopCount(entityManager, entity);
                int routeVehiclesCount = TransportUIUtils.GetRouteVehiclesCount(entityManager, entity, ref cargo, ref capacity);
                float routeLength = TransportUIUtils.GetRouteLength(entityManager, entity);
                float usage = (capacity > 0) ? ((float)cargo / (float)capacity) : 0f;
                RouteSchedule schedule = RouteUtils.CheckOption(componentData, RouteOption.Day) ? RouteSchedule.Day : (RouteUtils.CheckOption(componentData, RouteOption.Night) ? RouteSchedule.Night : RouteSchedule.DayAndNight);
                bool active = !RouteUtils.CheckOption(componentData, RouteOption.Inactive);

                return new LineItemStruct
                {
                    entity = entity,
                    active = active,
                    visible = visible,
                    isCargo = componentData3.m_CargoTransport,
                    color = color.m_Color.ToRGB(true),
                    schedule = (int)schedule,
                    type = prefab.m_TransportType.ToString(),
                    length = routeLength,
                    stops = stopCount,
                    vehicles = routeVehiclesCount,
                    cargo = cargo,
                    usage = usage,
                    name = nameSystem.GetName(entity).ToValueableName(),
                    vkName = nameSystem.GetNameForVirtualKeyboard(entity).ToValueableName(),
                    routeNumber = routeNum.m_Number,
                    xtmData = xtmData,
                    isFixedColor = entityManager.HasComponent<XTMPaletteLockedColor>(entity)
            };
            }

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

    }
}
