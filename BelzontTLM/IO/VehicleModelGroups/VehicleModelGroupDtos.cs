using System;
using Unity.Entities;

namespace BelzontTLM
{
    [Serializable]
    public class VehicleModelPairDto
    {
        public Entity primaryPrefab { get; set; }
        public Entity secondaryPrefab { get; set; }
    }

    [Serializable]
    public class VehicleModelGroupListItem
    {
        public Entity entity { get; set; }
        public string name { get; set; }
        public int transportType { get; set; }
        public bool isCargo { get; set; }
        public int modelCount { get; set; }
        public int lineCount { get; set; }
    }

    [Serializable]
    public class VehicleModelGroupDetail
    {
        public Entity entity { get; set; }
        public string name { get; set; }
        public int transportType { get; set; }
        public bool isCargo { get; set; }
        public VehicleModelPairDto[] models { get; set; }
        public Entity[] lines { get; set; }
    }

    [Serializable]
    public class VehicleModelGroupLineShieldInfo
    {
        public LineShieldInfo shield { get; set; }
        /// <summary>Assigned vehicle-model group, or Entity.Null when unassigned / invalid.</summary>
        public Entity vehicleModelGroup { get; set; }
        public bool active { get; set; }
    }

    [Serializable]
    public class VehicleModelGroupLineMembership
    {
        public Entity group { get; set; }
        public string groupName { get; set; }
        public int lineCount { get; set; }
        public string[] lineLabels { get; set; }
        public int overflowCount { get; set; }
    }

    [Serializable]
    public class VehicleModelAvailableVehicles
    {
        public Entity[] primary { get; set; }
        public Entity[] secondary { get; set; }
    }
}
