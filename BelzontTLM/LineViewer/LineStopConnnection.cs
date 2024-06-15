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

        public bool Equals(LineStopConnnection other)
        {
            return line == other.line && stop == other.stop;
        }
    }
}
