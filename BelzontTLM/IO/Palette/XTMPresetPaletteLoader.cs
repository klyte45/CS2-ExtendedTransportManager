using Belzont.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace BelzontTLM.Palettes
{
    internal static class XTMPresetPaletteLoader
    {
        private const string ResourcePrefix = "XTMPalettes/";
        private static readonly Regex HexLineRegex = new("^#?[a-f0-9]{6}$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static XTMPaletteFile[] s_cache;

        public static XTMPaletteFile[] LoadAll()
        {
            if (s_cache != null) return s_cache;

            var assembly = typeof(XTMPresetPaletteLoader).Assembly;
            var loaded = new List<XTMPaletteFile>();

            foreach (var resourceName in assembly.GetManifestResourceNames())
            {
                var normalized = resourceName.Replace('\\', '/');
                if (!normalized.StartsWith(ResourcePrefix, StringComparison.Ordinal)) continue;
                if (!normalized.EndsWith(XTMPaletteFile.EXT_PALETTE, StringComparison.OrdinalIgnoreCase)) continue;

                var relative = normalized[ResourcePrefix.Length..];
                var paletteName = relative[..^XTMPaletteFile.EXT_PALETTE.Length];
                if (string.IsNullOrWhiteSpace(paletteName)) continue;

                try
                {
                    using var stream = assembly.GetManifestResourceStream(resourceName);
                    if (stream == null)
                    {
                        LogUtils.DoWarnLog($"Preset palette resource stream missing: {resourceName}");
                        continue;
                    }

                    using var reader = new StreamReader(stream, Encoding.UTF8);
                    var lines = new List<string>();
                    while (!reader.EndOfStream)
                    {
                        var line = reader.ReadLine()?.Trim();
                        if (string.IsNullOrEmpty(line)) continue;
                        if (HexLineRegex.IsMatch(line)) lines.Add(line);
                    }

                    if (lines.Count == 0)
                    {
                        LogUtils.DoWarnLog($"Preset palette has no valid colors: {paletteName}");
                        continue;
                    }

                    loaded.Add(XTMPaletteFile.FromFileContent(paletteName, [.. lines], fixedGuid: true));
                }
                catch (Exception e)
                {
                    LogUtils.DoWarnLog($"Failed to load preset palette '{paletteName}': {e.Message}");
                }
            }

            s_cache = [.. loaded.OrderBy(x => x.Name, StringComparer.OrdinalIgnoreCase)];
            LogUtils.DoInfoLog($"Loaded {s_cache.Length} embedded preset palettes");
            return s_cache;
        }
    }
}
