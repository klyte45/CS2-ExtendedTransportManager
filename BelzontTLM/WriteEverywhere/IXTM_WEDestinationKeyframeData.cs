using Colossal.Entities;
using Game.Routes;
using System;
using Unity.Entities;

namespace BelzontTLM
{
    public interface IXTM_WEDestinationKeyframeData : IBufferElementData
    {
        protected Entity UseUntilStop { get; set; }
        protected int CachedStopOrder { get; set; }

        public bool OnLineStopsChanged(EntityManager em, Entity lineOwner)
        {
            if (UseUntilStop == Entity.Null || !em.TryGetBuffer<RouteWaypoint>(lineOwner, true, out var waypoints)) return false;
            for (int i = 0; i < waypoints.Length; i++)
            {
                if (waypoints[i].m_Waypoint == UseUntilStop)
                {
                    CachedStopOrder = i;
                    return i > 0;
                }
            }
            if (CachedStopOrder > 0)
            {
                CachedStopOrder = Math.Min(CachedStopOrder, waypoints.Length - 1);
                UseUntilStop = waypoints[CachedStopOrder].m_Waypoint;
                return true;
            }
            return false;
        }
    }
}
