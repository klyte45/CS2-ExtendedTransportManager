using Belzont.Utils;
using Colossal;
using Colossal.OdinSerializer.Utilities;
using Colossal.Serialization.Entities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Unity.Entities;
using UnityEngine;
using Color = UnityEngine.Color;

namespace BelzontTLM.Palettes
{
    public class XTMPaletteManager
    {
        public static XTMPaletteManager Instance => instance ??= new XTMPaletteManager();
        private static XTMPaletteManager instance;

        public static readonly Guid GUID_NAMESPACE = GuidUtils.Create(Guid.Empty, "XTM_Palettes");
        public static readonly Guid PALETTE_RANDOM = GuidUtils.Create(GUID_NAMESPACE, "");
        public const char SERIALIZER_ITEM_SEPARATOR = '∞';
        private RandomPastelColorGenerator gen = new();
        private readonly Dictionary<Guid, XTMPaletteFile> m_palettes = new();
        public readonly XTMPaletteFile[] defaultPaletteArray = new XTMPaletteFile[] {
                    new("BRA/São Paulo 2035",XTMPresetPalettes. SaoPaulo2035,true),
                    new("BRA/São Paulo 1960",XTMPresetPalettes. SaoPaulo1960,true),
                    new("UK/London 2016", XTMPresetPalettes.London2016,true),
                    new("Generic/Rainbow/Full",XTMPresetPalettes. Rainbow,true),
                    new("Generic/Rainbow/Short", XTMPresetPalettes.RainbowShort,true),
                    new("Generic/World Metro Mix", XTMPresetPalettes.WorldMix,true),
                    new("Generic/Microsoft/Metro UI", XTMPresetPalettes.MSMetroUI,true),
                    new("Generic/Microsoft/Windows 95 (16 colors)", XTMPresetPalettes.MSWin95,true),
                    new("Generic/Microsoft/Windows 95 (20 colors)", XTMPresetPalettes.MSWin95_20,true),
                    new("Generic/Apple Macintosh 1987", XTMPresetPalettes.AppleMacintosh,true),
                    new("Generic/Material Color/100", XTMPresetPalettes.MatColor100,true),
                    new("Generic/Material Color/500", XTMPresetPalettes.MatColor500,true),
                    new("Generic/Material Color/900", XTMPresetPalettes.MatColor900,true),
                    new("Generic/Material Color/A200", XTMPresetPalettes.MatColorA200,true),
                    new("Generic/Material Color/A400", XTMPresetPalettes.MatColorA400,true),
                    new("Generic/Material Color/A700", XTMPresetPalettes.MatColorA700,true),
                    new("BRA/São Paulo CPTM 2000", XTMPresetPalettes.CPTM_SP_2000,true),
                    new("BRA/São Paulo City Bus Area 2000", XTMPresetPalettes.SP_BUS_2000,true),
                    new("USA/New York City Subway/1972", XTMPresetPalettes.NYC_SUBWAY_1972,true),
                    new("USA/New York City Subway/1979", XTMPresetPalettes.NYC_SUBWAY_1979,true),
                    new("USA/New York City Subway/Official Modern", XTMPresetPalettes.NYC_SUBWAY_MODERN_OFFICIAL,true),
                    new("USA/New York City Subway/2012 Vignelli", XTMPresetPalettes.NYC_SUBWAY_MODERN_VIGNELLI_2012,true),
                    new("USA/BART Modern", XTMPresetPalettes.SF_BART_MODERN,true),
                    new("USA/Chicago CTA", XTMPresetPalettes.CHICAGO_CTA ,true),
                    new("USA/Washington DC Metro", XTMPresetPalettes.WDC_METRO ,true),
                    new("USA/LA Metro", XTMPresetPalettes.LA_METRO ,true),
                    new("USA/MBTA (Boston)", XTMPresetPalettes.BOSTON_MBTA ,true),
                    new("Generic/IBM Design Library Accessible Palette", XTMPresetPalettes.IBM_ACCESSIBLE ,true),
                    new("Generic/Wong Accessible Palette", XTMPresetPalettes.WONG_ACCESSIBLE ,true),
                    new("Generic/Tol Vibrant Accessible Palette", XTMPresetPalettes.TOL_VIBRANT_ACCESSIBLE ,true),
                };

        public string[] PaletteList => new string[] { null }.Union(m_palettes.Values.Select(x => x.Name)).OrderBy(x => x).ToArray();

        public XTMPaletteFile[] FullLibrary => m_palettes.Values.Concat(defaultPaletteArray).ToArray();
        public XTMPaletteFile[] EditableLibrary => m_palettes.Values.ToArray();

        private XTMPaletteManager()
        {
            if (ExtendedTransportManagerMod.TraceMode) LogUtils.DoTraceLog("XTMPaletteFiles init()");
            Reload();
        }

        public void Reload()
        {
            Load();
        }

        private Dictionary<string, string> GetPalettesAsDictionary()
        {
            Dictionary<string, string> result = new();
            foreach (var pal in m_palettes.Values)
            {
                if (!result.ContainsKey(pal.Name))
                {
                    result[pal.Name] = pal.ToFileContent();
                }
            }
            return result;
        }

        public void SaveAll()
        {
            KFileUtils.EnsureFolderCreation(ExtendedTransportManagerMod.Instance.PalettesFolder);
            var filesToSave = GetPalettesAsDictionary();
            foreach (var file in filesToSave)
            {
                File.WriteAllText(Path.Combine(ExtendedTransportManagerMod.Instance.PalettesFolder, file.Key + XTMPaletteFile.EXT_PALETTE), file.Value);
            }
        }
        public void Save(string palette)
        {
            var target = m_palettes.FirstOrDefault(x => x.Value.Name == palette).Value;
            if (target is not null)
            {
                Save(target.Guid);
            }
        }

        public void Save(Guid palette)
        {
            if (m_palettes.ContainsKey(palette))
            {
                m_palettes[palette].Save();
            }
        }

        private void Load()
        {
            m_palettes.Clear();
            KFileUtils.EnsureFolderCreation(ExtendedTransportManagerMod.Instance.PalettesFolder);
            foreach (var filename in Directory.EnumerateFiles(ExtendedTransportManagerMod.Instance.PalettesFolder, "*" + XTMPaletteFile.EXT_PALETTE, SearchOption.AllDirectories))
            {
                var fileContents = File.ReadAllLines(filename, Encoding.UTF8);
                var name = filename.Replace(ExtendedTransportManagerMod.Instance.PalettesFolder + Path.DirectorySeparatorChar, "")[..^XTMPaletteFile.EXT_PALETTE.Length].Replace(Path.DirectorySeparatorChar, '/');
                var value = XTMPaletteFile.FromFileContent(name, fileContents.Select(x => x?.Trim()).Where(x => Regex.IsMatch(x, "^#?[a-f0-9]{6}$", RegexOptions.IgnoreCase)).ToArray());

                m_palettes[value.Guid] = value;
                if (ExtendedTransportManagerMod.DebugMode) LogUtils.DoLog("LOADED PALETTE ({0}) QTT: {1}", filename, m_palettes[value.Guid].Count);
            }
        }

        public Color32 GetColor(int number, Guid[] paletteOrderSearch, bool randomOnPaletteOverflow, bool avoidRandom = false)
        {
            foreach (var paletteName in paletteOrderSearch)
            {
                if (m_palettes.ContainsKey(paletteName))
                {
                    XTMPaletteFile palette = m_palettes[paletteName];
                    if (!randomOnPaletteOverflow || number <= palette.Colors.Count)
                    {
                        return palette.Colors[number % palette.Count];
                    }
                }
            }
            return avoidRandom ? (Color32)Color.clear : gen.GetNext();
        }

        public List<Color32> GetColors(Guid paletteName)
        {
            if (m_palettes.ContainsKey(paletteName))
            {
                XTMPaletteFile palette = m_palettes[paletteName];
                return palette.Colors;
            }
            return null;
        }

        public XTMPaletteFile GetPalette(Guid paletteName)
        {
            if (m_palettes.ContainsKey(paletteName))
            {
                XTMPaletteFile palette = m_palettes[paletteName];
                return palette;
            }
            return null;
        }

        public void AddPalette(string paletteName)
        {
            if (!paletteName.IsNullOrWhitespace())
            {
                var value = new XTMPaletteFile(paletteName, new List<Color32> { Color.white });
                if (!m_palettes.ContainsKey(value.Guid))
                {
                    m_palettes[value.Guid] = value;
                }
            }
        }

        internal Guid GetChecksum(Guid paletteValue)
        {
            if (m_palettes.ContainsKey(paletteValue))
            {
                XTMPaletteFile palette = m_palettes[paletteValue];
                return palette.Checksum;
            }
            return default;
        }
    }

    public struct XTMPaletteSettedUpInformation : IComponentData, IQueryTypeParameter, ISerializable
    {
        public Guid paletteGuid;
        public Guid paletteChecksum;
        public int lineNumberRef;
        public bool paletteEnabled;

        const uint CURRENT_VERSION = 0;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(paletteEnabled);
            writer.Write(lineNumberRef);
            writer.Write(paletteGuid.ToString());
            writer.Write(paletteChecksum.ToString());
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMPaletteSettedUpInformation!");
            }
            reader.Read(out paletteEnabled);
            reader.Read(out lineNumberRef);
            reader.Read(out string guidPalette);
            reader.Read(out string checksumPalette);
            paletteGuid = new Guid(guidPalette);
            paletteChecksum = new Guid(checksumPalette);
        }
    }
    public struct XTMPaletteRequireUpdate : IComponentData, IQueryTypeParameter { }
    public struct XTMPaletteLockedColor : IComponentData, IQueryTypeParameter, IEmptySerializable { }

}

