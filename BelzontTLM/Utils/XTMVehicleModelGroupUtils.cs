using Colossal.Entities;
using Game.Prefabs;
using Game.Routes;
using Unity.Entities;

namespace BelzontTLM
{
    public static class XTMVehicleModelGroupUtils
    {
        public static bool IsValidVehicleModelGroup(EntityManager em, Entity group)
        {
            return group != Entity.Null && em.Exists(group) && em.HasComponent<XTMVehicleModelGroup>(group);
        }

        public static bool HasAtLeastOneValidModel(EntityManager em, Entity group)
        {
            if (!IsValidVehicleModelGroup(em, group) || !em.HasBuffer<VehicleModel>(group))
            {
                return false;
            }

            XTMVehicleModelGroup settings = em.GetComponentData<XTMVehicleModelGroup>(group);
            DynamicBuffer<VehicleModel> models = em.GetBuffer<VehicleModel>(group, true);
            for (int i = 0; i < models.Length; i++)
            {
                VehicleModel model = models[i];
                if (IsCompatibleVehiclePrefab(em, model.m_PrimaryPrefab, settings.m_transportType, settings.m_isCargo, isSecondary: false)
                    || IsCompatibleVehiclePrefab(em, model.m_SecondaryPrefab, settings.m_transportType, settings.m_isCargo, isSecondary: true))
                {
                    return true;
                }
            }
            return false;
        }

        public static bool BuffersEqualExactOrder(DynamicBuffer<VehicleModel> a, DynamicBuffer<VehicleModel> b)
        {
            if (a.Length != b.Length)
            {
                return false;
            }
            for (int i = 0; i < a.Length; i++)
            {
                if (a[i].m_PrimaryPrefab != b[i].m_PrimaryPrefab
                    || a[i].m_SecondaryPrefab != b[i].m_SecondaryPrefab)
                {
                    return false;
                }
            }
            return true;
        }

        public static bool LineMatchesGroup(EntityManager em, Entity line, XTMVehicleModelGroup group)
        {
            if (line == Entity.Null || !em.Exists(line)
                || !em.HasComponent<TransportLine>(line)
                || !em.HasBuffer<VehicleModel>(line)
                || !em.TryGetComponent(line, out PrefabRef prefabRef)
                || !em.TryGetComponent(prefabRef.m_Prefab, out TransportLineData lineData))
            {
                return false;
            }
            if (lineData.m_TransportType != group.m_transportType)
            {
                return false;
            }
            return lineData.m_CargoTransport == group.m_isCargo;
        }

        public static bool IsPrefabAlive(EntityManager em, Entity prefab)
        {
            if (prefab == Entity.Null || !em.Exists(prefab) || !em.HasComponent<PrefabData>(prefab))
            {
                return false;
            }
            if (em.HasComponent<Locked>(prefab) && em.HasEnabledComponent<Locked>(prefab))
            {
                return false;
            }
            return true;
        }

        public static bool IsCompatibleVehiclePrefab(
            EntityManager em,
            Entity prefab,
            TransportType transportType,
            bool isCargo,
            bool isSecondary)
        {
            if (!IsPrefabAlive(em, prefab))
            {
                return false;
            }

            if (isSecondary)
            {
                return SupportsSecondary(transportType) && em.HasComponent<TrainCarriageData>(prefab);
            }

            if (em.TryGetComponent(prefab, out PublicTransportVehicleData ptData))
            {
                if (ptData.m_TransportType != transportType)
                {
                    return false;
                }
                bool hasCargo = em.HasComponent<CargoTransportVehicleData>(prefab);
                return isCargo ? hasCargo : !hasCargo || (ptData.m_PurposeMask & PublicTransportPurpose.TransportLine) != 0;
            }

            if (em.HasComponent<TrainEngineData>(prefab) && SupportsSecondary(transportType))
            {
                bool hasCargo = em.HasComponent<CargoTransportVehicleData>(prefab);
                return isCargo == hasCargo;
            }

            return false;
        }

        public static bool SupportsSecondary(TransportType transportType)
        {
            return transportType == TransportType.Train
                || transportType == TransportType.Tram
                || transportType == TransportType.Subway;
        }

        /// <summary>
        /// Drops invalid prefabs from a group desired buffer and removes empty slots. Returns true if mutated.
        /// </summary>
        public static bool StripInvalidGroupModels(EntityManager em, Entity group)
        {
            if (!IsValidVehicleModelGroup(em, group) || !em.HasBuffer<VehicleModel>(group))
            {
                return false;
            }

            XTMVehicleModelGroup settings = em.GetComponentData<XTMVehicleModelGroup>(group);
            DynamicBuffer<VehicleModel> buffer = em.GetBuffer<VehicleModel>(group, false);
            bool changed = false;

            for (int i = buffer.Length - 1; i >= 0; i--)
            {
                VehicleModel model = buffer[i];
                Entity primary = model.m_PrimaryPrefab;
                Entity secondary = model.m_SecondaryPrefab;

                if (primary != Entity.Null
                    && !IsCompatibleVehiclePrefab(em, primary, settings.m_transportType, settings.m_isCargo, isSecondary: false))
                {
                    primary = Entity.Null;
                    changed = true;
                }
                if (secondary != Entity.Null
                    && !IsCompatibleVehiclePrefab(em, secondary, settings.m_transportType, settings.m_isCargo, isSecondary: true))
                {
                    secondary = Entity.Null;
                    changed = true;
                }

                if (primary == Entity.Null && secondary == Entity.Null)
                {
                    buffer.RemoveAt(i);
                    changed = true;
                    continue;
                }

                if (model.m_PrimaryPrefab != primary || model.m_SecondaryPrefab != secondary)
                {
                    buffer[i] = new VehicleModel
                    {
                        m_PrimaryPrefab = primary,
                        m_SecondaryPrefab = secondary
                    };
                }
            }

            return changed;
        }

        public static int CountValidModelEntries(EntityManager em, Entity group)
        {
            if (!IsValidVehicleModelGroup(em, group) || !em.HasBuffer<VehicleModel>(group))
            {
                return 0;
            }
            return em.GetBuffer<VehicleModel>(group, true).Length;
        }
    }
}
