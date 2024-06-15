using Unity.Entities;
using UnityEngine;

namespace BelzontTLM
{
    public readonly struct LineVehicle
    {
        internal float odometer { get; }

        public Entity entity { get; }

        public float position { get; }

        public int cargo { get; }

        public int capacity { get; }

        public bool isCargo { get; }

        public Vector3 worldPosition { get; }

        public Quaternion rotation { get; }

        public LineVehicle(Entity entity, float position, int cargo, int capacity, Vector3 worldPosition, Quaternion rotation, float odometer, bool isCargo = false)
        {
            this.entity = entity;
            this.position = position;
            this.cargo = cargo;
            this.capacity = capacity;
            this.isCargo = isCargo;
            this.worldPosition = worldPosition;
            this.rotation = rotation;
            this.odometer = odometer;
        }
    }
}
