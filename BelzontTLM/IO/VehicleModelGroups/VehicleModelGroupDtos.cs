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
        /// <summary>Linked lines. May be empty — groups with models and no lines are valid.</summary>
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
        /// <summary>Total capacity for a full composition (vanilla-style sum), or single-car capacity.</summary>
        public int capacity { get; set; }
        public bool isSecondary { get; set; }
        /// <summary>Mesh size X (width) of this prefab alone. 0 when unavailable.</summary>
        public float meshWidth { get; set; }
        /// <summary>Mesh size Y (height) of this prefab alone. 0 when unavailable.</summary>
        public float meshHeight { get; set; }
        /// <summary>
        /// Total composition length (sum of cars × unit count) when this is an engine/MU front;
        /// otherwise this prefab's mesh depth alone.
        /// </summary>
        public float meshDepth { get; set; }
        /// <summary>Mesh depth of this prefab alone (never multiplied by unit count).</summary>
        public float singleMeshDepth { get; set; }
        /// <summary>
        /// Composition summary: "{units}×{carsPerUnit}" (ranges when min≠max), from
        /// TrainEngineData.m_Count and VehicleCarriageElement counts. Empty when N/A.
        /// </summary>
        public string compositionDescriptor { get; set; }
        /// <summary>Max unit repeat count from TrainEngineData; 0 when N/A.</summary>
        public int compositionUnitCount { get; set; }
        /// <summary>Max cars per unit (self + VehicleCarriageElement counts); 0 when N/A.</summary>
        public int carsPerUnitCount { get; set; }
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
