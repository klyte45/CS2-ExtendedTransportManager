using System;
using Unity.Entities;

namespace BelzontTLM
{
    [Serializable]
    public class FareGroupListItem
    {
        public Entity entity { get; set; }
        public string name { get; set; }
        public float defaultFare { get; set; }
        public int lineCount { get; set; }
    }

    [Serializable]
    public class FareGroupHourExceptionDto
    {
        public byte startingHour { get; set; }
        public byte endingHour { get; set; }
        public float fareValue { get; set; }
    }

    [Serializable]
    public class FareGroupDetail
    {
        public Entity entity { get; set; }
        public string name { get; set; }
        public float defaultFare { get; set; }
        public FareGroupHourExceptionDto[] exceptions { get; set; }
        public Entity[] lines { get; set; }
    }

    [Serializable]
    public class FareGroupLineShieldInfo
    {
        public LineShieldInfo shield { get; set; }
        /// <summary>Assigned fare group, or Entity.Null when unassigned / invalid.</summary>
        public Entity fareGroup { get; set; }
        public bool active { get; set; }
    }

    [Serializable]
    public class FareTicketSliderBounds
    {
        public float min { get; set; }
        public float max { get; set; }
        public float step { get; set; }
        public float defaultValue { get; set; }
    }
}
