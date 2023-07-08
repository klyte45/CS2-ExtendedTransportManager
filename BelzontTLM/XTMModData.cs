using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Palettes;
using Game.Prefabs;
using System;
using System.Linq;
using System.Xml.Serialization;

public class XTMModData : IBasicModData
{
    [XmlAttribute]
    public bool DebugMode { get; set; }

    [XmlElement]
    public SimpleEnumerableList<TransportType, Guid> PaletteSettingsPassenger = new()
    {
        [TransportType.Bus] = XTMPaletteManager.Instance.defaultPaletteArray.First(x => x.Name == "São Paulo 2035").Guid,
        [TransportType.Train] = XTMPaletteManager.Instance.defaultPaletteArray.First(x => x.Name == "São Paulo CPTM 2000").Guid,
        [TransportType.Tram] = XTMPaletteManager.Instance.defaultPaletteArray.First(x => x.Name == "World Metro Mix").Guid,
    };
    [XmlElement]
    public SimpleEnumerableList<TransportType, Guid> PaletteSettingsCargo = new();
}