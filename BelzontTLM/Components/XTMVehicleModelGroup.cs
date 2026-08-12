using Colossal.Serialization.Entities;
using Game.Prefabs;
using System;
using Unity.Entities;

namespace BelzontTLM
{
    /// <summary>
    /// Vehicle-model group settings. Presence of this component identifies a vehicle-model group.
    /// Desired selection lives in a <see cref="Game.Routes.VehicleModel"/> buffer on the same entity.
    /// Transport type and cargo flag are fixed at create.
    /// </summary>
    public struct XTMVehicleModelGroup : IComponentData, IQueryTypeParameter, ISerializable
    {
        const uint CURRENT_VERSION = 0;

        public TransportType m_transportType;
        public bool m_isCargo;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write((sbyte)m_transportType);
            writer.Write(m_isCargo);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMVehicleModelGroup!");
            }
            reader.Read(out sbyte transportType);
            reader.Read(out m_isCargo);
            m_transportType = (TransportType)transportType;
        }
    }

    /// <summary>
    /// Line membership in a vehicle-model group. Desired models live on the group entity.
    /// </summary>
    public struct XTMVehicleModelLineAssociation : IComponentData, IQueryTypeParameter, ISerializable
    {
        const uint CURRENT_VERSION = 0;

        public Entity m_group;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(m_group);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMVehicleModelLineAssociation!");
            }
            reader.Read(out m_group);
        }
    }

    /// <summary>Transient conflict count; not serialized.</summary>
    public struct XTMVehicleModelConflictCounter : IComponentData, IQueryTypeParameter
    {
        public const int PersistThreshold = 16;
        public int m_count;
    }

    /// <summary>Line ignored by apply/conflict after too many external conflicts. Not serialized.</summary>
    public struct XTMVehicleModelPersistingConflict : IComponentData, IQueryTypeParameter { }

    /// <summary>Serializable dirty tag on a vehicle-model group entity.</summary>
    public struct XTMVehicleModelGroupDirty : IComponentData, IQueryTypeParameter, IEmptySerializable { }

    /// <summary>Serializable dirty tag on a line entity.</summary>
    public struct XTMVehicleModelLineDirty : IComponentData, IQueryTypeParameter, IEmptySerializable { }
}
