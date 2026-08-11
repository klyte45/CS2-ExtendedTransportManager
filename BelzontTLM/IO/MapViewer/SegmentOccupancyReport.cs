using Belzont.Utils;
using Unity.Entities;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    /// <summary>
    /// City-wide segment occupancy snapshot for passenger or cargo lines.
    /// JSON uses camelCase property names via public fields / auto-properties.
    /// </summary>
    public class SegmentOccupancyReport
    {
        public SimulationDateTimeJson cityDateTime { get; set; }
        public LineShieldInfo[] lines { get; set; }
        public SegmentOccupancyStop[] stops { get; set; }
        public SegmentOccupancyEntry[] segments { get; set; }
    }

    /// <summary>Matches vanilla SimulationDateTime shape (year, month, hour, minute).</summary>
    public class SimulationDateTimeJson
    {
        public int year { get; set; }
        public int month { get; set; }
        public int hour { get; set; }
        public int minute { get; set; }

        public static SimulationDateTimeJson FromDateTime(System.DateTime dt) => new()
        {
            year = dt.Year,
            month = dt.Month,
            hour = dt.Hour,
            minute = dt.Minute
        };
    }

    public class LineShieldInfo
    {
        public Entity entity { get; set; }
        public ValuableName name { get; set; }
        public int routeNumber { get; set; }
        public XTMRouteExtraData xtmData { get; set; }
        public string color { get; set; }
        public string type { get; set; }
        public bool isCargo { get; set; }
        public bool isFixedColor { get; set; }
    }

    public class SegmentOccupancyStop
    {
        public Entity lineEntity { get; set; }
        public Entity waypoint { get; set; }
        public Entity entity { get; set; }
        public ValuableName name { get; set; }
        public Vector3Json worldPosition { get; set; }
        public Entity district { get; set; }
        public ValuableName districtName { get; set; }
        public bool isOutsideConnection { get; set; }
        public float azimuth { get; set; }
    }

    public class SegmentOccupancyEntry
    {
        public Entity lineEntity { get; set; }
        public Entity sourceWaypointStopEntity { get; set; }
        public Entity targetWaypointStopEntity { get; set; }
        public float occupancyNumber { get; set; }
        public float capacityRegistered { get; set; }
        public int timeSpanBucket { get; set; }
    }
}
