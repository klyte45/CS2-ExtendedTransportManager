using System.Collections.Generic;

namespace BelzontTLM.Shields
{
    /// <summary>In-memory PNG cache for baked line shields (session only).</summary>
    public static class XTMShieldImageCache
    {
        private static readonly Dictionary<string, byte[]> Cache = new();
        private static readonly object Lock = new();

        public static bool TryGet(string key, out byte[] png)
        {
            lock (Lock)
            {
                return Cache.TryGetValue(key, out png);
            }
        }

        public static void Set(string key, byte[] png)
        {
            if (string.IsNullOrEmpty(key) || png == null) return;
            lock (Lock)
            {
                Cache[key] = png;
            }
        }

        public static void Remove(string key)
        {
            if (string.IsNullOrEmpty(key)) return;
            lock (Lock)
            {
                Cache.Remove(key);
            }
        }

        public static void Clear()
        {
            lock (Lock)
            {
                Cache.Clear();
            }
        }

        public static int Count
        {
            get
            {
                lock (Lock)
                {
                    return Cache.Count;
                }
            }
        }
    }
}
