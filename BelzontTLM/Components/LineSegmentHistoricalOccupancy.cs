using Colossal.Serialization.Entities;
using System;
using Unity.Entities;
using Unity.Mathematics;

namespace BelzontTLM
{
    /// <summary>
    /// Peak-biased EMA occupancy history for departures from a stop waypoint.
    /// Stored on departure waypoint entities that have seen boarding.
    /// </summary>
    public struct LineSegmentHistoricalOccupancy : IComponentData, IQueryTypeParameter, ISerializable
    {
        const uint CURRENT_VERSION = 0;

        // Game day when each 4h bucket was last updated
        public int lastDay_00_04;
        public int lastDay_04_08;
        public int lastDay_08_12;
        public int lastDay_12_16;
        public int lastDay_16_20;
        public int lastDay_20_00;

        // Continuous EMA of load (passengers or cargo amount) per 4h bucket
        public float ema_00_04; // Night / early morning
        public float ema_04_08; // Morning peak
        public float ema_08_12; // Midday / industrial inbound
        public float ema_12_16; // Afternoon / inter-peak
        public float ema_16_20; // Evening peak
        public float ema_20_00; // Night / leisure

        // EMA of vehicle capacity per 4h bucket (float; mixed vehicle sizes on one line)
        public float cap_00_04;
        public float cap_04_08;
        public float cap_08_12;
        public float cap_12_16;
        public float cap_16_20;
        public float cap_20_00;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(lastDay_00_04);
            writer.Write(lastDay_04_08);
            writer.Write(lastDay_08_12);
            writer.Write(lastDay_12_16);
            writer.Write(lastDay_16_20);
            writer.Write(lastDay_20_00);
            writer.Write(ema_00_04);
            writer.Write(ema_04_08);
            writer.Write(ema_08_12);
            writer.Write(ema_12_16);
            writer.Write(ema_16_20);
            writer.Write(ema_20_00);
            writer.Write(cap_00_04);
            writer.Write(cap_04_08);
            writer.Write(cap_08_12);
            writer.Write(cap_12_16);
            writer.Write(cap_16_20);
            writer.Write(cap_20_00);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of LineSegmentHistoricalOccupancy!");
            }
            reader.Read(out lastDay_00_04);
            reader.Read(out lastDay_04_08);
            reader.Read(out lastDay_08_12);
            reader.Read(out lastDay_12_16);
            reader.Read(out lastDay_16_20);
            reader.Read(out lastDay_20_00);
            reader.Read(out ema_00_04);
            reader.Read(out ema_04_08);
            reader.Read(out ema_08_12);
            reader.Read(out ema_12_16);
            reader.Read(out ema_16_20);
            reader.Read(out ema_20_00);
            reader.Read(out cap_00_04);
            reader.Read(out cap_04_08);
            reader.Read(out cap_08_12);
            reader.Read(out cap_12_16);
            reader.Read(out cap_16_20);
            reader.Read(out cap_20_00);
        }

        /// <summary>
        /// Applies one departure sample into the bucket for <paramref name="hour"/> (0–23).
        /// Day-gap resets load EMA only; capacity EMA is preserved across gaps.
        /// </summary>
        public void ApplySample(int hour, int currentDay, float load, float capacity, float alpha)
        {
            int bucket = hour / 4;
            if (bucket < 0) bucket = 0;
            if (bucket > 5) bucket = 5;

            switch (bucket)
            {
                case 0: ApplyBucket(ref lastDay_00_04, ref ema_00_04, ref cap_00_04, currentDay, load, capacity, alpha); break;
                case 1: ApplyBucket(ref lastDay_04_08, ref ema_04_08, ref cap_04_08, currentDay, load, capacity, alpha); break;
                case 2: ApplyBucket(ref lastDay_08_12, ref ema_08_12, ref cap_08_12, currentDay, load, capacity, alpha); break;
                case 3: ApplyBucket(ref lastDay_12_16, ref ema_12_16, ref cap_12_16, currentDay, load, capacity, alpha); break;
                case 4: ApplyBucket(ref lastDay_16_20, ref ema_16_20, ref cap_16_20, currentDay, load, capacity, alpha); break;
                default: ApplyBucket(ref lastDay_20_00, ref ema_20_00, ref cap_20_00, currentDay, load, capacity, alpha); break;
            }
        }

        private static void ApplyBucket(ref int lastDay, ref float ema, ref float cap, int currentDay, float load, float capacity, float alpha)
        {
            // If one or more full days passed with no sample in this bucket, wipe ghost load history
            if (currentDay > lastDay + 1)
            {
                ema = 0;
            }

            // Load: peak-hold then EMA
            if (load > ema)
            {
                ema = load;
            }
            else
            {
                ema = ema * (1f - alpha) + load * alpha;
            }

            // Capacity: same peak-hold + EMA rules
            if (capacity > cap)
            {
                cap = capacity;
            }
            else
            {
                cap = cap * (1f - alpha) + capacity * alpha;
            }

            lastDay = currentDay;
        }

        /// <summary>
        /// Effective usage ratios (ema/cap) for UI; stale buckets (day-gap) expose 0.
        /// Order: 00–04, 04–08, 08–12, 12–16, 16–20, 20–00.
        /// </summary>
        public void GetEffectiveUsages(int currentDay, out float u00, out float u04, out float u08, out float u12, out float u16, out float u20)
        {
            u00 = Effective(ema_00_04, cap_00_04, lastDay_00_04, currentDay);
            u04 = Effective(ema_04_08, cap_04_08, lastDay_04_08, currentDay);
            u08 = Effective(ema_08_12, cap_08_12, lastDay_08_12, currentDay);
            u12 = Effective(ema_12_16, cap_12_16, lastDay_12_16, currentDay);
            u16 = Effective(ema_16_20, cap_16_20, lastDay_16_20, currentDay);
            u20 = Effective(ema_20_00, cap_20_00, lastDay_20_00, currentDay);
        }

        /// <summary>
        /// Per-bucket stale flags for UI (true when last sample is older than yesterday).
        /// Same day-gap rule as <see cref="Effective"/>; order matches GetEffectiveUsages.
        /// </summary>
        public void GetStaleFlags(int currentDay, out bool s00, out bool s04, out bool s08, out bool s12, out bool s16, out bool s20)
        {
            s00 = IsStale(lastDay_00_04, currentDay);
            s04 = IsStale(lastDay_04_08, currentDay);
            s08 = IsStale(lastDay_08_12, currentDay);
            s12 = IsStale(lastDay_12_16, currentDay);
            s16 = IsStale(lastDay_16_20, currentDay);
            s20 = IsStale(lastDay_20_00, currentDay);
        }

        /// <summary>
        /// Fold non-stale effective usages into running min/max (same rules as the occupancy graph).
        /// </summary>
        public void AccumulateNonStaleMinMax(int currentDay, ref float min, ref float max, ref bool any)
        {
            GetEffectiveUsages(currentDay, out float u00, out float u04, out float u08, out float u12, out float u16, out float u20);
            GetStaleFlags(currentDay, out bool s00, out bool s04, out bool s08, out bool s12, out bool s16, out bool s20);
            Consider(u00, s00, ref min, ref max, ref any);
            Consider(u04, s04, ref min, ref max, ref any);
            Consider(u08, s08, ref min, ref max, ref any);
            Consider(u12, s12, ref min, ref max, ref any);
            Consider(u16, s16, ref min, ref max, ref any);
            Consider(u20, s20, ref min, ref max, ref any);
        }

        private static void Consider(float usage, bool stale, ref float min, ref float max, ref bool any)
        {
            if (stale) return;
            if (!any)
            {
                min = max = usage;
                any = true;
                return;
            }
            if (usage < min) min = usage;
            if (usage > max) max = usage;
        }

        private static bool IsStale(int lastDay, int currentDay) => currentDay > lastDay + 1;

        private static float Effective(float ema, float cap, int lastDay, int currentDay)
        {
            if (IsStale(lastDay, currentDay) || cap <= 0f)
            {
                return 0f;
            }
            return math.saturate(ema / cap);
        }
    }
}
