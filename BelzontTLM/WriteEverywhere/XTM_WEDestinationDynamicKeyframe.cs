using Belzont.Utils;
using Colossal.OdinSerializer.Utilities;
using Colossal.Serialization.Entities;
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

        public struct UIData
        {
            public Entity targetEntity;
            public string prefix;
            public string suffix;
            public XTM_WEDestinationKeyframeType type;
            public ushort framesLength;

            public readonly XTM_WEDestinationDynamicKeyframe ToComponent()
                => new()
                {
                    targetEntity = targetEntity,
                    prefix = prefix ?? "",
                    suffix = suffix ?? "",
                    type = type,
                    framesLength = framesLength,

                };

            public readonly bool IsValid()
                => framesLength > 0 && type switch
                {
                    XTM_WEDestinationKeyframeType.RouteName => true,
                    XTM_WEDestinationKeyframeType.EntityName => targetEntity != Entity.Null,
                    XTM_WEDestinationKeyframeType.RouteNumber => true,
                    XTM_WEDestinationKeyframeType.FixedString => !prefix.IsNullOrWhitespace(),
                    _ => false
                };
        }

        public readonly UIData ToUI()
            => new()
            {
                targetEntity = targetEntity,
                prefix = prefix.ToString(),
                suffix = suffix.ToString(),
                type = type,
                framesLength = framesLength
            };

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
