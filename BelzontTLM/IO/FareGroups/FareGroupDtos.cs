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
}
