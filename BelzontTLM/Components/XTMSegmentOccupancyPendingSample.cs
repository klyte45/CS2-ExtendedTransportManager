using Unity.Entities;

namespace BelzontTLM
{
    /// <summary>
    /// Marks a vehicle that just finished boarding and is en route to the next stop.
    /// Processed in batches every 32 simulation frames; removed after EMA apply.
    /// </summary>
    public struct XTMSegmentOccupancyPendingSample : IComponentData, IQueryTypeParameter
    {
        public Entity m_Route;
        public Entity m_DepartureWaypoint;
        public int m_WaypointIndex;
        public int m_Hour;
    }
}
