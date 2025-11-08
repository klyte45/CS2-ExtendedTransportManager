using Belzont.Utils;
using Colossal.Collections;
using Colossal.Entities;
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
using Game.Tools;
using Game.UI;
using Game.Vehicles;
using System.Linq;
using Unity.Burst;
using Unity.Burst.Intrinsics;
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

            public AvailableVehicle[] SelectedVehicleModels { get; set; }
            public AvailableVehicle[] AvailableVehicleModels { get; internal set; }
        }

        protected override void Reset()
        {
        }

        protected override void OnCreate()
        {
            base.OnCreate();
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();



            m_TransportVehicleSelectData = new TransportVehicleSelectData(this);
            m_CityConfigurationSystem = World.GetOrCreateSystemManaged<CityConfigurationSystem>();
            m_DepotQuery = GetEntityQuery(new ComponentType[]
            {
                ComponentType.ReadOnly<Game.Buildings.TransportDepot>(),
                ComponentType.Exclude<Temp>(),
                ComponentType.Exclude<Deleted>()
            });
            m_TransportVehiclePrefabQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                TransportVehicleSelectData.GetEntityQueryDesc()
            });
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


            NativeArray<int> results = new NativeArray<int>(2, Allocator.TempJob);
            if (!EntityManager.TryGetComponent<PrefabRef>(e, out var refPrefab) || !EntityManager.TryGetComponent(refPrefab.m_Prefab, out TransportLineData transportLineData))
            {
                m_currentData = output[0].ConvertAndDispose(default, default);
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

                m_currentData = output[0].ConvertAndDispose(availablePrimaryVehicles.ToArray(Allocator.Temp), availableSecondaryVehicles.ToArray(Allocator.Temp));
            }
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
            var models = EntityManager.TryGetBuffer<VehicleModel>(e, true, out var buff) ? buff.ToNativeArray(Allocator.Temp) : default;
            var result = new XTMLineViewerResult
            {
                StopCapacity = m_currentData.stopCapacity,
                Segments = new LineSegment[m_currentData.m_SegmentsResult?.Length ?? 0],
                Stops = new LineStopNamed[m_currentData.m_StopsResult?.Length ?? 0],
                Vehicles = new LineVehicleNamed[m_currentData.m_VehiclesResult?.Length ?? 0],
                LineData = LineItemStruct.ForEntity(e, EntityManager, m_PrefabSystem, m_NameSystem),
                SelectedVehicleModels = [.. models.ToArray().SelectMany(x => new AvailableVehicle[] { new(x.m_PrimaryPrefab, false), new(x.m_SecondaryPrefab, true) }).Where(x => x.entity != Entity.Null)],
                AvailableVehicleModels = m_currentData.m_availableVehicles,
            };
            models.Dispose();
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
        private TransportVehicleSelectData m_TransportVehicleSelectData;
        private CityConfigurationSystem m_CityConfigurationSystem;
        private EntityQuery m_DepotQuery;
        private EntityQuery m_TransportVehiclePrefabQuery;
        private LineDetailData m_currentData;

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
                    TransportDepotData transportDepotData;
                    this.m_TransportDepotDataFromEntity.TryGetComponent(prefab, out transportDepotData);
                    DynamicBuffer<InstalledUpgrade> upgrades;
                    if (CollectionUtils.TryGet<InstalledUpgrade>(bufferAccessor, i, out upgrades))
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
