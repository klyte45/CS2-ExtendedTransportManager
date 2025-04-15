using Belzont.Utils;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace BelzontTLM.Palettes
{
    internal static class XTMPresetPalettes
    {
        public static readonly List<Color32> SaoPaulo1960 = "023469#0c5426#b30801#b27e04#0f6bce#528c40#f2600a#f9e507".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> SaoPaulo2035 = "000DA0#00801B#FA0000#FFD503#A54399#F47321#9F1866#9E9E94#00A88E#047C8C#F04E23#042B6A#00AC5C#1E1E1E#B4B2B1#FFFFFF#F59E37#A78B6B#0095DA#FC7CA1#5F2C8F#5C3A0E#000000#646464#CABBA8#0000FF#D02DFF#00FF00#FFFCBA#750000".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> London2016 = "DC241F#E1CE00#007229#D799AF#868F98#751056#000000#0019A8#00A0E2#76D0BD#66CC00#E86A10#894E24".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> Rainbow = "240CF3#3849F5#559CF6#6FE9B3#5DC961#50AA28#51A419#73C31D#98DC1F#F9FE29#E9DE24#E3C221#DBA120#CA601A#C03118#BD0317#85001C#49013F#2C045E#190CF3".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> RainbowShort = "8200DC#1E3CFF#00A0FF#00C8C8#00D28C#00DC00#A0E632#E6DC32#E6AF2D#F08228#FA3C3C#F00082#A000C8".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> WorldMix = "E6194B#3CB44B#FFE119#0082C8#F58230#911EB4#46F0F0#F032E6#D2F53C#FABEBE#008080#E6BEFF#AA6E28#FFFAC8#800000#AAFFC3#808000#FFD7B4#000080#808080#FFFFFF#000000".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MSMetroUI = "A200FF#1BA1E2#8CBF26#E51400#FF0097#E671B8#A05000#00ABA9#F09609#339933".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MSWin95 = "000000#800000#008000#808000#000080#800080#008080#c0c0c0#808080#ff0000#00ff00#ffff00#0000ff#ff00ff#00ffff#ffffff".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MSWin95_20 = "000000#800000#008000#808000#000080#800080#008080#c0c0c0#c0dcc0#a6caf0#fffbf0#a0a0a4#808080#ff0000#00ff00#ffff00#0000ff#ff00ff#00ffff#ffffff".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> AppleMacintosh = "ffffff#fcf404#ff6404#dc0808#f00884#4800a4#0000d4#00ace8#20b814#006410#582c04#907038#c0c0c0#808080#404040#000000".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MatColor100 = "ffcdd2#f8bbd0#e1bee7#d1c4e9#c5cae9#bbdefb#b3e5fc#b2ebf2#b2dfdb#c8e6c9#dcedc8#f0f4c3#fff9c4#ffecb3#ffe0b2#ffccbc#d7ccc8#f5f5f5#cfd8dc#cfd8dc".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MatColor500 = "f44336#e91e63#9c27b0#673ab7#3f51b5#2196f3#03a9f4#00bcd4#009688#4caf50#8bc34a#cddc39#ffeb3b#ffc107#ff9800#ff5722#795548#9e9e9e#607d8b#607d8b".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MatColor900 = "b71c1c#880e4f#4a148c#311b92#1a237e#0d47a1#01579b#006064#004d40#1b5e20#33691e#827717#f57f17#ff6f00#e65100#bf360c#3e2723#212121#263238#263238".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MatColorA200 = "ff5252#ff4081#e040fb#7c4dff#536dfe#448aff#40c4ff#18ffff#64ffda#69f0ae#b2ff59#eeff41#ffff00#ffd740#ffab40#ff6e40".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MatColorA400 = "ff1744#f50057#d500f9#651fff#3d5afe#2979ff#00b0ff#00e5ff#1de9b6#00e676#76ff03#c6ff00#ffea00#ffc400#ff9100#ff3d00".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> MatColorA700 = "d50000#c51162#aa00ff#6200ea#304ffe#2962ff#0091ea#00b8d4#00bfa5#00c853#64dd17#aeea00#ffd600#ffab00#ff6d00#dd2c00".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> CPTM_SP_2000 = "7C614E#969A99#4D8CD3#D4B888#DE8E05#43277B#9A367C#03AA57#0E0E0E#5D2F91".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> SP_BUS_2000 = "05E11F#004D85#FFF500#DA251C#007364#0072B8#9F2C29#E57718#C8C8C8".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> NYC_SUBWAY_1972 = "F26422#E71D2F#00ADC6#D63493#3D332B#E9AF21#2172B9#1BB35F".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> NYC_SUBWAY_1979 = "E71D2F#1BB35F#AC459A#2172B9#F26422#E9AF21#7EBB42#985B25#919693#3D332B#00ADC6".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> NYC_SUBWAY_MODERN_OFFICIAL = "EE352E#00933C#B933AD#0039A6#FF6319#FCCC0A#6CBE45#996633#A7A9AC#808183".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> NYC_SUBWAY_MODERN_VIGNELLI_2012 = "F15A22#06B14B#BD60A5#1C9AD6#F99D1C#FFCB05#B2D235#B97C0F#999999#939598".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> SF_BART_MODERN = "ED1C24#FAA61A#FFE600#50B848#00A6E9#903F98#20BEC6#E1058C#838E95".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> CHICAGO_CTA = "c60c30#00a1de#62361b#009b3a#f9461c#e27ea6#522398#f9e300".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> WDC_METRO = "BF0D3E#ED8B00#009CDE#00B140#FFD100#919D9D#002F6C#C8102E".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> LA_METRO = "0072BC#EB131B#58A738#A05DA5#FDB913#E470AB#FC4C02#ADB8BF#D11242#E16710".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> BOSTON_MBTA = "00843d#da291c#ed8b00#003da5#7c878e#ffc72c#82076c#008eaa#59bec9".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> IBM_ACCESSIBLE = "648fff#785ef0#dc267f#fe6100#ffb000".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> WONG_ACCESSIBLE = "e69f00#56b4e9#009e73#f0e442#0072b2#d55e00#cc79a7#000000".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
        public static readonly List<Color32> TOL_VIBRANT_ACCESSIBLE = "0077BB#33BBEE#009988#EE7733#CC3311#EE3377#BBBBBB".Split("#").Select(x => ColorExtensions.FromRGB(x)).ToList();
    }

}

