using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Serialization.Entities;
using Colossal.UI.Binding;
using Game;
using MonoMod.Utils;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BelzontTLM.Palettes
{
    public class XTMPaletteSystem : GameSystemBase, IBelzontBindable, ISerializable
    {
        #region Serialization
        public const int CURRENT_VERSION = 0;

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMPaletteSystem!");
            }
            reader.Read(out string paletteListXML);
            reader.Read(out string paletteSettingsPassenger);
            reader.Read(out string paletteSettingsCargo);
            try
            {
                var palettes = XmlUtils.DefaultXmlDeserialize<List<XTMPaletteFileXML>>(paletteListXML);
                CityPalettes.Clear();
                CityPalettes.AddRange(palettes.ToDictionary(x => x.Guid, x => XTMPaletteFile.FromXML(x)));
            }
            catch (Exception e)
            {
                LogUtils.DoWarnLog($"XTMPaletteSystem: Could not load palettes for the City!!!\n{e}");
            }
        }

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            LogUtils.DoLog("Serializing XTMPaletteSystem");
            writer.Write(CURRENT_VERSION);
            writer.Write(XmlUtils.DefaultXmlSerialize(CityPalettes.Values.Select(x => x.ToXML()).ToList()));
        }
        #endregion

        #region UI Bindings
        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller.Invoke("palettes.listCityPalettes", ListCityPalettes);
            eventCaller.Invoke("palettes.listLibraryPalettes", ListLibraryPalettes);
        }

        private Action<string, object[]> eventCaller;
        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            this.eventCaller = eventCaller;
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupRawBindings(Func<string, Action<IJsonWriter>, RawValueBinding> eventBinder)
        {
        }
        #endregion

        protected override void OnUpdate()
        {

        }
        private readonly Dictionary<Guid, XTMPaletteFile> CityPalettes = new();
        private List<XTMPaletteFile> ListCityPalettes() => CityPalettes.Values.ToList();
        private List<XTMPaletteFile> ListLibraryPalettes() => XTMPaletteManager.Instance.FullLibrary.ToList();
    }
}

