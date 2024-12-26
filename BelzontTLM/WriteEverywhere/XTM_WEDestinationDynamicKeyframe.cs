using Belzont.Utils;
using Colossal.Serialization.Entities;
using Game.UI;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public struct XTM_WEDestinationDynamicKeyframe : IXTM_WEDestinationData, ISerializable
    {
        private const uint CURRENT_VERSION = 0;
        public Entity targetEntity;
        public FixedString32Bytes prefix;
        public FixedString32Bytes suffix;
        public XTM_WEDestinationKeyframeType type;
        public ushort framesLength;
        readonly XTM_WEDestinationKeyframeType IXTM_WEDestinationData.Type => type;
        readonly Entity IXTM_WEDestinationData.TargetEntity => targetEntity;
        readonly FixedString32Bytes IXTM_WEDestinationData.Prefix => prefix;
        readonly FixedString32Bytes IXTM_WEDestinationData.Suffix => suffix;

        public readonly void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(type);
            writer.Write(targetEntity);
            writer.Write(prefix);
            writer.Write(suffix);
            writer.Write(framesLength);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.CheckVersionK45(CURRENT_VERSION, GetType());
            reader.Read(out type);
            reader.Read(out targetEntity);
            reader.Read(out prefix);
            reader.Read(out suffix);
            reader.Read(out framesLength);
        }
            }
}
