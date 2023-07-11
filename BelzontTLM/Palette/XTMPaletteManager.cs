using Belzont.Utils;
using Colossal;
using Colossal.OdinSerializer.Utilities;
using Colossal.Serialization.Entities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
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
        private bool isDirty;
        public readonly XTMPaletteFile[] defaultPaletteArray = new XTMPaletteFile[] {
                    new XTMPaletteFile("BRA/São Paulo 2035",XTMPresetPalettes. SaoPaulo2035,true),
                    new XTMPaletteFile("UK/London 2016", XTMPresetPalettes.London2016,true),
                    new XTMPaletteFile("Generic/Rainbow",XTMPresetPalettes. Rainbow,true),
                    new XTMPaletteFile("Generic/Rainbow Short", XTMPresetPalettes.RainbowShort,true),
                    new XTMPaletteFile("Generic/World Metro Mix", XTMPresetPalettes.WorldMix,true),
                    new XTMPaletteFile("Generic/MS Metro UI", XTMPresetPalettes.MSMetroUI,true),
                    new XTMPaletteFile("Generic/Material Color (100)", XTMPresetPalettes.MatColor100,true),
                    new XTMPaletteFile("Generic/Material Color (500)", XTMPresetPalettes.MatColor500,true),
                    new XTMPaletteFile("Generic/Material Color (900)", XTMPresetPalettes.MatColor900,true),
                    new XTMPaletteFile("Generic/Material Color (A200)", XTMPresetPalettes.MatColorA200,true),
                    new XTMPaletteFile("Generic/Material Color (A400)", XTMPresetPalettes.MatColorA400,true),
                    new XTMPaletteFile("Generic/Material Color (A700)", XTMPresetPalettes.MatColorA700,true),
                    new XTMPaletteFile("BRA/São Paulo CPTM 2000", XTMPresetPalettes.CPTM_SP_2000,true),
                    new XTMPaletteFile("BRA/São Paulo City Bus Area 2000", XTMPresetPalettes.SP_BUS_2000,true),
                    new XTMPaletteFile("USA/1972 New York Subway", XTMPresetPalettes.NYC_SUBWAY_1972,true),
                    new XTMPaletteFile("USA/1979 New York Subway", XTMPresetPalettes.NYC_SUBWAY_1979,true),
                    new XTMPaletteFile("USA/Official Modern NYC Subway", XTMPresetPalettes.NYC_SUBWAY_MODERN_OFFICIAL,true),
                    new XTMPaletteFile("USA/BART Modern", XTMPresetPalettes.SF_BART_MODERN,true),
                    new XTMPaletteFile("USA/2012 Vignelli Modern NYC Subway", XTMPresetPalettes.NYC_SUBWAY_MODERN_VIGNELLI_2012,true),
                };

        public string[] PaletteList => new string[] { null }.Union(m_palettes.Values.Select(x => x.Name)).OrderBy(x => x).ToArray();

        public XTMPaletteFile[] FullLibrary => m_palettes.Values.Concat(defaultPaletteArray).ToArray();
        public XTMPaletteFile[] EditableLibrary => m_palettes.Values.ToArray();

        private XTMPaletteManager()
        {
            LogUtils.DoLog("XTMPaletteFiles init()");
            Reload();
            isDirty = true;
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
            foreach (var filename in Directory.GetFiles(ExtendedTransportManagerMod.Instance.PalettesFolder, "*" + XTMPaletteFile.EXT_PALETTE).Select(x => x.Split(Path.DirectorySeparatorChar).Last()))
            {
                string fileContents = File.ReadAllText(ExtendedTransportManagerMod.Instance.PalettesFolder + Path.DirectorySeparatorChar + filename, Encoding.UTF8);
                var name = filename[..^XTMPaletteFile.EXT_PALETTE.Length];
                var value = XTMPaletteFile.FromFileContent(name, fileContents.Split(XTMPaletteFile.ENTRY_SEPARATOR).Select(x => x?.Trim()).Where(x => !string.IsNullOrEmpty(x)).ToArray());

                m_palettes[value.Guid] = value;
                LogUtils.DoLog("LOADED PALETTE ({0}) QTT: {1}", filename, m_palettes[value.Guid].Count);
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

        internal bool RequireLinesColorsReprocess() => isDirty;
        internal void OnLinesColorsReprocessed() => isDirty = false;
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

