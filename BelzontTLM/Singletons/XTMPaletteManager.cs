using Belzont.Utils;
using Colossal;
using Colossal.Serialization.Entities;
using System;
using Unity.Entities;

namespace BelzontTLM.Palettes
{
    public static class XTMPaletteManager
    {

        public static readonly Guid GUID_NAMESPACE = GuidUtils.Create(Guid.Empty, "XTM_Palettes");
        public static readonly Guid PALETTE_RANDOM = GuidUtils.Create(GUID_NAMESPACE, "");
        public const char SERIALIZER_ITEM_SEPARATOR = '∞';
        public static readonly XTMPaletteFile[] defaultPaletteArray = new XTMPaletteFile[] {
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
            reader.CheckVersionK45(CURRENT_VERSION, GetType());
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

