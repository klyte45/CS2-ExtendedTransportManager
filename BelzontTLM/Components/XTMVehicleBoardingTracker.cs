using Unity.Entities;

namespace BelzontTLM
{
    /// <summary>
    /// Transient state while a vehicle is boarding (or just finished) so departure
    /// waypoint can be recovered after Target advances to the next stop.
    /// Not serialized.
    /// </summary>
    public struct XTMVehicleBoardingTracker : IComponentData, IQueryTypeParameter
    {
        public Entity m_BoardingWaypoint;
        public int m_WaypointIndex;
        public byte m_WasBoarding;
    }
}
