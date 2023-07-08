using Belzont.Utils;
using Colossal;
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

        public Guid Guid
        {
            get; private set;
        }

        public int Count => Colors.Count;

        public List<Color32> Colors { get; }
        public Guid Checksum { get; private set; }

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

        public Color32 this[int key]
        {
            get => Colors[key];
            set
            {
                if ((Color)value == default)
                {
                    Colors.RemoveAt(key);
                }
                else
                {
                    Colors[key] = value;
                }
                RecalculateChecksum();
            }
        }

        public string ToFileContent() => string.Join(ENTRY_SEPARATOR.ToString(), Colors.Select(x => x.ToRGB()).ToArray());

        public static XTMPaletteFile FromFileContent(string name, string[] fileContentLines)
        {
            var colors = fileContentLines.Select(x => ColorExtensions.FromRGB(x));
            return new XTMPaletteFile(name, colors);
        }

        public void Save() => File.WriteAllText(Path.Combine(ExtendedTransportManagerMod.Instance.PalettesFolder, $"{Name}{EXT_PALETTE}"), ToFileContent());

    }

}

