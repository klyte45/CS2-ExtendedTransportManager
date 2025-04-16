using Belzont.Utils;
using Game.Buildings;
using Game.Common;
using Game.Net;
using Game.Objects;
using Game.Pathfind;
using Game.Prefabs;
using Game.Rendering;
using Game.Routes;
using Game.UI;
using Game.Vehicles;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
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
        }

        protected override void OnCreate()
        {
            base.OnCreate();
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();
        }

        protected override void RunUpdate(Entity e)
        {
            if (e == Entity.Null)
            {
                if (ExtendedTransportManagerMod.DebugMode) LogUtils.DoLog("Entity is null!");
                return;
            }
            using var reqCheckOutput = new NativeArray<LineRequirementsCheckOutput>(1, Allocator.Temp);
            var requirementsCheckJob = new LineRequirementsCheckJob
            {
                m_SelectedEntity = e,
                m_SelectedRouteEntity = e,
                m_Routes = GetComponentLookup<Route>(),
                m_TransportLines = GetComponentLookup<TransportLine>(),
                m_TransportStops = GetComponentLookup<Game.Routes.TransportStop>(),
                m_TaxiStands = GetComponentLookup<TaxiStand>(),
                m_Vehicles = GetComponentLookup<Vehicle>(),
                m_Owners = GetComponentLookup<Owner>(),
                m_PublicTransports = GetComponentLookup<Game.Vehicles.PublicTransport>(),
                m_CurrentRoutes = GetComponentLookup<CurrentRoute>(),
                m_RouteWaypointBuffers = GetBufferLookup<RouteWaypoint>(),
                m_RouteSegmentBuffers = GetBufferLookup<RouteSegment>(),
                m_RouteVehicleBuffers = GetBufferLookup<RouteVehicle>(),
                m_ConnectedRouteBuffers = GetBufferLookup<ConnectedRoute>(),
                m_SubObjectBuffers = GetBufferLookup<Game.Objects.SubObject>(),
                m_InstalledUpgradeBuffers = GetBufferLookup<InstalledUpgrade>(),
                output = reqCheckOutput
            };
            requirementsCheckJob.Schedule(Dependency).Complete();
            if (!reqCheckOutput[0].isValidLine)
            {
                if (ExtendedTransportManagerMod.DebugMode) LogUtils.DoLog("Bool result is false!");
                return;
            }
            NativeList<LineDetailDataUnsafe> output = new(Allocator.Temp);
            FillJobParams(output, e).Schedule(Dependency).Complete();
            m_currentData = output[0].ConvertAndDispose();
            output.Dispose();
        }

        private LineDetailDataJob FillJobParams(NativeList<LineDetailDataUnsafe> output, Entity e = default)
        {
            return new LineDetailDataJob
            {
                m_Colors = GetComponentLookup<Game.Routes.Color>(),
                m_PathInformation = GetComponentLookup<PathInformation>(),
                m_Connected = GetComponentLookup<Connected>(),
                m_WaitingPassengers = GetComponentLookup<WaitingPassengers>(),
                m_Positions = GetComponentLookup<Position>(),
                m_RouteLanes = GetComponentLookup<RouteLane>(),
                m_CurrentRoutes = GetComponentLookup<CurrentRoute>(),
                m_Targets = GetComponentLookup<Target>(),
                m_PathOwners = GetComponentLookup<PathOwner>(),
                m_Owners = GetComponentLookup<Owner>(),
                m_Waypoints = GetComponentLookup<Waypoint>(),
                m_Trains = GetComponentLookup<Train>(),
                m_Curves = GetComponentLookup<Curve>(),
                m_MasterLanes = GetComponentLookup<MasterLane>(),
                m_SlaveLanes = GetComponentLookup<SlaveLane>(),
                m_CarCurrentLanes = GetComponentLookup<CarCurrentLane>(),
                m_TrainCurrentLanes = GetComponentLookup<TrainCurrentLane>(),
                m_WatercraftCurrentLanes = GetComponentLookup<WatercraftCurrentLane>(),
                m_AircraftCurrentLanes = GetComponentLookup<AircraftCurrentLane>(),
                m_Pets = GetComponentLookup<Game.Creatures.Pet>(),
                m_PrefabRefs = GetComponentLookup<PrefabRef>(),
                m_TransportLineData = GetComponentLookup<TransportLineData>(),
                m_TrainDatas = GetComponentLookup<TrainData>(),
                m_PublicTransportVehicleDatas = GetComponentLookup<PublicTransportVehicleData>(),
                m_CargoTransportVehicleDatas = GetComponentLookup<CargoTransportVehicleData>(),
                m_Buildings = GetComponentLookup<Building>(),
                m_Odometers = GetComponentLookup<Odometer>(),
                m_Attacheds = GetComponentLookup<Attached>(),
                m_Edges = GetComponentLookup<Game.Net.Edge>(),
                m_CullingInfos = GetComponentLookup<CullingInfo>(),
                m_Transforms = GetComponentLookup<Game.Objects.Transform>(),
                m_TransportStops = GetComponentLookup<Game.Routes.TransportStop>(),
                m_OutsideConnections = GetComponentLookup<Game.Objects.OutsideConnection>(),
                m_EconomyResourcesBuffers = GetBufferLookup<Game.Economy.Resources>(),
                m_RouteWaypointBuffers = GetBufferLookup<RouteWaypoint>(),
                m_RouteSegmentBuffers = GetBufferLookup<RouteSegment>(),
                m_RouteVehicleBuffers = GetBufferLookup<RouteVehicle>(),
                m_LayoutElementBuffers = GetBufferLookup<LayoutElement>(),
                m_CarNavigationLaneBuffers = GetBufferLookup<CarNavigationLane>(),
                m_TrainNavigationLaneBuffers = GetBufferLookup<TrainNavigationLane>(),
                m_WatercraftNavigationLaneBuffers = GetBufferLookup<WatercraftNavigationLane>(),
                m_AircraftNavigationLaneBuffers = GetBufferLookup<AircraftNavigationLane>(),
                m_PathElementBuffers = GetBufferLookup<PathElement>(),
                m_SubLaneBuffers = GetBufferLookup<Game.Net.SubLane>(),
                m_PassengerBuffers = GetBufferLookup<Passenger>(),
                m_XTMConnectedRouteBuffers = GetBufferLookup<XTMChildConnectedRoute>(),
                m_ConnectedRouteBuffers = GetBufferLookup<ConnectedRoute>(),
                m_connectedEdgesBuffers = GetBufferLookup<ConnectedEdge>(),
                m_ConnectBuildingBuffers = GetBufferLookup<ConnectedBuilding>(),
                m_EntityType = GetEntityTypeHandle(),
                m_output = output.AsParallelWriter(),
                m_singleRunEntity = e
            };
        }

        protected override ComponentType[] ComponentsToCheck => new ComponentType[]
        {
            typeof(Updated),
            typeof(BatchesUpdated),
            typeof(Deleted)
        };

        protected override XTMLineViewerResult OnProcess(Entity e)
        {
            var result = new XTMLineViewerResult
            {
                StopCapacity = m_currentData.stopCapacity,
                Segments = new LineSegment[m_currentData.m_SegmentsResult?.Length ?? 0],
                Stops = new LineStopNamed[m_currentData.m_StopsResult?.Length ?? 0],
                Vehicles = new LineVehicleNamed[m_currentData.m_VehiclesResult?.Length ?? 0],
                LineData = LineItemStruct.ForEntity(e, EntityManager, m_PrefabSystem, m_NameSystem)
            };
            for (int i = 0; i < result.Segments.Length; i++)
            {
                result.Segments[i] = m_currentData.m_SegmentsResult[i];
            }
            for (int j = 0; j < result.Vehicles.Length; j++)
            {
                result.Vehicles[j] = new(m_currentData.m_VehiclesResult[j], m_NameSystem, EntityManager);
            }
            for (int k = 0; k < result.Stops.Length; k++)
            {
                result.Stops[k] = new(m_currentData.m_StopsResult[k], m_NameSystem, EntityManager);
            }
            return result;

        }

        public XTMLineViewerSection()
        {
        }

        private NameSystem m_NameSystem;
        private PrefabSystem m_PrefabSystem;
        private LineDetailData m_currentData;

    }
}
