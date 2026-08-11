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

        /// <summary>Effective historical usage (ema/cap) for 00:00–04:00; 0 if stale.</summary>
        public float usage00_04 { get; }
        /// <summary>Effective historical usage for 04:00–08:00.</summary>
        public float usage04_08 { get; }
        /// <summary>Effective historical usage for 08:00–12:00.</summary>
        public float usage08_12 { get; }
        /// <summary>Effective historical usage for 12:00–16:00.</summary>
        public float usage12_16 { get; }
        /// <summary>Effective historical usage for 16:00–20:00.</summary>
        public float usage16_20 { get; }
        /// <summary>Effective historical usage for 20:00–24:00.</summary>
        public float usage20_00 { get; }

        /// <summary>True when last sample for 00:00–04:00 is older than yesterday.</summary>
        public bool usage00_04_stale { get; }
        /// <summary>True when last sample for 04:00–08:00 is older than yesterday.</summary>
        public bool usage04_08_stale { get; }
        /// <summary>True when last sample for 08:00–12:00 is older than yesterday.</summary>
        public bool usage08_12_stale { get; }
        /// <summary>True when last sample for 12:00–16:00 is older than yesterday.</summary>
        public bool usage12_16_stale { get; }
        /// <summary>True when last sample for 16:00–20:00 is older than yesterday.</summary>
        public bool usage16_20_stale { get; }
        /// <summary>True when last sample for 20:00–24:00 is older than yesterday.</summary>
        public bool usage20_00_stale { get; }

        public LineStop(Entity waypoint, Entity entity, float position, int cargo, bool isCargo, bool isOutsideConnection, NativeHashSet<LineStopConnnection> linesConnected, Vector3 worldPosition, Quaternion rotation,
            float usage00_04 = 0f, float usage04_08 = 0f, float usage08_12 = 0f, float usage12_16 = 0f, float usage16_20 = 0f, float usage20_00 = 0f,
            bool usage00_04_stale = true, bool usage04_08_stale = true, bool usage08_12_stale = true, bool usage12_16_stale = true, bool usage16_20_stale = true, bool usage20_00_stale = true)
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
            this.usage00_04 = usage00_04;
            this.usage04_08 = usage04_08;
            this.usage08_12 = usage08_12;
            this.usage12_16 = usage12_16;
            this.usage16_20 = usage16_20;
            this.usage20_00 = usage20_00;
            this.usage00_04_stale = usage00_04_stale;
            this.usage04_08_stale = usage04_08_stale;
            this.usage08_12_stale = usage08_12_stale;
            this.usage12_16_stale = usage12_16_stale;
            this.usage16_20_stale = usage16_20_stale;
            this.usage20_00_stale = usage20_00_stale;
        }
    }
}
