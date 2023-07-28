using Game.Buildings;
using Game.Common;
using Game.Net;
using Game.Objects;
using Game.Pathfind;
using Game.Prefabs;
using Game.Rendering;
using Game.Routes;
using Game.Vehicles;
using Unity.Collections;
using Unity.Entities;
using Edge = Game.Net.Edge;

namespace BelzontTLM
{
    public partial class XTMLineViewerSection
    {
        private struct TypeHandle
        {
            public void __AssignHandles(ref SystemState state)
            {
                __Game_Routes_Route_RO_ComponentLookup = state.GetComponentLookup<Route>(true);
                __Game_Routes_TransportLine_RO_ComponentLookup = state.GetComponentLookup<TransportLine>(true);
                __Game_Routes_TransportStop_RO_ComponentLookup = state.GetComponentLookup<Game.Routes.TransportStop>(true);
                __Game_Routes_TaxiStand_RO_ComponentLookup = state.GetComponentLookup<TaxiStand>(true);
                __Game_Vehicles_Vehicle_RO_ComponentLookup = state.GetComponentLookup<Vehicle>(true);
                __Game_Common_Owner_RO_ComponentLookup = state.GetComponentLookup<Owner>(true);
                __Game_Vehicles_PublicTransport_RO_ComponentLookup = state.GetComponentLookup<Game.Vehicles.PublicTransport>(true);
                __Game_Routes_CurrentRoute_RO_ComponentLookup = state.GetComponentLookup<CurrentRoute>(true);
                __Game_Routes_RouteWaypoint_RO_BufferLookup = state.GetBufferLookup<RouteWaypoint>(true);
                __Game_Routes_RouteSegment_RO_BufferLookup = state.GetBufferLookup<RouteSegment>(true);
                __Game_Routes_RouteVehicle_RO_BufferLookup = state.GetBufferLookup<RouteVehicle>(true);
                __Game_Routes_ConnectedRoute_RO_BufferLookup = state.GetBufferLookup<ConnectedRoute>(true);
                __Game_Objects_SubObject_RO_BufferLookup = state.GetBufferLookup<Game.Objects.SubObject>(true);
                __Game_Buildings_InstalledUpgrade_RO_BufferLookup = state.GetBufferLookup<InstalledUpgrade>(true);
                __Game_Routes_Color_RO_ComponentLookup = state.GetComponentLookup<Game.Routes.Color>(true);
                __Game_Pathfind_PathInformation_RO_ComponentLookup = state.GetComponentLookup<PathInformation>(true);
                __Game_Routes_Connected_RO_ComponentLookup = state.GetComponentLookup<Connected>(true);
                __Game_Routes_WaitingPassengers_RO_ComponentLookup = state.GetComponentLookup<WaitingPassengers>(true);
                __Game_Routes_Position_RO_ComponentLookup = state.GetComponentLookup<Position>(true);
                __Game_Routes_RouteLane_RO_ComponentLookup = state.GetComponentLookup<RouteLane>(true);
                __Game_Common_Target_RO_ComponentLookup = state.GetComponentLookup<Target>(true);
                __Game_Pathfind_PathOwner_RO_ComponentLookup = state.GetComponentLookup<PathOwner>(true);
                __Game_Routes_Waypoint_RO_ComponentLookup = state.GetComponentLookup<Waypoint>(true);
                __Game_Vehicles_Train_RO_ComponentLookup = state.GetComponentLookup<Train>(true);
                __Game_Net_Curve_RO_ComponentLookup = state.GetComponentLookup<Curve>(true);
                __Game_Net_MasterLane_RO_ComponentLookup = state.GetComponentLookup<MasterLane>(true);
                __Game_Net_SlaveLane_RO_ComponentLookup = state.GetComponentLookup<SlaveLane>(true);
                __Game_Vehicles_CarCurrentLane_RO_ComponentLookup = state.GetComponentLookup<CarCurrentLane>(true);
                __Game_Vehicles_TrainCurrentLane_RO_ComponentLookup = state.GetComponentLookup<TrainCurrentLane>(true);
                __Game_Vehicles_WatercraftCurrentLane_RO_ComponentLookup = state.GetComponentLookup<WatercraftCurrentLane>(true);
                __Game_Vehicles_AircraftCurrentLane_RO_ComponentLookup = state.GetComponentLookup<AircraftCurrentLane>(true);
                __Game_Creatures_Pet_RO_ComponentLookup = state.GetComponentLookup<Game.Creatures.Pet>(true);
                __Game_Prefabs_PrefabRef_RO_ComponentLookup = state.GetComponentLookup<PrefabRef>(true);
                __Game_Prefabs_TransportLineData_RO_ComponentLookup = state.GetComponentLookup<TransportLineData>(true);
                __Game_Prefabs_TrainData_RO_ComponentLookup = state.GetComponentLookup<TrainData>(true);
                __Game_Prefabs_PublicTransportVehicleData_RO_ComponentLookup = state.GetComponentLookup<PublicTransportVehicleData>(true);
                __Game_Prefabs_CargoTransportVehicleData_RO_ComponentLookup = state.GetComponentLookup<CargoTransportVehicleData>(true);
                __Game_Rendering_CullingInfo_RO_ComponentLookup = state.GetComponentLookup<CullingInfo>(true);
                __Game_Objects_Transform_RO_ComponentLookup = state.GetComponentLookup<Game.Objects.Transform>(true);
                __Game_Objects_OutsideConnection_RO_ComponentLookup = state.GetComponentLookup<Game.Objects.OutsideConnection>(true);
                __Game_Economy_Resources_RO_BufferLookup = state.GetBufferLookup<Game.Economy.Resources>(true);
                __Game_Vehicles_LayoutElement_RO_BufferLookup = state.GetBufferLookup<LayoutElement>(true);
                __Game_Vehicles_CarNavigationLane_RO_BufferLookup = state.GetBufferLookup<CarNavigationLane>(true);
                __Game_Vehicles_TrainNavigationLane_RO_BufferLookup = state.GetBufferLookup<TrainNavigationLane>(true);
                __Game_Vehicles_WatercraftNavigationLane_RO_BufferLookup = state.GetBufferLookup<WatercraftNavigationLane>(true);
                __Game_Vehicles_AircraftNavigationLane_RO_BufferLookup = state.GetBufferLookup<AircraftNavigationLane>(true);
                __Game_Pathfind_PathElement_RO_BufferLookup = state.GetBufferLookup<PathElement>(true);
                __Game_Net_SubLane_RO_BufferLookup = state.GetBufferLookup<Game.Net.SubLane>(true);
                __Game_Vehicles_Passenger_RO_BufferLookup = state.GetBufferLookup<Passenger>(true);
                __Game_Vehicles_XTMChildConnectedRoute_RO_BufferLookup = state.GetBufferLookup<XTMChildConnectedRoute>(true);
                __Game_Buildings_RO_ComponentLookup = state.GetComponentLookup<Building>(true);
                __Game_Odometers_RO_ComponentLookup = state.GetComponentLookup<Odometer>(true);
                __Game_Attacheds_RO_ComponentLookup = state.GetComponentLookup<Attached>(true);
                __Game_Edges_RO_ComponentLookup = state.GetComponentLookup<Edge>(true);
                __Game_ConnectBuildingBuffers_RO_BufferLookup = state.GetBufferLookup<ConnectedBuilding>(true);
                __Game_ConnectEdge_RO_BufferLookup = state.GetBufferLookup<ConnectedEdge>(true);
            }

            [ReadOnly]
            public ComponentLookup<Route> __Game_Routes_Route_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<TransportLine> __Game_Routes_TransportLine_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Game.Routes.TransportStop> __Game_Routes_TransportStop_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<TaxiStand> __Game_Routes_TaxiStand_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Vehicle> __Game_Vehicles_Vehicle_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Owner> __Game_Common_Owner_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Game.Vehicles.PublicTransport> __Game_Vehicles_PublicTransport_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<CurrentRoute> __Game_Routes_CurrentRoute_RO_ComponentLookup;

            [ReadOnly]
            public BufferLookup<RouteWaypoint> __Game_Routes_RouteWaypoint_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<RouteSegment> __Game_Routes_RouteSegment_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<RouteVehicle> __Game_Routes_RouteVehicle_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<ConnectedRoute> __Game_Routes_ConnectedRoute_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<Game.Objects.SubObject> __Game_Objects_SubObject_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<InstalledUpgrade> __Game_Buildings_InstalledUpgrade_RO_BufferLookup;

            [ReadOnly]
            public ComponentLookup<Game.Routes.Color> __Game_Routes_Color_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<PathInformation> __Game_Pathfind_PathInformation_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Connected> __Game_Routes_Connected_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<WaitingPassengers> __Game_Routes_WaitingPassengers_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Position> __Game_Routes_Position_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<RouteLane> __Game_Routes_RouteLane_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Target> __Game_Common_Target_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<PathOwner> __Game_Pathfind_PathOwner_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Waypoint> __Game_Routes_Waypoint_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Train> __Game_Vehicles_Train_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Curve> __Game_Net_Curve_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<MasterLane> __Game_Net_MasterLane_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<SlaveLane> __Game_Net_SlaveLane_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<CarCurrentLane> __Game_Vehicles_CarCurrentLane_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<TrainCurrentLane> __Game_Vehicles_TrainCurrentLane_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<WatercraftCurrentLane> __Game_Vehicles_WatercraftCurrentLane_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<AircraftCurrentLane> __Game_Vehicles_AircraftCurrentLane_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Game.Creatures.Pet> __Game_Creatures_Pet_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<PrefabRef> __Game_Prefabs_PrefabRef_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<TransportLineData> __Game_Prefabs_TransportLineData_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<TrainData> __Game_Prefabs_TrainData_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<PublicTransportVehicleData> __Game_Prefabs_PublicTransportVehicleData_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<CargoTransportVehicleData> __Game_Prefabs_CargoTransportVehicleData_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<CullingInfo> __Game_Rendering_CullingInfo_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Game.Objects.Transform> __Game_Objects_Transform_RO_ComponentLookup;

            [ReadOnly]
            public ComponentLookup<Game.Objects.OutsideConnection> __Game_Objects_OutsideConnection_RO_ComponentLookup;

            [ReadOnly]
            public BufferLookup<Game.Economy.Resources> __Game_Economy_Resources_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<LayoutElement> __Game_Vehicles_LayoutElement_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<CarNavigationLane> __Game_Vehicles_CarNavigationLane_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<TrainNavigationLane> __Game_Vehicles_TrainNavigationLane_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<WatercraftNavigationLane> __Game_Vehicles_WatercraftNavigationLane_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<AircraftNavigationLane> __Game_Vehicles_AircraftNavigationLane_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<PathElement> __Game_Pathfind_PathElement_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<Game.Net.SubLane> __Game_Net_SubLane_RO_BufferLookup;

            [ReadOnly]
            public BufferLookup<Passenger> __Game_Vehicles_Passenger_RO_BufferLookup;
            [ReadOnly]
            public BufferLookup<XTMChildConnectedRoute> __Game_Vehicles_XTMChildConnectedRoute_RO_BufferLookup;
            internal ComponentLookup<Building> __Game_Buildings_RO_ComponentLookup;
            internal BufferLookup<ConnectedBuilding> __Game_ConnectBuildingBuffers_RO_BufferLookup;
            internal ComponentLookup<Attached> __Game_Attacheds_RO_ComponentLookup;
            internal ComponentLookup<Game.Net.Edge> __Game_Edges_RO_ComponentLookup;
            internal BufferLookup<ConnectedEdge> __Game_ConnectEdge_RO_BufferLookup;
            internal ComponentLookup<Odometer> __Game_Odometers_RO_ComponentLookup;
        }
    }
}
