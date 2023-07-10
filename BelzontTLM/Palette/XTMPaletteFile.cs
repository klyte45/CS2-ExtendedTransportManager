using Belzont.Utils;
using Colossal;
using Colossal.UI.Binding;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;

namespace BelzontTLM.Palettes
{
    public class XTMPaletteFile
    {
        public const char ENTRY_SEPARATOR = '\n';
        public const string EXT_PALETTE = ".xtmpal";
        private string name;

        public string Name
        {
            get => name;
            set
            {
                name = value;
                Guid = GuidUtils.Create(XTMPaletteManager.GUID_NAMESPACE, value);
            }
        }
        public List<string> ColorsRGB => Colors.Select(x => x.ToRGB(true)).ToList();
        public string GuidString => Guid.ToString();
        public string ChecksumString => Checksum.ToString();

        internal Guid Guid { get; private set; }
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

        public XTMPaletteFile(string name, IEnumerable<Color32> colors)
        {
            Name = name;
            Colors = new List<Color32>(colors);
            RecalculateChecksum();
        }

        public string ToFileContent() => string.Join(ENTRY_SEPARATOR.ToString(), Colors.Select(x => x.ToRGB()).ToArray());

        public static XTMPaletteFile FromFileContent(string name, string[] fileContentLines)
        {
            var colors = fileContentLines.Select(x => ColorExtensions.FromRGB(x));
            return new XTMPaletteFile(name, colors);
        }

        public void Save() => File.WriteAllText(Path.Combine(ExtendedTransportManagerMod.Instance.PalettesFolder, $"{Name}{EXT_PALETTE}"), ToFileContent());

        public void Write(IJsonWriter writer)
        {
            writer.PropertyName("guid");
            writer.Write(Guid.ToString());
            writer.PropertyName("name");
            writer.Write(name);
            writer.PropertyName("colors");
            writer.ArrayBegin(Colors.Count);
            foreach (var color in Colors)
            {
                writer.Write(color.ToRGB());
            }
            writer.ArrayEnd();
        }
    }

}

