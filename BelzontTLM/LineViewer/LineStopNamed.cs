using Belzont.Utils;
using Colossal.Entities;
using Game.Areas;
using Game.Buildings;
using Game.Common;
using Game.Objects;
using Game.UI;
using Unity.Entities;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public class LineStopNamed
    {
        public Entity entity { get; }
        public Entity waypoint { get; }
        public float position { get; }
        public int cargo { get; }
        public bool isCargo { get; }
        public bool isOutsideConnection { get; }
        public ValuableName name { get; }
        public Entity parent { get; }
        public ValuableName parentName { get; }
        public Entity district { get; }
        public ValuableName districtName { get; }
        public LineStopConnnection[] connectedLines { get; }
        public Vector3Json worldPosition { get; }
        public float azimuth { get; }

        public LineStopNamed(LineStop src, NameSystem nameSystem, EntityManager em)
        {
            waypoint = src.waypoint;
            entity = src.entity;
            position = src.position;
            cargo = src.cargo;
            isOutsideConnection = src.isOutsideConnection;
            isCargo = src.isCargo;
            name = nameSystem.GetName(src.entity).ToValueableName();
            parent = em.TryGetComponent<Owner>(src.entity, out var owner) ? owner.m_Owner : Entity.Null;
            while (em.TryGetComponent<Owner>(parent, out var ownerParent))
            {
                parent = ownerParent.m_Owner;
            }
            parentName = parent != Entity.Null ? nameSystem.GetName(parent).ToValueableName() : default;
            district = parent != Entity.Null
                                ? em.TryGetComponent<CurrentDistrict>(parent, out var currentDistrict) ? currentDistrict.m_District : Entity.Null
                                : em.TryGetComponent<Attached>(entity, out var attachParent)
                                    ? TryGetByBorderDistrict(em, attachParent.m_Parent)
                                    : em.TryGetComponent<Building>(entity, out var building)
                                        ? TryGetByBorderDistrict(em, building.m_RoadEdge)
                                        : Entity.Null;
            districtName = district != Entity.Null ? nameSystem.GetName(district).ToValueableName() : default;
            connectedLines = new LineStopConnnection[src.linesConnected.Count];
            var enumerator = src.linesConnected.GetEnumerator();
            int i = 0;
            while (enumerator.MoveNext())
            {
                connectedLines[i++] = enumerator.Current;
            }
            worldPosition = new(src.worldPosition);
            azimuth = src.rotation.eulerAngles.y;

            static Entity TryGetByBorderDistrict(EntityManager em, Entity attachParent) => em.TryGetComponent<BorderDistrict>(attachParent, out var borders)
                                        ? borders.m_Left != Entity.Null
                                            ? borders.m_Left : borders.m_Right
                                        : Entity.Null;
        }
    }
}
