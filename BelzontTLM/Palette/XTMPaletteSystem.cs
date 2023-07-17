using Belzont.Interfaces;
using Belzont.Serialization;
using Belzont.Utils;
using Colossal.Serialization.Entities;
using Colossal.UI.Binding;
using Game;
using MonoMod.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;
using Unity.Jobs;

namespace BelzontTLM.Palettes
{
    public class XTMPaletteSystem : GameSystemBase, IBelzontBindable, IBelzontSerializableSingleton<XTMPaletteSystem>
    {
        const int CURRENT_VERSION = 0;
        #region UI Bindings
        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller.Invoke("palettes.listCityPalettes", ListCityPalettes);
            eventCaller.Invoke("palettes.listLibraryPalettes", ListLibraryPalettes);
            eventCaller.Invoke("palettes.addPaletteToCity", AddCityPalette);
            eventCaller.Invoke("palettes.deleteFromCity", DeleteCityPalette);
            eventCaller.Invoke("palettes.updateForCity", UpdateCityPalette);
        }

        private Action<string, object[]> eventCaller;
        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            this.eventCaller = eventCaller;
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }
        #endregion
        protected override void OnUpdate()
        {

        }
        private readonly Dictionary<Guid, XTMPaletteFile> CityPalettes = new();

        internal XTMPaletteFile GetForGuid(Guid guid) => CityPalettes.TryGetValue(guid, out var value) ? value : null;
        private void OnCityPalettesChanged()
        {
            eventCaller.Invoke("palettes.onCityPalettesChanged", null);
            isDirty = true;
        }

        private List<XTMPaletteFile> ListCityPalettes() => CityPalettes.Values.ToList();
        private List<XTMPaletteFile> ListLibraryPalettes() => XTMPaletteManager.Instance.FullLibrary.ToList();

        private void AddCityPalette(string name, string[] colors)
        {
            var effectiveNewPalette = new XTMPaletteFile(name, colors.Select(x => ColorExtensions.FromRGB(x, true)));
            CityPalettes[effectiveNewPalette.Guid] = effectiveNewPalette;
            OnCityPalettesChanged();
        }

        private void DeleteCityPalette(string guid)
        {
            var parsedGuid = new Guid(guid);
            if (CityPalettes.ContainsKey(parsedGuid))
            {
                CityPalettes.Remove(parsedGuid);
                OnCityPalettesChanged();
            }
        }
        private void UpdateCityPalette(string guid, string name, string[] colors)
        {
            var targetGuid = new Guid(guid);
            if (CityPalettes.TryGetValue(targetGuid, out var palette))
            {
                palette.Name = name;
                palette.Colors.Clear();
                palette.Colors.AddRange(colors.Select(x => ColorExtensions.FromRGB(x, true)));
                OnCityPalettesChanged();
            }
            else
            {
                LogUtils.DoWarnLog($"Palette not found in the city! {guid}");
            }
        }

        #region Serialization

        private XTMPaletteSystemXML ToXml()
        {
            var xml = new XTMPaletteSystemXML
            {
                CityPalettes = CityPalettes.Values.Select(x => x.ToXML()).ToList()
            };
            return xml;
        }


        void IBelzontSerializableSingleton<XTMPaletteSystem>.Serialize<TWriter>(TWriter writer)
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(XmlUtils.DefaultXmlSerialize(ToXml()));
        }

        void IBelzontSerializableSingleton<XTMPaletteSystem>.Deserialize<TReader>(TReader reader)
        {
            reader.Read(out int version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMPaletteSystem!");
            }
            reader.Read(out string paletteData);
            var palettes = XmlUtils.DefaultXmlDeserialize<XTMPaletteSystemXML>(paletteData);
            CityPalettes.Clear();
            CityPalettes.AddRange(palettes.CityPalettes.ToDictionary(x => x.Guid, x => XTMPaletteFile.FromXML(x)));
            OnCityPalettesChanged();
        }

        JobHandle IJobSerializable.SetDefaults(Context context)
        {
            CityPalettes.Clear();
            OnCityPalettesChanged();
            return default;
        }

        private bool isDirty;
        internal bool RequireLinesColorsReprocess() => isDirty;

        internal void OnLinesColorsReprocessed() => isDirty = false;

        [XmlRoot("XtmPaletteSystem")]
        public class XTMPaletteSystemXML
        {
            public List<XTMPaletteFileXML> CityPalettes;
        }
        #endregion
    }
}

