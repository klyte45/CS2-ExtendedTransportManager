namespace BelzontTLM
{
    public readonly struct LineSegment
    {
        public float start { get; }

        public float end { get; }
        public float sizeMeters { get; }

        public bool broken { get; }

        public float duration { get; }

        public LineSegment(float start, float end, bool broken, float sizeMeters, float duration)
        {
            this.start = start;
            this.end = end;
            this.broken = broken;
            this.sizeMeters = sizeMeters;
            this.duration = duration;
        }
    }
}
