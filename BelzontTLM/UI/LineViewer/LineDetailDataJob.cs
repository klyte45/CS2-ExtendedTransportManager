using Colossal.Mathematics;
using Game.Buildings;
using Game.Common;
using Game.Net;
using Game.Objects;
using Game.Pathfind;
using Game.Prefabs;
using Game.Rendering;
using Game.Routes;
using Game.Vehicles;
using System;
using System.Linq;
using Unity.Burst;
using Unity.Burst.Intrinsics;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using Unity.Mathematics;
using Edge = Game.Net.Edge;

namespace BelzontTLM
{
    public partial class XTMLineViewerSection
    {
        public struct LineDetailData
        {
            public LineSegment[] m_SegmentsResult;
            public LineStop[] m_StopsResult;
            public LineVehicle[] m_VehiclesResult;
            public int stopCapacity;
            public bool isCargo;
        }


        public struct LineDetailDataUnsafe : IDisposable
        {
            public NativeList<LineSegment> m_SegmentsResult;

            public NativeList<LineStop> m_StopsResult;

            public NativeList<LineVehicle> m_VehiclesResult;

            public int stopCapacity;

            public bool isCargo;

            public void Dispose()
            {
                m_SegmentsResult.Dispose();
                m_StopsResult.Dispose();
                m_VehiclesResult.Dispose();
            }

            public LineDetailData ConvertAndDispose()
            {
                var segResultArray = m_SegmentsResult.ToArray(Allocator.Temp);
                var stopsResult = m_StopsResult.ToArray(Allocator.Temp);
                var vehiclesResult = m_VehiclesResult.ToArray(Allocator.Temp);
                try
                {
                    return new LineDetailData()
                    {
                        m_SegmentsResult = segResultArray.ToArray(),
                        m_StopsResult = stopsResult.ToArray(),
                        m_VehiclesResult = vehiclesResult.ToArray(),
                        stopCapacity = stopCapacity,
                        isCargo = isCargo
                    };
                }
                finally
                {
                    segResultArray.Dispose();
                    stopsResult.Dispose();
                    vehiclesResult.Dispose();
                    Dispose();
                }
            }
        }

        [BurstCompile]
        private struct LineDetailDataJob : IJobChunk, IJob
        {
            public Entity m_singleRunEntity;

            public void Execute()
            {
                ExecuteEntity(m_singleRunEntity);
            }

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                var entities = chunk.GetNativeArray(m_EntityType);
                for (int i = 0; i < entities.Length; i++)
                {
                    var entity = entities[i];
                    ExecuteEntity(entity);
                }
            }

            private void ExecuteEntity(Entity entity)
            {
                var output = new LineDetailDataUnsafe()
                {
                    m_SegmentsResult = new NativeList<LineSegment>(Allocator.Temp),
                    m_StopsResult = new NativeList<LineStop>(Allocator.Temp),
                    m_VehiclesResult = new NativeList<LineVehicle>(Allocator.Temp),
                };
                Execute(entity, output);
                m_output.AddNoResize(output);
            }

            public void Execute(Entity routeEntity, LineDetailDataUnsafe output)
            {
                NativeList<float> stopsPointsDistanceFromStart = new(Allocator.Temp);
                float num = 0f;
                output.isCargo = false;
                output.stopCapacity = 0;
                DynamicBuffer<RouteWaypoint> stations = m_RouteWaypointBuffers[routeEntity];
                DynamicBuffer<RouteSegment> routeSegments = m_RouteSegmentBuffers[routeEntity];
                DynamicBuffer<RouteVehicle> vehiclesBuffer = m_RouteVehicleBuffers[routeEntity];
                for (int i = 0; i < routeSegments.Length; i++)
                {
                    stopsPointsDistanceFromStart.Add(num);
                    num += GetSegmentLength(stations, routeSegments, i);
                }
                if (num == 0f)
                {
                    return;
                }
                for (int j = 0; j < routeSegments.Length; j++)
                {
                    if (m_PathInformation.TryGetComponent(routeSegments[j].m_Segment, out PathInformation pathInformation))
                    {
                        float start = stopsPointsDistanceFromStart[j] / num;
                        float end = (j < routeSegments.Length - 1) ? (stopsPointsDistanceFromStart[j + 1] / num) : 1f;
                        bool broken = pathInformation.m_Origin == Entity.Null && pathInformation.m_Destination == Entity.Null;
                        var distance = pathInformation.m_Distance;
                        LineSegment lineSegment = new LineSegment(start, end, broken, distance, pathInformation.m_Duration);
                        output.m_SegmentsResult.Add(lineSegment);
                    }
                }
                bool isCargo = m_PrefabRefs.TryGetComponent(routeEntity, out PrefabRef prefabRef) && m_TransportLineData.TryGetComponent(prefabRef.m_Prefab, out TransportLineData transportLineData) && transportLineData.m_CargoTransport;
                for (int k = 0; k < vehiclesBuffer.Length; k++)
                {
                    Entity vehicle = vehiclesBuffer[k].m_Vehicle;
                    if (GetVehiclePosition(routeEntity, vehicle, out int num2, out float num3, out float num4, out bool flag2))
                    {
                        int num5 = num2;
                        float segmentLength = GetSegmentLength(stations, routeSegments, num5);
                        float num6 = stopsPointsDistanceFromStart[num5];
                        if (flag2 || num3 + num4 > segmentLength)
                        {
                            num6 += segmentLength * num3 / math.max(1f, num3 + num4);
                        }
                        else
                        {
                            num6 += segmentLength - num4;
                        }
                        ValueTuple<int, int> cargo = GetCargo(vehicle);
                        int item = cargo.Item1;
                        int item2 = cargo.Item2;
                        float num7 = num6 / num;
                        var transform = m_Transforms[vehicle];
                        LineVehicle lineVehicle = new LineVehicle(vehicle, num7, item, item2, transform.m_Position, transform.m_Rotation, m_Odometers[vehicle].m_Distance, isCargo);
                        output.m_VehiclesResult.Add(lineVehicle);
                        if (item2 > output.stopCapacity)
                        {
                            output.stopCapacity = item2;
                        }
                    }
                }
                for (int l = 0; l < stations.Length; l++)
                {
                    if (m_Connected.TryGetComponent(stations[l].m_Waypoint, out Connected connected) && m_TransportStops.HasComponent(connected.m_Connected))
                    {
                        float position = stopsPointsDistanceFromStart[l] / num;
                        int waiting = 0;
                        Entity stopPoint = connected.m_Connected;
                        var hasOwner = m_Owners.TryGetComponent(connected.m_Connected, out Owner owner);
                        if (!isCargo && m_WaitingPassengers.TryGetComponent(stations[l].m_Waypoint, out WaitingPassengers waitingPassengers))
                        {
                            waiting = waitingPassengers.m_Count;
                        }
                        else if (m_EconomyResourcesBuffers.TryGetBuffer(connected.m_Connected, out DynamicBuffer<Game.Economy.Resources> dynamicBuffer2))
                        {
                            for (int m = 0; m < dynamicBuffer2.Length; m++)
                            {
                                waiting += dynamicBuffer2[m].m_Amount;
                            }
                        }
                        else if (hasOwner && m_EconomyResourcesBuffers.TryGetBuffer(owner.m_Owner, out DynamicBuffer<Game.Economy.Resources> dynamicBuffer3))
                        {
                            for (int n = 0; n < dynamicBuffer3.Length; n++)
                            {
                                waiting += dynamicBuffer3[n].m_Amount;
                            }
                        }

                        NativeHashSet<Entity> roadsMapped = new NativeHashSet<Entity>(0, Allocator.Temp);
                        NativeQueue<Entity> roadsToMap = new NativeQueue<Entity>(Allocator.Temp);

                        NativeHashSet<LineStopConnnection> linesConnected = new NativeHashSet<LineStopConnnection>(0, Allocator.Persistent);
                        Entity xtmOwner;
                        if (hasOwner)
                        {
                            xtmOwner = GetRealOwner(owner).m_Owner;
                            AddLinesFromXTMConnections(ref linesConnected, routeEntity, xtmOwner, connected.m_Connected);
                            if (m_Buildings.TryGetComponent(xtmOwner, out var building))
                            {
                                roadsToMap.Enqueue(building.m_RoadEdge);
                                while (roadsToMap.TryDequeue(out Entity nextItem))
                                {
                                    if (roadsMapped.Add(nextItem) && ScanLinesAtRoadEdge(ref linesConnected, routeEntity, nextItem, xtmOwner, connected.m_Connected) && m_Edges.TryGetComponent(nextItem, out var edge))
                                    {
                                        if (m_connectedEdgesBuffers.TryGetBuffer(edge.m_Start, out var connectedStart))
                                        {
                                            for (int k = 0; k < connectedStart.Length; k++)
                                            {
                                                if (!roadsMapped.Contains(connectedStart[k].m_Edge))
                                                {
                                                    roadsToMap.Enqueue(connectedStart[k].m_Edge);
                                                }
                                            }
                                        }
                                        if (m_connectedEdgesBuffers.TryGetBuffer(edge.m_End, out var connectedEnd))
                                        {
                                            for (int k = 0; k < connectedEnd.Length; k++)
                                            {
                                                if (!roadsMapped.Contains(connectedEnd[k].m_Edge))
                                                {
                                                    roadsToMap.Enqueue(connectedEnd[k].m_Edge);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (m_Attacheds.TryGetComponent(connected.m_Connected, out var attachment) && !roadsMapped.Contains(attachment.m_Parent))
                        {
                            roadsMapped.Add(attachment.m_Parent);
                            if (ScanLinesAtRoadEdge(ref linesConnected, routeEntity, attachment.m_Parent, Entity.Null, connected.m_Connected) && m_Edges.TryGetComponent(attachment.m_Parent, out var edge))
                            {
                                if (m_connectedEdgesBuffers.TryGetBuffer(edge.m_Start, out var connectedStart))
                                {
                                    for (int k = 0; k < connectedStart.Length; k++)
                                    {
                                        if (roadsMapped.Add(connectedStart[k].m_Edge))
                                        {
                                            ScanLinesAtRoadEdge(ref linesConnected, routeEntity, connectedStart[k].m_Edge, Entity.Null, connected.m_Connected);
                                        }
                                    }
                                }
                                if (m_connectedEdgesBuffers.TryGetBuffer(edge.m_End, out var connectedEnd))
                                {
                                    for (int k = 0; k < connectedEnd.Length; k++)
                                    {
                                        if (roadsMapped.Add(connectedEnd[k].m_Edge))
                                        {
                                            ScanLinesAtRoadEdge(ref linesConnected, routeEntity, connectedEnd[k].m_Edge, Entity.Null, connected.m_Connected);
                                        }
                                    }
                                }
                            }
                        }

                        roadsMapped.Dispose();
                        roadsToMap.Dispose();

                        var transformData = m_Transforms[stopPoint];

                        LineStop lineStop = new LineStop(stations[l].m_Waypoint, stopPoint, position, waiting, isCargo, m_OutsideConnections.HasComponent(stopPoint), linesConnected, transformData.m_Position, transformData.m_Rotation);
                        output.m_StopsResult.Add(lineStop);
                    }
                }
                output.isCargo = isCargo;
            }

            private bool ScanLinesAtRoadEdge(ref NativeHashSet<LineStopConnnection> linesConnected, Entity routeEntity, Entity road, Entity srcBuilding, Entity srcConnected)
            {
                var buildingIsConnected = false;
                if (m_ConnectBuildingBuffers.TryGetBuffer(road, out var connectedBuildings))
                {
                    for (int i = 0; i < connectedBuildings.Length; i++)
                    {
                        if (connectedBuildings[i].m_Building != srcBuilding)
                        {
                            AddLinesFromXTMConnections(ref linesConnected, routeEntity, connectedBuildings[i].m_Building, srcConnected);
                        }
                        else
                        {
                            buildingIsConnected = true;
                        }
                    }
                }
                AddLinesFromXTMConnections(ref linesConnected, routeEntity, road, srcConnected);
                return buildingIsConnected;
            }

            private void AddLinesFromXTMConnections(ref NativeHashSet<LineStopConnnection> linesConnected, Entity routeEntity, Entity xtmOwner, Entity srcConnected)
            {
                if (m_XTMConnectedRouteBuffers.TryGetBuffer(xtmOwner, out var ownerStopsBuffer))
                {
                    for (int j = 0; j < ownerStopsBuffer.Length; j++)
                    {
                        if (m_ConnectedRouteBuffers.TryGetBuffer(ownerStopsBuffer[j].m_StopEntity, out var connectedRoutes))
                        {
                            for (int k = 0; k < connectedRoutes.Length; k++)
                            {
                                if (m_Owners.TryGetComponent(connectedRoutes[k].m_Waypoint, out var stopEntity)
                                    && m_Connected.TryGetComponent(connectedRoutes[k].m_Waypoint, out var connection)
                                    && (stopEntity.m_Owner != routeEntity || srcConnected != connection.m_Connected))
                                {
                                    linesConnected.Add(new(stopEntity.m_Owner, connection.m_Connected));
                                }
                            }
                        }
                    }
                }
            }

            private Owner GetRealOwner(Owner owner)
            {
                var xtmOwner = owner;
                while (m_Owners.TryGetComponent(xtmOwner.m_Owner, out Owner parentOwner))
                {
                    xtmOwner = parentOwner;
                }

                return xtmOwner;
            }

            private float GetSegmentLength(DynamicBuffer<RouteWaypoint> waypoints, DynamicBuffer<RouteSegment> routeSegments, int segmentIndex)
            {
                if (m_PathInformation.TryGetComponent(routeSegments[segmentIndex].m_Segment, out PathInformation pathInformation) && pathInformation.m_Destination != Entity.Null)
                {
                    return pathInformation.m_Distance;
                }
                int index = math.select(segmentIndex + 1, 0, segmentIndex == waypoints.Length - 1);
                if (GetWaypointPosition(waypoints[segmentIndex].m_Waypoint, out float3 x, out float num) && GetWaypointPosition(waypoints[index].m_Waypoint, out float3 y, out float num2))
                {
                    return math.max(0f, math.distance(x, y) - num - num2);
                }
                return 0f;
            }

            private bool GetWaypointPosition(Entity waypoint, out float3 position, out float radius)
            {
                radius = 0f;
                if (!m_Positions.TryGetComponent(waypoint, out Position position2))
                {
                    position = default(float3);
                    return false;
                }
                if (m_RouteLanes.TryGetComponent(waypoint, out RouteLane routeLane) && m_Curves.TryGetComponent(routeLane.m_EndLane, out Curve curve))
                {
                    position = MathUtils.Position(curve.m_Bezier, routeLane.m_EndCurvePos);
                    if (m_MasterLanes.HasComponent(routeLane.m_EndLane))
                    {
                        radius = math.distance(position, position2.m_Position);
                    }
                    return true;
                }
                position = position2.m_Position;
                return true;
            }

            private bool GetVehiclePosition(Entity transportRoute, Entity transportVehicle, out int prevWaypointIndex, out float distanceFromWaypoint, out float distanceToWaypoint, out bool unknownPath)
            {
                prevWaypointIndex = 0;
                distanceFromWaypoint = 0f;
                distanceToWaypoint = 0f;
                unknownPath = true;
                if (!m_CurrentRoutes.TryGetComponent(transportVehicle, out CurrentRoute currentRoute))
                {
                    return false;
                }
                if (!m_Targets.TryGetComponent(transportVehicle, out Target target))
                {
                    return false;
                }
                if (!m_PathOwners.TryGetComponent(transportVehicle, out PathOwner pathOwner))
                {
                    return false;
                }
                if (!m_Waypoints.TryGetComponent(target.m_Target, out Waypoint waypoint))
                {
                    return false;
                }
                if (!GetWaypointPosition(target.m_Target, out float3 y, out float num))
                {
                    return false;
                }
                if (!m_RouteWaypointBuffers.TryGetBuffer(transportRoute, out DynamicBuffer<RouteWaypoint> dynamicBuffer))
                {
                    return false;
                }
                if (currentRoute.m_Route != transportRoute)
                {
                    return false;
                }
                Entity entity = transportVehicle;
                if (m_LayoutElementBuffers.TryGetBuffer(transportVehicle, out DynamicBuffer<LayoutElement> dynamicBuffer2) && dynamicBuffer2.Length != 0)
                {
                    for (int i = 0; i < dynamicBuffer2.Length; i++)
                    {
                        if (m_PrefabRefs.TryGetComponent(dynamicBuffer2[i].m_Vehicle, out PrefabRef prefabRef) && m_TrainDatas.TryGetComponent(prefabRef.m_Prefab, out TrainData trainData))
                        {
                            float num2 = math.csum(trainData.m_AttachOffsets);
                            distanceFromWaypoint -= num2 * 0.5f;
                            distanceToWaypoint -= num2 * 0.5f;
                        }
                    }
                    entity = dynamicBuffer2[0].m_Vehicle;
                }
                else if (m_PrefabRefs.TryGetComponent(transportVehicle, out PrefabRef prefabRef2) && m_TrainDatas.TryGetComponent(prefabRef2.m_Prefab, out TrainData trainData2))
                {
                    float num3 = math.csum(trainData2.m_AttachOffsets);
                    distanceFromWaypoint -= num3 * 0.5f;
                    distanceToWaypoint -= num3 * 0.5f;
                }
                if (m_Trains.TryGetComponent(entity, out Train train) && m_PrefabRefs.TryGetComponent(entity, out PrefabRef prefabRef3) && m_TrainDatas.TryGetComponent(prefabRef3.m_Prefab, out TrainData trainData3))
                {
                    if ((train.m_Flags & Game.Vehicles.TrainFlags.Reversed) != (Game.Vehicles.TrainFlags)0u)
                    {
                        distanceToWaypoint -= trainData3.m_AttachOffsets.y;
                    }
                    else
                    {
                        distanceToWaypoint -= trainData3.m_AttachOffsets.x;
                    }
                }
                float3 @float;
                if (m_CullingInfos.TryGetComponent(entity, out CullingInfo cullingInfo))
                {
                    @float = MathUtils.Center(cullingInfo.m_Bounds);
                }
                else
                {
                    if (!m_Transforms.TryGetComponent(entity, out Game.Objects.Transform transform))
                    {
                        return false;
                    }
                    @float = transform.m_Position;
                }
                prevWaypointIndex = math.select(waypoint.m_Index - 1, dynamicBuffer.Length - 1, waypoint.m_Index == 0);
                if (prevWaypointIndex >= dynamicBuffer.Length)
                {
                    return false;
                }
                if (!GetWaypointPosition(dynamicBuffer[prevWaypointIndex].m_Waypoint, out float3 x, out float num4))
                {
                    return false;
                }
                distanceFromWaypoint += math.distance(x, @float) - num4;
                float3 x2 = @float;
                if ((pathOwner.m_State & (PathFlags.Pending | PathFlags.Failed | PathFlags.Obsolete | PathFlags.Updated | PathFlags.DivertObsolete)) == (PathFlags)0)
                {
                    unknownPath = false;
                    if (m_CarCurrentLanes.TryGetComponent(entity, out CarCurrentLane carCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, carCurrentLane.m_Lane, carCurrentLane.m_CurvePosition.xz);
                    }
                    else if (m_TrainCurrentLanes.TryGetComponent(entity, out TrainCurrentLane trainCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, trainCurrentLane.m_Front.m_Lane, trainCurrentLane.m_Front.m_CurvePosition.yw);
                    }
                    else if (m_WatercraftCurrentLanes.TryGetComponent(entity, out WatercraftCurrentLane watercraftCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, watercraftCurrentLane.m_Lane, watercraftCurrentLane.m_CurvePosition.xz);
                    }
                    else if (m_AircraftCurrentLanes.TryGetComponent(entity, out AircraftCurrentLane aircraftCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, aircraftCurrentLane.m_Lane, aircraftCurrentLane.m_CurvePosition.xz);
                    }
                    if (m_CarNavigationLaneBuffers.TryGetBuffer(transportVehicle, out DynamicBuffer<CarNavigationLane> dynamicBuffer3))
                    {
                        for (int j = 0; j < dynamicBuffer3.Length; j++)
                        {
                            CarNavigationLane carNavigationLane = dynamicBuffer3[j];
                            AddDistance(ref distanceToWaypoint, ref x2, carNavigationLane.m_Lane, carNavigationLane.m_CurvePosition);
                        }
                    }
                    else if (m_TrainNavigationLaneBuffers.TryGetBuffer(transportVehicle, out DynamicBuffer<TrainNavigationLane> dynamicBuffer4))
                    {
                        for (int k = 0; k < dynamicBuffer4.Length; k++)
                        {
                            TrainNavigationLane trainNavigationLane = dynamicBuffer4[k];
                            AddDistance(ref distanceToWaypoint, ref x2, trainNavigationLane.m_Lane, trainNavigationLane.m_CurvePosition);
                        }
                    }
                    else if (m_WatercraftNavigationLaneBuffers.TryGetBuffer(transportVehicle, out DynamicBuffer<WatercraftNavigationLane> dynamicBuffer5))
                    {
                        for (int l = 0; l < dynamicBuffer5.Length; l++)
                        {
                            WatercraftNavigationLane watercraftNavigationLane = dynamicBuffer5[l];
                            AddDistance(ref distanceToWaypoint, ref x2, watercraftNavigationLane.m_Lane, watercraftNavigationLane.m_CurvePosition);
                        }
                    }
                    else if (m_AircraftNavigationLaneBuffers.TryGetBuffer(transportVehicle, out DynamicBuffer<AircraftNavigationLane> dynamicBuffer6))
                    {
                        for (int m = 0; m < dynamicBuffer6.Length; m++)
                        {
                            AircraftNavigationLane aircraftNavigationLane = dynamicBuffer6[m];
                            AddDistance(ref distanceToWaypoint, ref x2, aircraftNavigationLane.m_Lane, aircraftNavigationLane.m_CurvePosition);
                        }
                    }
                    if (m_PathElementBuffers.TryGetBuffer(transportVehicle, out DynamicBuffer<PathElement> dynamicBuffer7))
                    {
                        for (int n = pathOwner.m_ElementIndex; n < dynamicBuffer7.Length; n++)
                        {
                            PathElement pathElement = dynamicBuffer7[n];
                            AddDistance(ref distanceToWaypoint, ref x2, pathElement.m_Target, pathElement.m_TargetDelta);
                        }
                    }
                }
                distanceToWaypoint += math.distance(x2, y) - num;
                distanceFromWaypoint = math.max(0f, distanceFromWaypoint);
                distanceToWaypoint = math.max(0f, distanceToWaypoint);
                return true;
            }

            private void AddDistance(ref float distance, ref float3 position, Entity lane, float2 curveDelta)
            {
                if (m_SlaveLanes.TryGetComponent(lane, out SlaveLane slaveLane) && m_Owners.TryGetComponent(lane, out Owner owner) && m_SubLaneBuffers.TryGetBuffer(owner.m_Owner, out DynamicBuffer<Game.Net.SubLane> dynamicBuffer) && (int)slaveLane.m_MasterIndex < dynamicBuffer.Length)
                {
                    lane = dynamicBuffer[(int)slaveLane.m_MasterIndex].m_SubLane;
                }
                if (m_Curves.TryGetComponent(lane, out Curve curve))
                {
                    distance += math.distance(position, MathUtils.Position(curve.m_Bezier, curveDelta.x));
                    if ((curveDelta.x == 0f && curveDelta.y == 1f) || (curveDelta.x == 1f && curveDelta.y == 0f))
                    {
                        distance += curve.m_Length;
                    }
                    else
                    {
                        distance += MathUtils.Length(curve.m_Bezier, new Bounds1(curveDelta));
                    }
                    position = MathUtils.Position(curve.m_Bezier, curveDelta.y);
                }
            }

            private ValueTuple<int, int> GetCargo(Entity entity)
            {
                int num = 0;
                int num2 = 0;
                if (m_PrefabRefs.TryGetComponent(entity, out PrefabRef prefabRef))
                {
                    if (m_LayoutElementBuffers.TryGetBuffer(entity, out DynamicBuffer<LayoutElement> dynamicBuffer))
                    {
                        for (int i = 0; i < dynamicBuffer.Length; i++)
                        {
                            Entity vehicle = dynamicBuffer[i].m_Vehicle;
                            if (m_PassengerBuffers.TryGetBuffer(vehicle, out DynamicBuffer<Passenger> dynamicBuffer2))
                            {
                                for (int j = 0; j < dynamicBuffer2.Length; j++)
                                {
                                    if (!m_Pets.HasComponent(dynamicBuffer2[j].m_Passenger))
                                    {
                                        num++;
                                    }
                                }
                            }
                            else if (m_EconomyResourcesBuffers.TryGetBuffer(vehicle, out DynamicBuffer<Game.Economy.Resources> dynamicBuffer3))
                            {
                                for (int k = 0; k < dynamicBuffer3.Length; k++)
                                {
                                    num += dynamicBuffer3[k].m_Amount;
                                }
                            }
                            if (m_PrefabRefs.TryGetComponent(vehicle, out PrefabRef prefabRef2))
                            {
                                Entity prefab = prefabRef2.m_Prefab;
                                if (m_PublicTransportVehicleDatas.TryGetComponent(prefab, out PublicTransportVehicleData publicTransportVehicleData))
                                {
                                    num2 += publicTransportVehicleData.m_PassengerCapacity;
                                }
                                else if (m_CargoTransportVehicleDatas.TryGetComponent(prefab, out CargoTransportVehicleData cargoTransportVehicleData))
                                {
                                    num2 += cargoTransportVehicleData.m_CargoCapacity;
                                }
                            }
                        }
                    }
                    else
                    {
                        if (m_PassengerBuffers.TryGetBuffer(entity, out DynamicBuffer<Passenger> dynamicBuffer4))
                        {
                            for (int l = 0; l < dynamicBuffer4.Length; l++)
                            {
                                if (!m_Pets.HasComponent(dynamicBuffer4[l].m_Passenger))
                                {
                                    num++;
                                }
                            }
                        }
                        else if (m_EconomyResourcesBuffers.TryGetBuffer(entity, out DynamicBuffer<Game.Economy.Resources> dynamicBuffer5))
                        {
                            for (int m = 0; m < dynamicBuffer5.Length; m++)
                            {
                                num += dynamicBuffer5[m].m_Amount;
                            }
                        }
                        if (m_PublicTransportVehicleDatas.TryGetComponent(prefabRef.m_Prefab, out PublicTransportVehicleData publicTransportVehicleData2))
                        {
                            num2 = publicTransportVehicleData2.m_PassengerCapacity;
                        }
                        else if (m_CargoTransportVehicleDatas.TryGetComponent(prefabRef.m_Prefab, out CargoTransportVehicleData cargoTransportVehicleData2))
                        {
                            num2 += cargoTransportVehicleData2.m_CargoCapacity;
                        }
                    }
                }
                return new ValueTuple<int, int>(num, num2);
            }

            [ReadOnly]
            public EntityTypeHandle m_EntityType;

            [ReadOnly]
            public ComponentLookup<Game.Routes.Color> m_Colors;

            [ReadOnly]
            public ComponentLookup<PathInformation> m_PathInformation;

            [ReadOnly]
            public ComponentLookup<Connected> m_Connected;

            [ReadOnly]
            public ComponentLookup<WaitingPassengers> m_WaitingPassengers;

            [ReadOnly]
            public ComponentLookup<Position> m_Positions;

            [ReadOnly]
            public ComponentLookup<RouteLane> m_RouteLanes;

            [ReadOnly]
            public ComponentLookup<CurrentRoute> m_CurrentRoutes;

            [ReadOnly]
            public ComponentLookup<Target> m_Targets;

            [ReadOnly]
            public ComponentLookup<PathOwner> m_PathOwners;

            [ReadOnly]
            public ComponentLookup<Owner> m_Owners;

            [ReadOnly]
            public ComponentLookup<Waypoint> m_Waypoints;

            [ReadOnly]
            public ComponentLookup<Train> m_Trains;

            [ReadOnly]
            public ComponentLookup<Curve> m_Curves;

            [ReadOnly]
            public ComponentLookup<MasterLane> m_MasterLanes;

            [ReadOnly]
            public ComponentLookup<SlaveLane> m_SlaveLanes;

            [ReadOnly]
            public ComponentLookup<CarCurrentLane> m_CarCurrentLanes;

            [ReadOnly]
            public ComponentLookup<TrainCurrentLane> m_TrainCurrentLanes;

            [ReadOnly]
            public ComponentLookup<WatercraftCurrentLane> m_WatercraftCurrentLanes;

            [ReadOnly]
            public ComponentLookup<AircraftCurrentLane> m_AircraftCurrentLanes;

            [ReadOnly]
            public ComponentLookup<Game.Creatures.Pet> m_Pets;

            [ReadOnly]
            public ComponentLookup<PrefabRef> m_PrefabRefs;

            [ReadOnly]
            public ComponentLookup<TransportLineData> m_TransportLineData;

            [ReadOnly]
            public ComponentLookup<TrainData> m_TrainDatas;

            [ReadOnly]
            public ComponentLookup<PublicTransportVehicleData> m_PublicTransportVehicleDatas;

            [ReadOnly]
            public ComponentLookup<CargoTransportVehicleData> m_CargoTransportVehicleDatas;

            [ReadOnly]
            public ComponentLookup<Game.Routes.TransportStop> m_TransportStops;

            [ReadOnly]
            public ComponentLookup<CullingInfo> m_CullingInfos;

            [ReadOnly]
            public ComponentLookup<Game.Objects.Transform> m_Transforms;

            [ReadOnly]
            public ComponentLookup<Game.Objects.OutsideConnection> m_OutsideConnections;

            [ReadOnly]
            public BufferLookup<Game.Economy.Resources> m_EconomyResourcesBuffers;

            [ReadOnly]
            public BufferLookup<RouteWaypoint> m_RouteWaypointBuffers;

            [ReadOnly]
            public BufferLookup<RouteSegment> m_RouteSegmentBuffers;

            [ReadOnly]
            public BufferLookup<RouteVehicle> m_RouteVehicleBuffers;

            [ReadOnly]
            public BufferLookup<LayoutElement> m_LayoutElementBuffers;

            [ReadOnly]
            public BufferLookup<CarNavigationLane> m_CarNavigationLaneBuffers;

            [ReadOnly]
            public BufferLookup<TrainNavigationLane> m_TrainNavigationLaneBuffers;

            [ReadOnly]
            public BufferLookup<WatercraftNavigationLane> m_WatercraftNavigationLaneBuffers;

            [ReadOnly]
            public BufferLookup<AircraftNavigationLane> m_AircraftNavigationLaneBuffers;

            [ReadOnly]
            public BufferLookup<PathElement> m_PathElementBuffers;

            [ReadOnly]
            public BufferLookup<Game.Net.SubLane> m_SubLaneBuffers;

            [ReadOnly]
            public BufferLookup<XTMChildConnectedRoute> m_XTMConnectedRouteBuffers;

            [ReadOnly]
            public ComponentLookup<Odometer> m_Odometers;
            [ReadOnly]
            public ComponentLookup<Building> m_Buildings;
            [ReadOnly]
            public ComponentLookup<Attached> m_Attacheds;
            [ReadOnly]
            public ComponentLookup<Edge> m_Edges;
            [ReadOnly]
            public BufferLookup<ConnectedEdge> m_connectedEdgesBuffers;

            [ReadOnly]
            public BufferLookup<ConnectedBuilding> m_ConnectBuildingBuffers;

            [ReadOnly]
            public BufferLookup<ConnectedRoute> m_ConnectedRouteBuffers;

            [ReadOnly]
            public BufferLookup<Passenger> m_PassengerBuffers;

            public NativeList<LineDetailDataUnsafe>.ParallelWriter m_output;
        }
    }
}

