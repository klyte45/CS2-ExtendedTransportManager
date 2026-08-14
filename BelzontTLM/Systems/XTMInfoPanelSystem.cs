using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Collections;
using Colossal.Entities;
using Colossal.UI.Binding;
using Game.Buildings;
using Game.City;
using Game.Common;
using Game.Economy;
using Game.Net;
using Game.Objects;
using Game.Pathfind;
using Game.Prefabs;
using Game.Rendering;
using Game.Routes;
using Game.Simulation;
using Game.Tools;
using Game.UI.InGame;
using Game.Vehicles;
using System;
using Unity.Burst;
using Unity.Burst.Intrinsics;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using static BelzontTLM.XTMLineListingSection;

namespace BelzontTLM
{
    public partial class XTMInfoPanelSystem : InfoSectionBase, IBelzontBindable
    {
        private EntityQueryMask entityExistsQuery;
        private Action<string, object[]> emitter;

        private TransportVehicleSelectData m_TransportVehicleSelectData;
        private CityConfigurationSystem m_CityConfigurationSystem;
        private EntityQuery m_DepotQuery;
        private EntityQuery m_TransportVehiclePrefabQuery;

        protected override string group => "K45.XTM";

        protected override void OnCreate()
        {
            base.OnCreate();
            m_InfoUISystem.AddMiddleSection(this);
            entityExistsQuery = EntityManager.UniversalQuery.GetEntityQueryMask();


            m_TransportVehicleSelectData = new TransportVehicleSelectData(this);
            m_CityConfigurationSystem = World.GetOrCreateSystemManaged<CityConfigurationSystem>();
            m_DepotQuery = GetEntityQuery(
            [
                ComponentType.ReadOnly<Game.Buildings.TransportDepot>(),
                ComponentType.Exclude<Temp>(),
                ComponentType.Exclude<Deleted>()
            ]);
            m_TransportVehiclePrefabQuery = GetEntityQuery(
            [
                TransportVehicleSelectData.GetEntityQueryDesc()
            ]);
        }
        protected override void OnUpdate()
        {
            visible = selectedEntity != Entity.Null && m_InfoUISystem.selectedRoute != Entity.Null;
        }

        protected override void Reset()
        {
        }

        protected override void OnProcess()
        {
        }

        public override void OnWriteProperties(IJsonWriter writer)
        {
        }

        public void SetupCaller(Action<string, object[]> eventEmitter)
        {
            emitter = eventEmitter;
        }

        public void SetupEventBinder(Action<string, Delegate> eventBinderFn)
        {
        }

        public void SetupCallBinder(Action<string, Delegate> callBinderFn)
        {
            callBinderFn("xtmInfoPanel.getCurrentLineInfo", () => GetLineView(m_InfoUISystem.selectedRoute));
        }

        protected XTMLineViewerResult GetLineView(Entity e)
        {
            if (e == Entity.Null)
            {
                if (ExtendedTransportManagerMod.DebugMode) LogUtils.DoLog("Entity is null!");
                return default;
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
                m_WorkRoute = GetComponentLookup<WorkRoute>(),
                output = reqCheckOutput
            };
            requirementsCheckJob.Schedule(Dependency).Complete();
            if (!reqCheckOutput[0].isValidLine)
            {
                if (ExtendedTransportManagerMod.DebugMode) LogUtils.DoLog("Bool result is false!");
                return default;
            }
            LineDetailData resultData;
            NativeList<LineDetailDataUnsafe> output = new(Allocator.Temp);
            FillJobParams(output, e).Schedule(Dependency).Complete();


            NativeArray<int> results = new(2, Allocator.TempJob);
            if (!EntityManager.TryGetComponent<PrefabRef>(e, out var refPrefab) || !EntityManager.TryGetComponent(refPrefab.m_Prefab, out TransportLineData transportLineData))
            {
                results.Dispose();
                resultData = output[0].ConvertAndDispose(
                    new NativeArray<Entity>(0, Allocator.Temp),
                    new NativeArray<Entity>(0, Allocator.Temp));
            }
            else
            {
                TransportDepots transportDepotsJob = default;
                transportDepotsJob.m_EntityType = GetEntityTypeHandle();
                transportDepotsJob.m_InstalledUpgradesType = GetBufferTypeHandle<InstalledUpgrade>(true);
                transportDepotsJob.m_PrefabRefFromEntity = GetComponentLookup<PrefabRef>();
                transportDepotsJob.m_TransportDepotDataFromEntity = GetComponentLookup<TransportDepotData>();
                transportDepotsJob.m_TransportType = transportLineData.m_TransportType;
                transportDepotsJob.m_Results = results;
                transportDepotsJob.Schedule(m_DepotQuery, Dependency).Complete();


                m_TransportVehicleSelectData.PreUpdate(this, m_CityConfigurationSystem, m_TransportVehiclePrefabQuery, Allocator.TempJob, out var job2);

                using var availablePrimaryVehicles = new NativeList<Entity>(20, Allocator.Temp);
                using var availableSecondaryVehicles = new NativeList<Entity>(20, Allocator.Temp);
                TransportVehiclesListJob jobData3 = default;
                jobData3.m_Resources = (output[0].isCargo ? Resource.All : Resource.NoResource);
                jobData3.m_EnergyTypes = (EnergyTypes)results[1];
                jobData3.m_SizeClass = transportLineData.m_SizeClass;
                jobData3.m_PublicTransportPurpose = (output[0].isCargo ? ((PublicTransportPurpose)0) : PublicTransportPurpose.TransportLine);
                jobData3.m_TransportType = transportLineData.m_TransportType;
                jobData3.m_PrimaryList = availablePrimaryVehicles;
                jobData3.m_SecondaryList = availableSecondaryVehicles;
                jobData3.m_VehicleSelectData = m_TransportVehicleSelectData;
                JobHandle jobHandle2 = jobData3.Schedule(JobHandle.CombineDependencies(base.Dependency, job2));
                results.Dispose(jobHandle2);
                jobHandle2.Complete();
                m_TransportVehicleSelectData.PostUpdate(jobHandle2);

                resultData = output[0].ConvertAndDispose(availablePrimaryVehicles.ToArray(Allocator.Temp), availableSecondaryVehicles.ToArray(Allocator.Temp));
            }
            output.Dispose();

            return OnProcess(e, resultData);
        }

        public class XTMLineViewerResult
        {
            public XTMLineViewerResult() { }

            public LineItemStruct LineData { get; set; }
            public int StopCapacity { get; set; }
            public LineStopNamed[] Stops { get; set; }
            public LineVehicleNamed[] Vehicles { get; set; }
            public LineSegment[] Segments { get; set; }

            public AvailableVehicle[] SelectedVehicleModels { get; set; }
            public AvailableVehicle[] AvailableVehicleModels { get; internal set; }
        }
        protected XTMLineViewerResult OnProcess(Entity e, LineDetailData lineDetail)
        {
            AvailableVehicle[] selectedVehiclesArr = [];
            if (EntityManager.TryGetBuffer<VehicleModel>(e, true, out var buff))
            {
                int cap = Math.Max(0, buff.Length * 2);
                var list = new System.Collections.Generic.List<AvailableVehicle>(cap);
                for (int i = 0; i < buff.Length; i++)
                {
                    var m = buff[i];
                    if (m.m_PrimaryPrefab != Entity.Null) list.Add(new AvailableVehicle(m.m_PrimaryPrefab, false));
                    if (m.m_SecondaryPrefab != Entity.Null) list.Add(new AvailableVehicle(m.m_SecondaryPrefab, true));
                }
                selectedVehiclesArr = [.. list];
            }

            var result = new XTMLineViewerResult
            {
                StopCapacity = lineDetail.stopCapacity,
                Segments = new LineSegment[lineDetail.m_SegmentsResult?.Length ?? 0],
                Stops = new LineStopNamed[lineDetail.m_StopsResult?.Length ?? 0],
                Vehicles = new LineVehicleNamed[lineDetail.m_VehiclesResult?.Length ?? 0],
                LineData = LineItemStruct.ForEntity(e, EntityManager, m_PrefabSystem, m_NameSystem, TimeSystem.GetDay(
                    World.GetOrCreateSystemManaged<Game.Simulation.SimulationSystem>().frameIndex,
                    TimeData.GetSingleton(GetEntityQuery(ComponentType.ReadOnly<TimeData>())))),
                SelectedVehicleModels = selectedVehiclesArr,
                AvailableVehicleModels = lineDetail.m_availableVehicles,
            };

            for (int i = 0; i < result.Segments.Length; i++)
            {
                result.Segments[i] = lineDetail.m_SegmentsResult[i];
            }
            for (int j = 0; j < result.Vehicles.Length; j++)
            {
                result.Vehicles[j] = new(lineDetail.m_VehiclesResult[j], m_NameSystem, EntityManager);
            }
            for (int k = 0; k < result.Stops.Length; k++)
            {
                result.Stops[k] = new(lineDetail.m_StopsResult[k], m_NameSystem, EntityManager);
            }
            return result;

        }
        private LineDetailDataJob FillJobParams(NativeList<LineDetailDataUnsafe> output, Entity e = default)
        {
            var simulationSystem = World.GetOrCreateSystemManaged<Game.Simulation.SimulationSystem>();
            var timeData = TimeData.GetSingleton(GetEntityQuery(ComponentType.ReadOnly<TimeData>()));
            int currentDay = Game.Simulation.TimeSystem.GetDay(simulationSystem.frameIndex, timeData);

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
                m_WorkRoute = GetComponentLookup<WorkRoute>(),
                m_CullingInfos = GetComponentLookup<CullingInfo>(),
                m_Transforms = GetComponentLookup<Game.Objects.Transform>(),
                m_TransportStops = GetComponentLookup<Game.Routes.TransportStop>(),
                m_OutsideConnections = GetComponentLookup<Game.Objects.OutsideConnection>(),
                m_HistoricalOccupancy = GetComponentLookup<LineSegmentHistoricalOccupancy>(true),
                m_CurrentDay = currentDay,
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

        [BurstCompile]
        private struct TransportVehiclesListJob : IJob
        {
            public void Execute()
            {
                m_VehicleSelectData.ListVehicles(m_TransportType, m_EnergyTypes, m_SizeClass, m_PublicTransportPurpose, m_Resources, m_PrimaryList, m_SecondaryList, true);
            }
            public Resource m_Resources;
            public EnergyTypes m_EnergyTypes;
            public SizeClass m_SizeClass;
            public PublicTransportPurpose m_PublicTransportPurpose;
            public TransportType m_TransportType;
            public NativeList<Entity> m_PrimaryList;
            public NativeList<Entity> m_SecondaryList;
            [ReadOnly]
            public TransportVehicleSelectData m_VehicleSelectData;
        }

        [BurstCompile]
        private struct TransportDepots : IJobChunk
        {
            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                NativeArray<Entity> nativeArray = chunk.GetNativeArray(m_EntityType);
                BufferAccessor<InstalledUpgrade> bufferAccessor = chunk.GetBufferAccessor<InstalledUpgrade>(ref m_InstalledUpgradesType);
                for (int i = 0; i < chunk.Count; i++)
                {
                    Entity entity = nativeArray[i];
                    Entity prefab = this.m_PrefabRefFromEntity[entity].m_Prefab;
                    this.m_TransportDepotDataFromEntity.TryGetComponent(prefab, out var transportDepotData);
                    if (CollectionUtils.TryGet<InstalledUpgrade>(bufferAccessor, i, out var upgrades))
                    {
                        UpgradeUtils.CombineStats<TransportDepotData>(ref transportDepotData, upgrades, ref m_PrefabRefFromEntity, ref m_TransportDepotDataFromEntity);
                    }
                    if (transportDepotData.m_TransportType == m_TransportType)
                    {
                        m_Results[0] = 1;
                        m_Results[1] |= (int)transportDepotData.m_EnergyTypes;
                    }
                }
            }

            void IJobChunk.Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                Execute(chunk, unfilteredChunkIndex, useEnabledMask, chunkEnabledMask);
            }

            [ReadOnly]
            public EntityTypeHandle m_EntityType;
            [ReadOnly]
            public BufferTypeHandle<InstalledUpgrade> m_InstalledUpgradesType;
            [ReadOnly]
            public ComponentLookup<PrefabRef> m_PrefabRefFromEntity;
            [ReadOnly]
            public ComponentLookup<TransportDepotData> m_TransportDepotDataFromEntity;
            public TransportType m_TransportType;
            public NativeArray<int> m_Results;
        }

    }
}
