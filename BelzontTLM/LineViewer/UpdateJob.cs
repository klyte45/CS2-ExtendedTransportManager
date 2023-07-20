using Colossal.Mathematics;
using Game.Common;
using Game.Net;
using Game.Pathfind;
using Game.Prefabs;
using Game.Rendering;
using Game.Routes;
using Game.Vehicles;
using System;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;

namespace BelzontTLM
{
    public partial class XTMLineViewerSection
    {
        private struct UpdateJob : IJob
        {
            public void Execute()
            {
                NativeList<float> nativeList = new NativeList<float>(Allocator.Temp);
                float num = 0f;
                m_BoolResult[2] = false;
                m_StopCapacityResult[0] = 0;
                DynamicBuffer<RouteWaypoint> waypoints = m_RouteWaypointBuffers[m_RouteEntity];
                DynamicBuffer<RouteSegment> routeSegments = m_RouteSegmentBuffers[m_RouteEntity];
                DynamicBuffer<RouteVehicle> dynamicBuffer = m_RouteVehicleBuffers[m_RouteEntity];
                for (int i = 0; i < routeSegments.Length; i++)
                {
                    nativeList.Add(num);
                    num += GetSegmentLength(waypoints, routeSegments, i);
                }
                if (num == 0f)
                {
                    return;
                }
                for (int j = 0; j < routeSegments.Length; j++)
                {
                    PathInformation pathInformation;
                    if (m_PathInformation.TryGetComponent(routeSegments[j].m_Segment, out pathInformation))
                    {
                        float start = nativeList[j] / num;
                        float end = (j < routeSegments.Length - 1) ? (nativeList[j + 1] / num) : 1f;
                        bool broken = pathInformation.m_Origin == Entity.Null && pathInformation.m_Destination == Entity.Null;
                        LineSegment lineSegment = new LineSegment(start, end, broken);
                        m_SegmentsResult.Add(lineSegment);
                    }
                }
                PrefabRef prefabRef;
                TransportLineData transportLineData;
                bool flag = m_PrefabRefs.TryGetComponent(m_RouteEntity, out prefabRef) && m_TransportLineData.TryGetComponent(prefabRef.m_Prefab, out transportLineData) && transportLineData.m_CargoTransport;
                for (int k = 0; k < dynamicBuffer.Length; k++)
                {
                    Entity vehicle = dynamicBuffer[k].m_Vehicle;
                    int num2;
                    float num3;
                    float num4;
                    bool flag2;
                    if (GetVehiclePosition(m_RouteEntity, vehicle, out num2, out num3, out num4, out flag2))
                    {
                        int num5 = num2;
                        float segmentLength = GetSegmentLength(waypoints, routeSegments, num5);
                        float num6 = nativeList[num5];
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
                        LineVehicle lineVehicle = new LineVehicle(vehicle, m_RightHandTraffic ? (1f - num7) : num7, item, item2, flag);
                        m_VehiclesResult.Add(lineVehicle);
                        if (item2 > m_StopCapacityResult[0])
                        {
                            m_StopCapacityResult[0] = item2;
                        }
                    }
                }
                for (int l = 0; l < waypoints.Length; l++)
                {
                    Connected connected;
                    if (m_Connected.TryGetComponent(waypoints[l].m_Waypoint, out connected) && m_TransportStops.HasComponent(connected.m_Connected))
                    {
                        float num8 = nativeList[l] / num;
                        int num9 = 0;
                        Entity entity = connected.m_Connected;
                        WaitingPassengers waitingPassengers;
                        DynamicBuffer<Game.Economy.Resources> dynamicBuffer2;
                        Owner owner;
                        DynamicBuffer<Game.Economy.Resources> dynamicBuffer3;
                        if (!flag && m_WaitingPassengers.TryGetComponent(waypoints[l].m_Waypoint, out waitingPassengers))
                        {
                            num9 = waitingPassengers.m_Count;
                        }
                        else if (m_EconomyResourcesBuffers.TryGetBuffer(connected.m_Connected, out dynamicBuffer2))
                        {
                            for (int m = 0; m < dynamicBuffer2.Length; m++)
                            {
                                num9 += dynamicBuffer2[m].m_Amount;
                            }
                        }
                        else if (m_Owners.TryGetComponent(connected.m_Connected, out owner) && m_EconomyResourcesBuffers.TryGetBuffer(owner.m_Owner, out dynamicBuffer3))
                        {
                            for (int n = 0; n < dynamicBuffer3.Length; n++)
                            {
                                num9 += dynamicBuffer3[n].m_Amount;
                            }
                            entity = owner.m_Owner;
                        }
                        LineStop lineStop = new LineStop(entity, m_RightHandTraffic ? (1f - num8) : num8, num9, flag, m_OutsideConnections.HasComponent(entity));
                        m_StopsResult.Add(lineStop);
                    }
                }
                m_BoolResult[2] = flag;
            }

            private float GetSegmentLength(DynamicBuffer<RouteWaypoint> waypoints, DynamicBuffer<RouteSegment> routeSegments, int segmentIndex)
            {
                PathInformation pathInformation;
                if (m_PathInformation.TryGetComponent(routeSegments[segmentIndex].m_Segment, out pathInformation) && pathInformation.m_Destination != Entity.Null)
                {
                    return pathInformation.m_Distance;
                }
                int index = math.select(segmentIndex + 1, 0, segmentIndex == waypoints.Length - 1);
                float3 x;
                float num;
                float3 y;
                float num2;
                if (GetWaypointPosition(waypoints[segmentIndex].m_Waypoint, out x, out num) && GetWaypointPosition(waypoints[index].m_Waypoint, out y, out num2))
                {
                    return math.max(0f, math.distance(x, y) - num - num2);
                }
                return 0f;
            }

            private bool GetWaypointPosition(Entity waypoint, out float3 position, out float radius)
            {
                radius = 0f;
                Position position2;
                if (!m_Positions.TryGetComponent(waypoint, out position2))
                {
                    position = default(float3);
                    return false;
                }
                RouteLane routeLane;
                Curve curve;
                if (m_RouteLanes.TryGetComponent(waypoint, out routeLane) && m_Curves.TryGetComponent(routeLane.m_EndLane, out curve))
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
                CurrentRoute currentRoute;
                if (!m_CurrentRoutes.TryGetComponent(transportVehicle, out currentRoute))
                {
                    return false;
                }
                Target target;
                if (!m_Targets.TryGetComponent(transportVehicle, out target))
                {
                    return false;
                }
                PathOwner pathOwner;
                if (!m_PathOwners.TryGetComponent(transportVehicle, out pathOwner))
                {
                    return false;
                }
                Waypoint waypoint;
                if (!m_Waypoints.TryGetComponent(target.m_Target, out waypoint))
                {
                    return false;
                }
                float3 y;
                float num;
                if (!GetWaypointPosition(target.m_Target, out y, out num))
                {
                    return false;
                }
                DynamicBuffer<RouteWaypoint> dynamicBuffer;
                if (!m_RouteWaypointBuffers.TryGetBuffer(transportRoute, out dynamicBuffer))
                {
                    return false;
                }
                if (currentRoute.m_Route != transportRoute)
                {
                    return false;
                }
                Entity entity = transportVehicle;
                DynamicBuffer<LayoutElement> dynamicBuffer2;
                PrefabRef prefabRef2;
                TrainData trainData2;
                if (m_LayoutElementBuffers.TryGetBuffer(transportVehicle, out dynamicBuffer2) && dynamicBuffer2.Length != 0)
                {
                    for (int i = 0; i < dynamicBuffer2.Length; i++)
                    {
                        PrefabRef prefabRef;
                        TrainData trainData;
                        if (m_PrefabRefs.TryGetComponent(dynamicBuffer2[i].m_Vehicle, out prefabRef) && m_TrainDatas.TryGetComponent(prefabRef.m_Prefab, out trainData))
                        {
                            float num2 = math.csum(trainData.m_AttachOffsets);
                            distanceFromWaypoint -= num2 * 0.5f;
                            distanceToWaypoint -= num2 * 0.5f;
                        }
                    }
                    entity = dynamicBuffer2[0].m_Vehicle;
                }
                else if (m_PrefabRefs.TryGetComponent(transportVehicle, out prefabRef2) && m_TrainDatas.TryGetComponent(prefabRef2.m_Prefab, out trainData2))
                {
                    float num3 = math.csum(trainData2.m_AttachOffsets);
                    distanceFromWaypoint -= num3 * 0.5f;
                    distanceToWaypoint -= num3 * 0.5f;
                }
                Train train;
                PrefabRef prefabRef3;
                TrainData trainData3;
                if (m_Trains.TryGetComponent(entity, out train) && m_PrefabRefs.TryGetComponent(entity, out prefabRef3) && m_TrainDatas.TryGetComponent(prefabRef3.m_Prefab, out trainData3))
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
                CullingInfo cullingInfo;
                float3 @float;
                if (m_CullingInfos.TryGetComponent(entity, out cullingInfo))
                {
                    @float = MathUtils.Center(cullingInfo.m_Bounds);
                }
                else
                {
                    Game.Objects.Transform transform;
                    if (!m_Transforms.TryGetComponent(entity, out transform))
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
                float3 x;
                float num4;
                if (!GetWaypointPosition(dynamicBuffer[prevWaypointIndex].m_Waypoint, out x, out num4))
                {
                    return false;
                }
                distanceFromWaypoint += math.distance(x, @float) - num4;
                float3 x2 = @float;
                if ((pathOwner.m_State & (PathFlags.Pending | PathFlags.Failed | PathFlags.Obsolete | PathFlags.Updated | PathFlags.DivertObsolete)) == (PathFlags)0)
                {
                    unknownPath = false;
                    CarCurrentLane carCurrentLane;
                    TrainCurrentLane trainCurrentLane;
                    WatercraftCurrentLane watercraftCurrentLane;
                    AircraftCurrentLane aircraftCurrentLane;
                    if (m_CarCurrentLanes.TryGetComponent(entity, out carCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, carCurrentLane.m_Lane, carCurrentLane.m_CurvePosition.xz);
                    }
                    else if (m_TrainCurrentLanes.TryGetComponent(entity, out trainCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, trainCurrentLane.m_Front.m_Lane, trainCurrentLane.m_Front.m_CurvePosition.yw);
                    }
                    else if (m_WatercraftCurrentLanes.TryGetComponent(entity, out watercraftCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, watercraftCurrentLane.m_Lane, watercraftCurrentLane.m_CurvePosition.xz);
                    }
                    else if (m_AircraftCurrentLanes.TryGetComponent(entity, out aircraftCurrentLane))
                    {
                        AddDistance(ref distanceToWaypoint, ref x2, aircraftCurrentLane.m_Lane, aircraftCurrentLane.m_CurvePosition.xz);
                    }
                    DynamicBuffer<CarNavigationLane> dynamicBuffer3;
                    DynamicBuffer<TrainNavigationLane> dynamicBuffer4;
                    DynamicBuffer<WatercraftNavigationLane> dynamicBuffer5;
                    DynamicBuffer<AircraftNavigationLane> dynamicBuffer6;
                    if (m_CarNavigationLaneBuffers.TryGetBuffer(transportVehicle, out dynamicBuffer3))
                    {
                        for (int j = 0; j < dynamicBuffer3.Length; j++)
                        {
                            CarNavigationLane carNavigationLane = dynamicBuffer3[j];
                            AddDistance(ref distanceToWaypoint, ref x2, carNavigationLane.m_Lane, carNavigationLane.m_CurvePosition);
                        }
                    }
                    else if (m_TrainNavigationLaneBuffers.TryGetBuffer(transportVehicle, out dynamicBuffer4))
                    {
                        for (int k = 0; k < dynamicBuffer4.Length; k++)
                        {
                            TrainNavigationLane trainNavigationLane = dynamicBuffer4[k];
                            AddDistance(ref distanceToWaypoint, ref x2, trainNavigationLane.m_Lane, trainNavigationLane.m_CurvePosition);
                        }
                    }
                    else if (m_WatercraftNavigationLaneBuffers.TryGetBuffer(transportVehicle, out dynamicBuffer5))
                    {
                        for (int l = 0; l < dynamicBuffer5.Length; l++)
                        {
                            WatercraftNavigationLane watercraftNavigationLane = dynamicBuffer5[l];
                            AddDistance(ref distanceToWaypoint, ref x2, watercraftNavigationLane.m_Lane, watercraftNavigationLane.m_CurvePosition);
                        }
                    }
                    else if (m_AircraftNavigationLaneBuffers.TryGetBuffer(transportVehicle, out dynamicBuffer6))
                    {
                        for (int m = 0; m < dynamicBuffer6.Length; m++)
                        {
                            AircraftNavigationLane aircraftNavigationLane = dynamicBuffer6[m];
                            AddDistance(ref distanceToWaypoint, ref x2, aircraftNavigationLane.m_Lane, aircraftNavigationLane.m_CurvePosition);
                        }
                    }
                    DynamicBuffer<PathElement> dynamicBuffer7;
                    if (m_PathElementBuffers.TryGetBuffer(transportVehicle, out dynamicBuffer7))
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
                SlaveLane slaveLane;
                Owner owner;
                DynamicBuffer<Game.Net.SubLane> dynamicBuffer;
                if (m_SlaveLanes.TryGetComponent(lane, out slaveLane) && m_Owners.TryGetComponent(lane, out owner) && m_SubLaneBuffers.TryGetBuffer(owner.m_Owner, out dynamicBuffer) && (int)slaveLane.m_MasterIndex < dynamicBuffer.Length)
                {
                    lane = dynamicBuffer[(int)slaveLane.m_MasterIndex].m_SubLane;
                }
                Curve curve;
                if (m_Curves.TryGetComponent(lane, out curve))
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
                PrefabRef prefabRef;
                if (m_PrefabRefs.TryGetComponent(entity, out prefabRef))
                {
                    DynamicBuffer<LayoutElement> dynamicBuffer;
                    if (m_LayoutElementBuffers.TryGetBuffer(entity, out dynamicBuffer))
                    {
                        for (int i = 0; i < dynamicBuffer.Length; i++)
                        {
                            Entity vehicle = dynamicBuffer[i].m_Vehicle;
                            DynamicBuffer<Passenger> dynamicBuffer2;
                            DynamicBuffer<Game.Economy.Resources> dynamicBuffer3;
                            if (m_PassengerBuffers.TryGetBuffer(vehicle, out dynamicBuffer2))
                            {
                                for (int j = 0; j < dynamicBuffer2.Length; j++)
                                {
                                    if (!m_Pets.HasComponent(dynamicBuffer2[j].m_Passenger))
                                    {
                                        num++;
                                    }
                                }
                            }
                            else if (m_EconomyResourcesBuffers.TryGetBuffer(vehicle, out dynamicBuffer3))
                            {
                                for (int k = 0; k < dynamicBuffer3.Length; k++)
                                {
                                    num += dynamicBuffer3[k].m_Amount;
                                }
                            }
                            PrefabRef prefabRef2;
                            if (m_PrefabRefs.TryGetComponent(vehicle, out prefabRef2))
                            {
                                Entity prefab = prefabRef2.m_Prefab;
                                PublicTransportVehicleData publicTransportVehicleData;
                                CargoTransportVehicleData cargoTransportVehicleData;
                                if (m_PublicTransportVehicleDatas.TryGetComponent(prefab, out publicTransportVehicleData))
                                {
                                    num2 += publicTransportVehicleData.m_PassengerCapacity;
                                }
                                else if (m_CargoTransportVehicleDatas.TryGetComponent(prefab, out cargoTransportVehicleData))
                                {
                                    num2 += cargoTransportVehicleData.m_CargoCapacity;
                                }
                            }
                        }
                    }
                    else
                    {
                        DynamicBuffer<Passenger> dynamicBuffer4;
                        DynamicBuffer<Game.Economy.Resources> dynamicBuffer5;
                        if (m_PassengerBuffers.TryGetBuffer(entity, out dynamicBuffer4))
                        {
                            for (int l = 0; l < dynamicBuffer4.Length; l++)
                            {
                                if (!m_Pets.HasComponent(dynamicBuffer4[l].m_Passenger))
                                {
                                    num++;
                                }
                            }
                        }
                        else if (m_EconomyResourcesBuffers.TryGetBuffer(entity, out dynamicBuffer5))
                        {
                            for (int m = 0; m < dynamicBuffer5.Length; m++)
                            {
                                num += dynamicBuffer5[m].m_Amount;
                            }
                        }
                        PublicTransportVehicleData publicTransportVehicleData2;
                        CargoTransportVehicleData cargoTransportVehicleData2;
                        if (m_PublicTransportVehicleDatas.TryGetComponent(prefabRef.m_Prefab, out publicTransportVehicleData2))
                        {
                            num2 = publicTransportVehicleData2.m_PassengerCapacity;
                        }
                        else if (m_CargoTransportVehicleDatas.TryGetComponent(prefabRef.m_Prefab, out cargoTransportVehicleData2))
                        {
                            num2 += cargoTransportVehicleData2.m_CargoCapacity;
                        }
                    }
                }
                return new ValueTuple<int, int>(num, num2);
            }

            [ReadOnly]
            public bool m_RightHandTraffic;

            [ReadOnly]
            public Entity m_RouteEntity;

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
            public BufferLookup<Passenger> m_PassengerBuffers;

            public NativeList<LineSegment> m_SegmentsResult;

            public NativeList<LineStop> m_StopsResult;

            public NativeList<LineVehicle> m_VehiclesResult;

            public NativeArray<int> m_StopCapacityResult;

            public NativeArray<bool> m_BoolResult;
        }
    }
}
