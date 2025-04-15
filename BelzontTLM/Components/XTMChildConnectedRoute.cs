using Colossal.Serialization.Entities;
using System;
using Unity.Entities;

namespace BelzontTLM
{
    [InternalBufferCapacity(0)]
    public struct XTMChildConnectedRoute : IBufferElementData, IEquatable<XTMChildConnectedRoute>
    {
        public Entity m_StopEntity;

        public XTMChildConnectedRoute(Entity waypoint)
        {
            m_StopEntity = waypoint;
        }

        public bool Equals(XTMChildConnectedRoute other) => m_StopEntity.Equals(other.m_StopEntity);

        public override int GetHashCode() => m_StopEntity.GetHashCode();
    }
}
