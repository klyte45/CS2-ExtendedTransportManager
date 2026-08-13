using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Shields;
using Game;
using System;

namespace BelzontTLM
{
    public partial class XTMShieldImageController : GameSystemBase, IBelzontBindable
    {
        private const string PREFIX = "shieldImage.";

        public void SetupCaller(Action<string, object[]> eventCaller) { }

        public void SetupEventBinder(Action<string, Delegate> eventCaller) { }

        public void SetupCallBinder(Action<string, Delegate> callBinder)
        {
            callBinder($"{PREFIX}ensure", EnsureShield);
            callBinder($"{PREFIX}invalidate", InvalidateShield);
            callBinder($"{PREFIX}clearAll", ClearAll);
        }

        protected override void OnUpdate() { }

        /// <summary>
        /// Bake (if needed) and return coui://xtm.k45/_shields/{key}.png
        /// </summary>
        private string EnsureShield(
            string type,
            bool isCargo,
            string colorRgb,
            string text,
            string activity,
            float borderWidthPx)
        {
            var req = new XTMShieldBakeRequest
            {
                Type = type ?? "Bus",
                IsCargo = isCargo,
                ColorRgb = colorRgb ?? "808080",
                Text = text ?? "",
                Activity = activity ?? "activity-dayNight",
                BorderWidthPx = borderWidthPx,
            };

            var key = XTMShieldBaker.BuildCacheKey(req);
            if (!XTMShieldImageCache.TryGet(key, out var png) || png == null || png.Length == 0)
            {
                try
                {
                    png = XTMShieldBaker.Bake(req);
                    if (png != null && png.Length > 0)
                    {
                        XTMShieldImageCache.Set(key, png);
                    }
                    else
                    {
                        LogUtils.DoWarnLog("[XTMShieldImage] Bake returned empty PNG");
                        return "";
                    }
                }
                catch (Exception ex)
                {
                    LogUtils.DoWarnLog($"[XTMShieldImage] Bake failed: {ex.GetType().Name}: {ex.Message}");
                    return "";
                }
            }

            return XTMShieldBaker.ToUrl(key);
        }

        private bool InvalidateShield(
            string type,
            bool isCargo,
            string colorRgb,
            string text,
            string activity,
            float borderWidthPx)
        {
            var req = new XTMShieldBakeRequest
            {
                Type = type ?? "Bus",
                IsCargo = isCargo,
                ColorRgb = colorRgb ?? "808080",
                Text = text ?? "",
                Activity = activity ?? "activity-dayNight",
                BorderWidthPx = borderWidthPx,
            };
            var key = XTMShieldBaker.BuildCacheKey(req);
            XTMShieldImageCache.Remove(key);
            return true;
        }

        private int ClearAll()
        {
            var n = XTMShieldImageCache.Count;
            XTMShieldImageCache.Clear();
            return n;
        }
    }
}
