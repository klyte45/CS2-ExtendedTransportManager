using Belzont.Utils;
using Colossal;
using Colossal.OdinSerializer.Utilities;
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
                    new XTMPaletteFile("São Paulo 2035",XTMPresetPalettes. SaoPaulo2035),
                    new XTMPaletteFile("London 2016", XTMPresetPalettes.London2016),
                    new XTMPaletteFile("Rainbow",XTMPresetPalettes. Rainbow),
                    new XTMPaletteFile("Rainbow Short", XTMPresetPalettes.RainbowShort),
                    new XTMPaletteFile("World Metro Mix", XTMPresetPalettes.WorldMix),
                    new XTMPaletteFile("MS Metro UI", XTMPresetPalettes.MSMetroUI),
                    new XTMPaletteFile("Material Color (100)", XTMPresetPalettes.MatColor100),
                    new XTMPaletteFile("Material Color (500)", XTMPresetPalettes.MatColor500),
                    new XTMPaletteFile("Material Color (900)", XTMPresetPalettes.MatColor900),
                    new XTMPaletteFile("Material Color (A200)", XTMPresetPalettes.MatColorA200),
                    new XTMPaletteFile("Material Color (A400)", XTMPresetPalettes.MatColorA400),
                    new XTMPaletteFile("Material Color (A700)", XTMPresetPalettes.MatColorA700),
                    new XTMPaletteFile("São Paulo CPTM 2000", XTMPresetPalettes.CPTM_SP_2000),
                    new XTMPaletteFile("São Paulo Bus Area 2000", XTMPresetPalettes.SP_BUS_2000),
                };

        public string[] PaletteList => new string[] { null }.Union(m_palettes.Values.Select(x => x.Name)).OrderBy(x => x).ToArray();

        public string[] PaletteListForEditing => m_palettes.Values.Select(x => x.Name).OrderBy(x => x).ToArray();

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

            foreach (var palette in defaultPaletteArray)
            {
                if (!m_palettes.ContainsKey(palette.Guid))
                {
                    m_palettes[palette.Guid] = palette;
                    Save(palette.Guid);
                }
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
                        return palette[number % palette.Count];
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

    public struct XTMPaletteSettedUpInformation : IComponentData, IQueryTypeParameter
    {
        public Guid paletteGuid;
        public Guid paletteChecksum;
        public int lineNumberRef;
        public bool paletteEnabled;
    }
    public struct XTMPaletteRequireUpdate : IComponentData, IQueryTypeParameter { }
    public struct XTMPaletteLockedColor : IComponentData, IQueryTypeParameter { }

}

