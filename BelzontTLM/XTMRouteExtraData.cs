using Colossal.Serialization.Entities;
using Colossal.UI.Binding;
using System;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{

    public struct XTMRouteExtraData : IComponentData, IQueryTypeParameter, ISerializable, IJsonWritable
    {
        const uint CURRENT_VERSION = 0;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(m_acronym.ToString());
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMRouteExtraData!");
            }
            reader.Read(out string value);
            m_acronym = new(value);
        }

        public void Write(IJsonWriter writer)
        {
            writer.TypeBegin(GetType().FullName);
            writer.PropertyName("acronym");
            writer.Write(m_acronym.ToString());
            writer.TypeEnd();
        }

        private FixedString32Bytes m_acronym;
        public string Acronym => m_acronym.ToString();

        public void SetAcronym(string acronym)
        {
            m_acronym = new(acronym);
        }
    }
}
