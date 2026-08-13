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
    public class VehicleModelPrefabInfo
    {
        public Entity entity { get; set; }
        public string name { get; set; }
        public string imageUrl { get; set; }
        public int capacity { get; set; }
        public bool isSecondary { get; set; }
        /// <summary>Mesh size X (width). 0 when unavailable.</summary>
        public float meshWidth { get; set; }
        /// <summary>Mesh size Y (height). 0 when unavailable.</summary>
        public float meshHeight { get; set; }
        /// <summary>Mesh size Z (depth/length). 0 when unavailable.</summary>
        public float meshDepth { get; set; }
        /// <summary>Human-readable composition summary from TrainEngineData.m_Count, or empty.</summary>
        public string compositionDescriptor { get; set; }
        /// <summary>Max composition unit count from TrainEngineData; 0 when N/A.</summary>
        public int compositionUnitCount { get; set; }
    }

    [Serializable]
    public class VehicleModelAvailableVehicles
    {
        public VehicleModelPrefabInfo[] primary { get; set; }
        public VehicleModelPrefabInfo[] secondary { get; set; }
    }

    [Serializable]
    public class VehicleModelPresentType
    {
        public int transportType { get; set; }
        public bool isCargo { get; set; }
    }
}
