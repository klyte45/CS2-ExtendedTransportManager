using Game.Buildings;
using Game.Common;
using Game.Routes;
using Game.Vehicles;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;

namespace BelzontTLM
{
    public partial class XTMLineViewerSection
    {
        private struct LineRequirementsCheckJob : IJob
        {
            public void Execute()
            {
                if (IsLine(m_SelectedEntity))
                {
                    m_BoolResult[0] = true;
                    m_BoolResult[1] = true;
                    m_EntityResult[0] = m_SelectedEntity;
                    return;
                }
                NativeList<ConnectedRoute> connectedRoutes = new(10, Allocator.Temp);
                bool flag = TryGetStationRoutes(m_SelectedEntity, connectedRoutes);
                bool flag2 = TryGetStopRoutes(m_SelectedEntity, connectedRoutes);
                if (flag || flag2)
                {
                    bool flag3 = false;
                    Entity entity = Entity.Null;
                    for (int i = connectedRoutes.Length - 1; i >= 0; i--)
                    {
                        Owner owner;
                        if (m_Owners.TryGetComponent(connectedRoutes[i].m_Waypoint, out owner) && IsLine(owner.m_Owner))
                        {
                            entity = owner.m_Owner;
                            if (entity == m_SelectedRouteEntity)
                            {
                                flag3 = true;
                            }
                        }
                    }
                    if (!flag3)
                    {
                        m_BoolResult[0] = true;
                        m_BoolResult[1] = true;
                        m_EntityResult[0] = entity;
                        return;
                    }
                    m_BoolResult[0] = true;
                    m_BoolResult[1] = false;
                    m_EntityResult[0] = Entity.Null;
                    return;
                }
                else
                {
                    Entity value;
                    if (IsVehicle(out value))
                    {
                        m_BoolResult[0] = true;
                        m_BoolResult[1] = true;
                        m_EntityResult[0] = value;
                        return;
                    }
                    m_BoolResult[0] = false;
                    m_BoolResult[1] = false;
                    m_EntityResult[0] = Entity.Null;
                    return;
                }
            }

            private bool IsLine(Entity entity)
            {
                return m_Routes.HasComponent(entity) && m_TransportLines.HasComponent(entity) && m_RouteWaypointBuffers.HasBuffer(entity) && m_RouteSegmentBuffers.HasBuffer(entity) && m_RouteVehicleBuffers.HasBuffer(entity);
            }

            private bool TryGetStationRoutes(Entity entity, NativeList<ConnectedRoute> connectedRoutes)
            {
                DynamicBuffer<Game.Objects.SubObject> dynamicBuffer;
                if (m_SubObjectBuffers.TryGetBuffer(entity, out dynamicBuffer))
                {
                    for (int i = 0; i < dynamicBuffer.Length; i++)
                    {
                        TryGetStopRoutes(dynamicBuffer[i].m_SubObject, connectedRoutes);
                    }
                }
                DynamicBuffer<InstalledUpgrade> dynamicBuffer2;
                if (m_InstalledUpgradeBuffers.TryGetBuffer(entity, out dynamicBuffer2))
                {
                    foreach (InstalledUpgrade installedUpgrade in dynamicBuffer2)
                    {
                        TryGetStationRoutes(installedUpgrade.m_Upgrade, connectedRoutes);
                    }
                }
                return connectedRoutes.Length > 0;
            }

            private bool TryGetStopRoutes(Entity entity, NativeList<ConnectedRoute> connectedRoutes)
            {
                DynamicBuffer<ConnectedRoute> dynamicBuffer;
                if (m_ConnectedRouteBuffers.TryGetBuffer(entity, out dynamicBuffer) && m_TransportStops.HasComponent(entity) && !m_TaxiStands.HasComponent(entity) && dynamicBuffer.Length > 0)
                {
                    connectedRoutes.AddRange(dynamicBuffer.AsNativeArray());
                    return true;
                }
                return false;
            }

            private bool IsVehicle(out Entity routeEntity)
            {
                CurrentRoute currentRoute;
                if (m_Vehicles.HasComponent(m_SelectedEntity) && m_Owners.HasComponent(m_SelectedEntity) && m_PublicTransports.HasComponent(m_SelectedEntity) && m_CurrentRoutes.TryGetComponent(m_SelectedEntity, out currentRoute) && IsLine(currentRoute.m_Route))
                {
                    routeEntity = currentRoute.m_Route;
                    return true;
                }
                routeEntity = Entity.Null;
                return false;
            }

            [ReadOnly]
            public Entity m_SelectedEntity;

            [ReadOnly]
            public Entity m_SelectedRouteEntity;

            [ReadOnly]
            public ComponentLookup<Route> m_Routes;

            [ReadOnly]
            public ComponentLookup<TransportLine> m_TransportLines;

            [ReadOnly]
            public ComponentLookup<Game.Routes.TransportStop> m_TransportStops;

            [ReadOnly]
            public ComponentLookup<TaxiStand> m_TaxiStands;

            [ReadOnly]
            public ComponentLookup<Vehicle> m_Vehicles;

            [ReadOnly]
            public ComponentLookup<Owner> m_Owners;

            [ReadOnly]
            public ComponentLookup<Game.Vehicles.PublicTransport> m_PublicTransports;

            [ReadOnly]
            public ComponentLookup<CurrentRoute> m_CurrentRoutes;

            [ReadOnly]
            public BufferLookup<RouteWaypoint> m_RouteWaypointBuffers;

            [ReadOnly]
            public BufferLookup<RouteSegment> m_RouteSegmentBuffers;

            [ReadOnly]
            public BufferLookup<RouteVehicle> m_RouteVehicleBuffers;

            [ReadOnly]
            public BufferLookup<ConnectedRoute> m_ConnectedRouteBuffers;

            [ReadOnly]
            public BufferLookup<Game.Objects.SubObject> m_SubObjectBuffers;

            [ReadOnly]
            public BufferLookup<InstalledUpgrade> m_InstalledUpgradeBuffers;

            public NativeArray<bool> m_BoolResult;

            public NativeArray<Entity> m_EntityResult;
        }
    }
}
