using Belzont.Utils;
using Colossal;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Serialization;
using UnityEngine;

namespace BelzontTLM.Palettes
{
    public class XTMPaletteFile
    {
        public const char ENTRY_SEPARATOR = '\n';
        public const string EXT_PALETTE = ".hex";

        public string Name { get; set; }
        public List<string> ColorsRGB => Colors.Select(x => x.ToRGB(true)).ToList();
        public string GuidString => Guid.ToString();
        public string ChecksumString => Checksum.ToString();

        internal Guid Guid { get; private set; } = Guid.NewGuid();
        internal int Count => Colors.Count;
        internal List<Color32> Colors { get; }
        internal Guid Checksum { get; private set; }

        public void Add()
        {
            Colors.Add(Color.white);
            RecalculateChecksum();
        }

        private void RecalculateChecksum()
        {
            Checksum = GuidUtils.Create(default, Colors.SelectMany(x => new byte[] { x.r, x.g, x.b }).ToArray());
        }

        public void RemoveColor(int index)
        {
            if (Count > 1)
            {
                if (index % Colors.Count == 0)
                {
                    Colors[0] = Colors[^1];
                    Colors.RemoveAt(Colors.Count - 1);
                }
                else
                {
                    Colors.RemoveAt(index % Colors.Count);
                }
            }
            RecalculateChecksum();
        }

        public XTMPaletteFile(string name, IEnumerable<Color32> colors, bool fixedGuid = false)
        {
            Name = name;
            Colors = new List<Color32>(colors);
            RecalculateChecksum();
            if (fixedGuid)
            {
                Guid = GuidUtils.Create(Checksum, name);
            }
        }

        public string ToFileContent() => string.Join(ENTRY_SEPARATOR.ToString(), Colors.Select(x => x.ToRGB()).ToArray());

        public static XTMPaletteFile FromFileContent(string name, string[] fileContentLines)
        {
            var colors = fileContentLines.Select(x => ColorExtensions.FromRGB(x, x.StartsWith("#")));
            return new XTMPaletteFile(name, colors);
        }

        public void Save() => File.WriteAllText(Path.Combine(ExtendedTransportManagerMod.Instance.PalettesFolder, $"{Name}{EXT_PALETTE}"), ToFileContent());

        public XTMPaletteFileXML ToXML()
        {
            return new XTMPaletteFileXML()
            {
                Guid = Guid,
                Name = Name,
                Colors = ColorsRGB
            };
        }

        public static XTMPaletteFile FromXML(XTMPaletteFileXML xml)
        {
            return new XTMPaletteFile(xml.Name, (xml.Colors.Select(x => ColorExtensions.FromRGB(x, true)).ToList()))
            {
                Guid = xml.Guid,
            };
        }
    }

    [XmlRoot("XTMPaletteFileXML")]
    public class XTMPaletteFileXML
    {
        public Guid Guid { get; set; }
        public List<string> Colors { get; set; }
        public string Name { get; set; }
    }

}

