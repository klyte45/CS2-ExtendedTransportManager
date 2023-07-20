using Belzont.Utils;
using Colossal.Entities;
using Game.Areas;
using Game.City;
using Game.Common;
using Game.Objects;
using Game.Prefabs;
using Game.UI;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using static Belzont.Utils.NameSystemExtensions;
using static BelzontTLM.XTMLineListingSection;
using static BelzontTLM.XTMLineViewerSection;

namespace BelzontTLM
{
    public partial class XTMLineViewerSection : BelzontQueueSystem<XTMLineViewerResult>
    {
        public class XTMLineViewerResult
        {
            public XTMLineViewerResult() { }

            public LineItemStruct LineData { get; set; }
            public int StopCapacity { get; set; }
            public LineStopNamed[] Stops { get; set; }
            public LineVehicleNamed[] Vehicles { get; set; }
            public LineSegment[] Segments { get; set; }
        }

        protected override void Reset()
        {
            m_SegmentsResult.Clear();
            m_StopsResult.Clear();
            m_VehiclesResult.Clear();
        }

        protected override void OnCreate()
        {
            base.OnCreate();
            m_CityConfigurationSystem = base.World.GetOrCreateSystemManaged<CityConfigurationSystem>();
            m_BoolResult = new NativeArray<bool>(3, Allocator.Persistent, NativeArrayOptions.ClearMemory);
            m_EntityResult = new NativeArray<Entity>(1, Allocator.Persistent, NativeArrayOptions.ClearMemory);
            m_StopCapacityResult = new NativeArray<int>(1, Allocator.Persistent, NativeArrayOptions.ClearMemory);
            m_SegmentsResult = new NativeList<LineSegment>(Allocator.Persistent);
            m_StopsResult = new NativeList<LineStop>(Allocator.Persistent);
            m_VehiclesResult = new NativeList<LineVehicle>(Allocator.Persistent);
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
        }

        protected override void OnDestroy()
        {
            m_BoolResult.Dispose();
            m_EntityResult.Dispose();
            m_StopCapacityResult.Dispose();
            m_SegmentsResult.Dispose();
            m_StopsResult.Dispose();
            m_VehiclesResult.Dispose();
            base.OnDestroy();
        }

        protected override void RunUpdate(Entity e)
        {
            __TypeHandle.__Game_Buildings_InstalledUpgrade_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Objects_SubObject_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_ConnectedRoute_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_RouteVehicle_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_RouteSegment_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_RouteWaypoint_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_CurrentRoute_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_PublicTransport_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Common_Owner_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_Vehicle_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_TaxiStand_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_TransportStop_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_TransportLine_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_Route_RO_ComponentLookup.Update(ref CheckedStateRef);
            if (e == Entity.Null)
            {
                LogUtils.DoLog("Entity is null!");
                return;
            }

            LineRequirementsCheckJob jobData = default;
            jobData.m_SelectedEntity = e;
            jobData.m_SelectedRouteEntity = e;
            jobData.m_Routes = __TypeHandle.__Game_Routes_Route_RO_ComponentLookup;
            jobData.m_TransportLines = __TypeHandle.__Game_Routes_TransportLine_RO_ComponentLookup;
            jobData.m_TransportStops = __TypeHandle.__Game_Routes_TransportStop_RO_ComponentLookup;
            jobData.m_TaxiStands = __TypeHandle.__Game_Routes_TaxiStand_RO_ComponentLookup;
            jobData.m_Vehicles = __TypeHandle.__Game_Vehicles_Vehicle_RO_ComponentLookup;
            jobData.m_Owners = __TypeHandle.__Game_Common_Owner_RO_ComponentLookup;
            jobData.m_PublicTransports = __TypeHandle.__Game_Vehicles_PublicTransport_RO_ComponentLookup;
            jobData.m_CurrentRoutes = __TypeHandle.__Game_Routes_CurrentRoute_RO_ComponentLookup;
            jobData.m_RouteWaypointBuffers = __TypeHandle.__Game_Routes_RouteWaypoint_RO_BufferLookup;
            jobData.m_RouteSegmentBuffers = __TypeHandle.__Game_Routes_RouteSegment_RO_BufferLookup;
            jobData.m_RouteVehicleBuffers = __TypeHandle.__Game_Routes_RouteVehicle_RO_BufferLookup;
            jobData.m_ConnectedRouteBuffers = __TypeHandle.__Game_Routes_ConnectedRoute_RO_BufferLookup;
            jobData.m_SubObjectBuffers = __TypeHandle.__Game_Objects_SubObject_RO_BufferLookup;
            jobData.m_InstalledUpgradeBuffers = __TypeHandle.__Game_Buildings_InstalledUpgrade_RO_BufferLookup;
            jobData.m_BoolResult = m_BoolResult;
            jobData.m_EntityResult = m_EntityResult;
            jobData.Schedule(Dependency).Complete();
            if (!m_BoolResult[0])
            {
                LogUtils.DoLog("Bool result is false!");
                return;
            }
            __TypeHandle.__Game_Vehicles_Passenger_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Net_SubLane_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Pathfind_PathElement_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_AircraftNavigationLane_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_WatercraftNavigationLane_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_TrainNavigationLane_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_CarNavigationLane_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_LayoutElement_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_RouteVehicle_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_RouteSegment_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_RouteWaypoint_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Economy_Resources_RO_BufferLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Objects_OutsideConnection_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_TransportStop_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Objects_Transform_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Rendering_CullingInfo_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Prefabs_CargoTransportVehicleData_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Prefabs_PublicTransportVehicleData_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Prefabs_TrainData_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Prefabs_TransportLineData_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Prefabs_PrefabRef_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Creatures_Pet_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_AircraftCurrentLane_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_WatercraftCurrentLane_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_TrainCurrentLane_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_CarCurrentLane_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Net_SlaveLane_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Net_MasterLane_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Net_Curve_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Vehicles_Train_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_Waypoint_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Common_Owner_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Pathfind_PathOwner_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Common_Target_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_CurrentRoute_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_RouteLane_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_Position_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_WaitingPassengers_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_Connected_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Pathfind_PathInformation_RO_ComponentLookup.Update(ref CheckedStateRef);
            __TypeHandle.__Game_Routes_Color_RO_ComponentLookup.Update(ref CheckedStateRef);
            UpdateJob jobData2 = default;
            jobData2.m_RightHandTraffic = !m_CityConfigurationSystem.leftHandTraffic;
            jobData2.m_RouteEntity = e;
            jobData2.m_Colors = __TypeHandle.__Game_Routes_Color_RO_ComponentLookup;
            jobData2.m_PathInformation = __TypeHandle.__Game_Pathfind_PathInformation_RO_ComponentLookup;
            jobData2.m_Connected = __TypeHandle.__Game_Routes_Connected_RO_ComponentLookup;
            jobData2.m_WaitingPassengers = __TypeHandle.__Game_Routes_WaitingPassengers_RO_ComponentLookup;
            jobData2.m_Positions = __TypeHandle.__Game_Routes_Position_RO_ComponentLookup;
            jobData2.m_RouteLanes = __TypeHandle.__Game_Routes_RouteLane_RO_ComponentLookup;
            jobData2.m_CurrentRoutes = __TypeHandle.__Game_Routes_CurrentRoute_RO_ComponentLookup;
            jobData2.m_Targets = __TypeHandle.__Game_Common_Target_RO_ComponentLookup;
            jobData2.m_PathOwners = __TypeHandle.__Game_Pathfind_PathOwner_RO_ComponentLookup;
            jobData2.m_Owners = __TypeHandle.__Game_Common_Owner_RO_ComponentLookup;
            jobData2.m_Waypoints = __TypeHandle.__Game_Routes_Waypoint_RO_ComponentLookup;
            jobData2.m_Trains = __TypeHandle.__Game_Vehicles_Train_RO_ComponentLookup;
            jobData2.m_Curves = __TypeHandle.__Game_Net_Curve_RO_ComponentLookup;
            jobData2.m_MasterLanes = __TypeHandle.__Game_Net_MasterLane_RO_ComponentLookup;
            jobData2.m_SlaveLanes = __TypeHandle.__Game_Net_SlaveLane_RO_ComponentLookup;
            jobData2.m_CarCurrentLanes = __TypeHandle.__Game_Vehicles_CarCurrentLane_RO_ComponentLookup;
            jobData2.m_TrainCurrentLanes = __TypeHandle.__Game_Vehicles_TrainCurrentLane_RO_ComponentLookup;
            jobData2.m_WatercraftCurrentLanes = __TypeHandle.__Game_Vehicles_WatercraftCurrentLane_RO_ComponentLookup;
            jobData2.m_AircraftCurrentLanes = __TypeHandle.__Game_Vehicles_AircraftCurrentLane_RO_ComponentLookup;
            jobData2.m_Pets = __TypeHandle.__Game_Creatures_Pet_RO_ComponentLookup;
            jobData2.m_PrefabRefs = __TypeHandle.__Game_Prefabs_PrefabRef_RO_ComponentLookup;
            jobData2.m_TransportLineData = __TypeHandle.__Game_Prefabs_TransportLineData_RO_ComponentLookup;
            jobData2.m_TrainDatas = __TypeHandle.__Game_Prefabs_TrainData_RO_ComponentLookup;
            jobData2.m_PublicTransportVehicleDatas = __TypeHandle.__Game_Prefabs_PublicTransportVehicleData_RO_ComponentLookup;
            jobData2.m_CargoTransportVehicleDatas = __TypeHandle.__Game_Prefabs_CargoTransportVehicleData_RO_ComponentLookup;
            jobData2.m_CullingInfos = __TypeHandle.__Game_Rendering_CullingInfo_RO_ComponentLookup;
            jobData2.m_Transforms = __TypeHandle.__Game_Objects_Transform_RO_ComponentLookup;
            jobData2.m_TransportStops = __TypeHandle.__Game_Routes_TransportStop_RO_ComponentLookup;
            jobData2.m_OutsideConnections = __TypeHandle.__Game_Objects_OutsideConnection_RO_ComponentLookup;
            jobData2.m_EconomyResourcesBuffers = __TypeHandle.__Game_Economy_Resources_RO_BufferLookup;
            jobData2.m_RouteWaypointBuffers = __TypeHandle.__Game_Routes_RouteWaypoint_RO_BufferLookup;
            jobData2.m_RouteSegmentBuffers = __TypeHandle.__Game_Routes_RouteSegment_RO_BufferLookup;
            jobData2.m_RouteVehicleBuffers = __TypeHandle.__Game_Routes_RouteVehicle_RO_BufferLookup;
            jobData2.m_LayoutElementBuffers = __TypeHandle.__Game_Vehicles_LayoutElement_RO_BufferLookup;
            jobData2.m_CarNavigationLaneBuffers = __TypeHandle.__Game_Vehicles_CarNavigationLane_RO_BufferLookup;
            jobData2.m_TrainNavigationLaneBuffers = __TypeHandle.__Game_Vehicles_TrainNavigationLane_RO_BufferLookup;
            jobData2.m_WatercraftNavigationLaneBuffers = __TypeHandle.__Game_Vehicles_WatercraftNavigationLane_RO_BufferLookup;
            jobData2.m_AircraftNavigationLaneBuffers = __TypeHandle.__Game_Vehicles_AircraftNavigationLane_RO_BufferLookup;
            jobData2.m_PathElementBuffers = __TypeHandle.__Game_Pathfind_PathElement_RO_BufferLookup;
            jobData2.m_SubLaneBuffers = __TypeHandle.__Game_Net_SubLane_RO_BufferLookup;
            jobData2.m_PassengerBuffers = __TypeHandle.__Game_Vehicles_Passenger_RO_BufferLookup;
            jobData2.m_SegmentsResult = m_SegmentsResult;
            jobData2.m_StopsResult = m_StopsResult;
            jobData2.m_VehiclesResult = m_VehiclesResult;
            jobData2.m_StopCapacityResult = m_StopCapacityResult;
            jobData2.m_BoolResult = m_BoolResult;
            jobData2.Schedule(Dependency).Complete();
        }

        protected override XTMLineViewerResult OnProcess(Entity e)
        {
            var result = new XTMLineViewerResult
            {
                StopCapacity = m_StopCapacityResult[0],
                Segments = new LineSegment[m_SegmentsResult.Length],
                Stops = new LineStopNamed[m_StopsResult.Length],
                Vehicles = new LineVehicleNamed[m_VehiclesResult.Length],
                LineData = LineItemStruct.ForEntity(e, EntityManager, m_PrefabSystem)
            };
            for (int i = 0; i < m_SegmentsResult.Length; i++)
            {
                result.Segments[i] = m_SegmentsResult[i];
            }
            for (int j = 0; j < m_VehiclesResult.Length; j++)
            {
                result.Vehicles[j] = new(m_VehiclesResult[j], m_NameSystem);
            }
            for (int k = 0; k < m_StopsResult.Length; k++)
            {
                result.Stops[k] = new(m_StopsResult[k], m_NameSystem, EntityManager);
            }
            return result;

        }

        private void __AssignQueries(ref SystemState state)
        {
        }

        protected override void OnCreateForCompiler()
        {
            base.OnCreateForCompiler();
            __AssignQueries(ref CheckedStateRef);
            __TypeHandle.__AssignHandles(ref CheckedStateRef);
        }

        public XTMLineViewerSection()
        {
        }

        private NameSystem m_NameSystem;
        private PrefabSystem m_PrefabSystem;
        private CityConfigurationSystem m_CityConfigurationSystem;

        private NativeArray<bool> m_BoolResult;

        private NativeArray<Entity> m_EntityResult;

        private NativeList<LineSegment> m_SegmentsResult;

        private NativeList<LineStop> m_StopsResult;

        private NativeList<LineVehicle> m_VehiclesResult;

        private NativeArray<int> m_StopCapacityResult;

        private TypeHandle __TypeHandle;

        public readonly struct LineStop
        {
            public Entity entity { get; }

            public float position { get; }

            public int cargo { get; }

            public bool isCargo { get; }

            public bool isOutsideConnection { get; }


            public LineStop(Entity entity, float position, int cargo, bool isCargo, bool isOutsideConnection)
            {
                this.entity = entity;
                this.position = position;
                this.cargo = cargo;
                this.isCargo = isCargo;
                this.isOutsideConnection = isOutsideConnection;
            }
        }

        public readonly struct LineVehicle
        {
            public Entity entity { get; }

            public float position { get; }

            public int cargo { get; }

            public int capacity { get; }

            public bool isCargo { get; }

            public LineVehicle(Entity entity, float position, int cargo, int capacity, bool isCargo = false)
            {
                this.entity = entity;
                this.position = position;
                this.cargo = cargo;
                this.capacity = capacity;
                this.isCargo = isCargo;
            }
        }

        public readonly struct LineSegment
        {
            public float start { get; }

            public float end { get; }
            public float sizeMeters { get; }

            public bool broken { get; }

            public LineSegment(float start, float end, bool broken, float sizeMeters)
            {
                this.start = start;
                this.end = end;
                this.broken = broken;
                this.sizeMeters = sizeMeters;
            }
        }
        public class LineStopNamed
        {
            public Entity entity { get; }
            public float position { get; }
            public int cargo { get; }
            public bool isCargo { get; }
            public bool isOutsideConnection { get; }
            public ValuableName name { get; }
            public Entity parent { get; }
            public ValuableName parentName { get; }
            public Entity district { get; }
            public ValuableName districtName { get; }

            public LineStopNamed(LineStop src, NameSystem nameSystem, EntityManager em)
            {
                entity = src.entity;
                position = src.position;
                cargo = src.cargo;
                isOutsideConnection = src.isOutsideConnection;
                isCargo = src.isCargo;
                name = nameSystem.GetName(src.entity).ToValueableName();
                parent = em.TryGetComponent<Owner>(src.entity, out var owner) ? owner.m_Owner : Entity.Null;
                parentName = parent != Entity.Null ? nameSystem.GetName(parent).ToValueableName() : default;
                district = parent != Entity.Null
                    ? em.TryGetComponent<CurrentDistrict>(parent, out var currentDistrict) ? currentDistrict.m_District : Entity.Null
                    : em.TryGetComponent<Attached>(entity, out var attachParent)
                        ? em.TryGetComponent<BorderDistrict>(attachParent.m_Parent, out var borders)
                            ? borders.m_Left != Entity.Null
                                ? borders.m_Left : borders.m_Right
                            : Entity.Null
                        : Entity.Null;
                districtName = district != Entity.Null ? nameSystem.GetName(district).ToValueableName() : default;
            }
        }
        public class LineVehicleNamed
        {
            public Entity entity { get; }
            public float position { get; }
            public int cargo { get; }
            public int capacity { get; }
            public bool isCargo { get; }
            public ValuableName name { get; }

            public LineVehicleNamed(LineVehicle src, NameSystem nameSystem)
            {
                entity = src.entity;
                position = src.position;
                cargo = src.cargo;
                capacity = src.capacity;
                isCargo = src.isCargo;
                name = nameSystem.GetName(src.entity).ToValueableName();
            }
        }
    }
}
