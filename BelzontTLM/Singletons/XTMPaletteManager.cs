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

        /// <summary>Embedded library presets (lazy-loaded from Resources/Palettes/**/*.hex).</summary>
        public static XTMPaletteFile[] defaultPaletteArray => XTMPresetPaletteLoader.LoadAll();
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
