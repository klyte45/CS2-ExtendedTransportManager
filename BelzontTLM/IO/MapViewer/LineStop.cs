using Unity.Collections;
using Unity.Entities;
using UnityEngine;

namespace BelzontTLM
{
    public readonly struct LineStop
    {
        public Entity entity { get; }

        public Entity waypoint { get; }

        public float position { get; }

        public int cargo { get; }

        public bool isCargo { get; }

        public bool isOutsideConnection { get; }

        public NativeHashSet<LineStopConnnection> linesConnected { get; }

        public Vector3 worldPosition { get; }

        public Quaternion rotation { get; }


        public LineStop(Entity waypoint, Entity entity, float position, int cargo, bool isCargo, bool isOutsideConnection, NativeHashSet<LineStopConnnection> linesConnected, Vector3 worldPosition, Quaternion rotation)
        {
            this.waypoint = waypoint;
            this.entity = entity;
            this.position = position;
            this.cargo = cargo;
            this.isCargo = isCargo;
            this.isOutsideConnection = isOutsideConnection;
            this.linesConnected = linesConnected;
            this.worldPosition = worldPosition;
            this.rotation = rotation;
        }
    }
}
