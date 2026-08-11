using Belzont.Utils;
using BelzontTLM.Palettes;
using Colossal.Entities;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Simulation;
using Game.Tools;
using Game.UI;
using Game.UI.InGame;
using Unity.Entities;
using Unity.Mathematics;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public partial class XTMLineListingSection : SystemBase
    {
        private EntityQuery m_linesQueue;
        private PrefabSystem m_PrefabSystem;
        private NameSystem m_NameSystem;
        private SimulationSystem m_SimulationSystem;
        private EntityQuery m_TimeDataQuery;

        protected override void OnUpdate() { }


        protected override void OnCreate()
        {
            base.OnCreate();
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
            m_SimulationSystem = World.GetOrCreateSystemManaged<SimulationSystem>();
            m_TimeDataQuery = GetEntityQuery(ComponentType.ReadOnly<TimeData>());
        }

        public int GetCurrentDay()
        {
            var timeData = TimeData.GetSingleton(m_TimeDataQuery);
            return TimeSystem.GetDay(m_SimulationSystem.frameIndex, timeData);
        }

        /// <summary>
        /// Min/max effective occupancy (0–1) across all stop waypoints and non-stale 4h buckets.
        /// </summary>
        public static void ComputeOccupancyRange(EntityManager entityManager, Entity route, int currentDay, out float usageMin, out float usageMax)
        {
            usageMin = 0f;
            usageMax = 0f;
            bool any = false;
            if (!entityManager.TryGetBuffer<RouteWaypoint>(route, true, out var waypoints))
            {
                return;
            }
            for (int i = 0; i < waypoints.Length; i++)
            {
                if (!entityManager.TryGetComponent(waypoints[i].m_Waypoint, out LineSegmentHistoricalOccupancy occupancy))
                {
                    continue;
                }
                occupancy.AccumulateNonStaleMinMax(currentDay, ref usageMin, ref usageMax, ref any);
            }
            if (!any)
            {
                usageMin = 0f;
                usageMax = 0f;
            }
            else
            {
                usageMin = math.saturate(usageMin);
                usageMax = math.saturate(usageMax);
            }
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
            /// <summary>Peak non-stale historical occupancy (0–1); used for sort compatibility.</summary>
            public float usage;
            /// <summary>Min non-stale historical occupancy across stops/buckets (0–1).</summary>
            public float usageMin;
            /// <summary>Max non-stale historical occupancy across stops/buckets (0–1).</summary>
            public float usageMax;
            public XTMRouteExtraData xtmData;
            public int routeNumber;
            public bool isFixedColor;

            internal static LineItemStruct ForEntity(Entity entity, EntityManager entityManager, PrefabSystem m_PrefabSystem, NameSystem nameSystem, int currentDay)
            {
                Route componentData = entityManager.GetComponentData<Route>(entity);
                var routeNum = entityManager.GetComponentData<RouteNumber>(entity);
                entityManager.TryGetComponent<XTMRouteExtraData>(entity, out var xtmData);
                PrefabRef componentData2 = entityManager.GetComponentData<PrefabRef>(entity);
                if (!m_PrefabSystem.TryGetPrefab<TransportLinePrefab>(componentData2.m_Prefab, out var prefab) || !entityManager.TryGetComponent(componentData2.m_Prefab, out TransportLineData componentData3))
                {
                    return null;
                }
                bool visible = !entityManager.HasComponent<HiddenRoute>(entity);
                Color color = entityManager.GetComponentData<Color>(entity);
                int cargo = 0;
                int capacity = 0;
                int stopCount = TransportUIUtils.GetStopCount(entityManager, entity);
                int routeVehiclesCount = TransportUIUtils.GetRouteVehiclesCount(entityManager, entity, ref cargo, ref capacity);
                float routeLength = TransportUIUtils.GetRouteLength(entityManager, entity);
                ComputeOccupancyRange(entityManager, entity, currentDay, out float usageMin, out float usageMax);
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
                    usage = usageMax,
                    usageMin = usageMin,
                    usageMax = usageMax,
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
                // usage / usageMin / usageMax filled separately from historical occupancy
            }

            public void ApplyOccupancyRange(EntityManager entityManager, int currentDay)
            {
                ComputeOccupancyRange(entityManager, entity, currentDay, out usageMin, out usageMax);
                usage = usageMax;
            }
        }
    }
}
