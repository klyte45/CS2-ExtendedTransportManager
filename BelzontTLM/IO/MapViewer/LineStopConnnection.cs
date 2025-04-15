using System;
using Unity.Entities;

namespace BelzontTLM
{
    public readonly struct LineStopConnnection : IEquatable<LineStopConnnection>
    {
        public Entity line { get; }
        public Entity stop { get; }
        public LineStopConnnection(Entity line, Entity stop)
        {
            this.line = line;
            this.stop = stop;
        }

        public override bool Equals(object o) => o.GetType() == typeof(LineStopConnnection) && Equals((LineStopConnnection)o);
        public bool Equals(LineStopConnnection other) => line == other.line && stop == other.stop;

        public override int GetHashCode() => HashCode.Combine(line, stop);

        public static bool operator ==(LineStopConnnection left, LineStopConnnection right) => left.Equals(right);

        public static bool operator !=(LineStopConnnection left, LineStopConnnection right) => !(left == right);
    }
}
