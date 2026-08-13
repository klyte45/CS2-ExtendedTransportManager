using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Shields;
using cohtml.Net;
using Colossal.UI;
using Game.UI;
using System.Runtime.InteropServices;
using CohStreamReader = Colossal.UI.StreamReader;

namespace BelzontTLM.Overrides
{
    /// <summary>
    /// Serves in-memory shield PNGs at coui://xtm.k45/_shields/{key}.png
    /// (same pattern as BelzontWE GameUIResourceHandlerOverrides).
    /// </summary>
    public class GameUIResourceHandlerOverrides : Redirector, IRedirectableWorldless
    {
        public const string ShieldUrlPrefix = "coui://xtm.k45/_shields/";

        public void Awake()
        {
            AddRedirect(
                typeof(GameUIResourceHandler).GetMethod("OnResourceRequest", RedirectorUtils.allFlags),
                GetType().GetMethod(nameof(BeforeOnResourceRequest), RedirectorUtils.allFlags));
            AddRedirect(
                typeof(DefaultResourceHandler).GetMethod("OnResourceRequest", RedirectorUtils.allFlags),
                GetType().GetMethod(nameof(BeforeOnResourceRequest), RedirectorUtils.allFlags));
            AddRedirect(
                typeof(cohtml.DefaultResourceHandler).GetMethod("OnResourceStreamRequest", RedirectorUtils.allFlags),
                GetType().GetMethod(nameof(BeforeOnResourceStreamRequest), RedirectorUtils.allFlags));
            AddRedirect(
                typeof(DefaultResourceHandler).GetMethod("OnResourceStreamRequest", RedirectorUtils.allFlags),
                GetType().GetMethod(nameof(BeforeOnResourceStreamRequest), RedirectorUtils.allFlags));
        }

        private static bool BeforeOnResourceRequest(ref IResourceRequest request, ref IResourceResponse response)
        {
            var url = request.GetURL();
            if (!url.StartsWith(ShieldUrlPrefix)) return true;

            var key = url[ShieldUrlPrefix.Length..];
            if (key.EndsWith(".png")) key = key[..^4];

            if (!XTMShieldImageCache.TryGet(key, out var png) || png == null || png.Length == 0)
            {
                return true;
            }

            response.SetStatus(200);
            var size = (ulong)png.Length;
            var space = response.GetSpace(size);
            Marshal.Copy(png, 0, space, png.Length);
            response.Finish(ResourceResponse.Status.Success);
            return false;
        }

        private static bool BeforeOnResourceStreamRequest(ref IResourceRequest request, ref IResourceStreamResponse response)
        {
            var url = request.GetURL();
            if (!url.StartsWith(ShieldUrlPrefix)) return true;

            var key = url[ShieldUrlPrefix.Length..];
            if (key.EndsWith(".png")) key = key[..^4];

            if (!XTMShieldImageCache.TryGet(key, out var png) || png == null || png.Length == 0)
            {
                return true;
            }

            response.SetStreamReader(new CohStreamReader(png));
            response.Finish(ResourceStreamResponse.Status.Success);
            return false;
        }
    }
}
