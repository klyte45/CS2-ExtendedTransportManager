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
        public float usage00_04 { get; }
        public float usage04_08 { get; }
        public float usage08_12 { get; }
        public float usage12_16 { get; }
        public float usage16_20 { get; }
        public float usage20_00 { get; }
        public bool usage00_04_stale { get; }
        public bool usage04_08_stale { get; }
        public bool usage08_12_stale { get; }
        public bool usage12_16_stale { get; }
        public bool usage16_20_stale { get; }
        public bool usage20_00_stale { get; }

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
            if (src.linesConnected.IsCreated)
            {
                connectedLines = new LineStopConnnection[src.linesConnected.Count];
                var enumerator = src.linesConnected.GetEnumerator();
                int i = 0;
                while (enumerator.MoveNext())
                {
                    connectedLines[i++] = enumerator.Current;
                }
                src.linesConnected.Dispose();
            }
            else
            {
                connectedLines = [];
            }
            worldPosition = new(src.worldPosition);
            azimuth = src.rotation.eulerAngles.y;
            usage00_04 = src.usage00_04;
            usage04_08 = src.usage04_08;
            usage08_12 = src.usage08_12;
            usage12_16 = src.usage12_16;
            usage16_20 = src.usage16_20;
            usage20_00 = src.usage20_00;
            usage00_04_stale = src.usage00_04_stale;
            usage04_08_stale = src.usage04_08_stale;
            usage08_12_stale = src.usage08_12_stale;
            usage12_16_stale = src.usage12_16_stale;
            usage16_20_stale = src.usage16_20_stale;
            usage20_00_stale = src.usage20_00_stale;

            static Entity TryGetByBorderDistrict(EntityManager em, Entity attachParent) => em.TryGetComponent<BorderDistrict>(attachParent, out var borders)
                                        ? borders.m_Left != Entity.Null
                                            ? borders.m_Left : borders.m_Right
                                        : Entity.Null;
        }
    }
}
