using Colossal.Serialization.Entities;
using System;
using Unity.Entities;

namespace BelzontTLM
{
    /// <summary>
    /// Main fare-group settings on a custom fare-group entity. Presence of this component identifies a fare group.
    /// </summary>
    public struct XTMFareGroup : IComponentData, IQueryTypeParameter, ISerializable
    {
        const uint CURRENT_VERSION = 0;

        public float m_defaultFare;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(m_defaultFare);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMFareGroup!");
            }
            reader.Read(out m_defaultFare);
        }
    }

    /// <summary>
    /// Ordered hour exception ranges on a fare-group entity. First matching range wins; no overnight wrap.
    /// </summary>
    [InternalBufferCapacity(2)]
    public struct XTMFareGroupHourException : IBufferElementData, ISerializable
    {
        const uint CURRENT_VERSION = 0;

        public byte m_startingHour;
        public byte m_endingHour;
        public float m_fareValue;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(m_startingHour);
            writer.Write(m_endingHour);
            writer.Write(m_fareValue);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMFareGroupHourException!");
            }
            reader.Read(out m_startingHour);
            reader.Read(out m_endingHour);
            reader.Read(out m_fareValue);
        }

        public bool ContainsHour(int hour) => hour >= m_startingHour && hour <= m_endingHour;
    }

    /// <summary>
    /// Line membership in a fare group plus last fare value written by this mod.
    /// </summary>
    public struct XTMFareLineAssociation : IComponentData, IQueryTypeParameter, ISerializable
    {
        const uint CURRENT_VERSION = 0;

        public Entity m_fareGroup;
        public float m_lastAdjustment;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(m_fareGroup);
            writer.Write(m_lastAdjustment);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMFareLineAssociation!");
            }
            reader.Read(out m_fareGroup);
            reader.Read(out m_lastAdjustment);
        }
    }

    /// <summary>Transient conflict count; not serialized.</summary>
    public struct XTMFareConflictCounter : IComponentData, IQueryTypeParameter
    {
        public const int PersistThreshold = 16;
        public int m_count;
    }

    /// <summary>Line ignored by fare apply/conflict after too many external conflicts. Not serialized.</summary>
    public struct XTMFarePersistingConflict : IComponentData, IQueryTypeParameter { }

    /// <summary>Serializable dirty tag on a fare-group entity.</summary>
    public struct XTMFareGroupDirty : IComponentData, IQueryTypeParameter, IEmptySerializable { }

    /// <summary>Serializable dirty tag on a line entity.</summary>
    public struct XTMFareLineDirty : IComponentData, IQueryTypeParameter, IEmptySerializable { }
}
