using Game.Prefabs;
using Game.Vehicles;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;

namespace BelzontTLM
{
    /// <summary>
    /// Burst-safe passenger/cargo load and capacity calculation (mirrors LineDetailDataJob.GetCargo).
    /// </summary>
    public static class XTMVehicleLoadUtils
    {
        public struct Lookups
        {
            [ReadOnly] public ComponentLookup<PrefabRef> PrefabRefs;
            [ReadOnly] public ComponentLookup<Game.Creatures.Pet> Pets;
            [ReadOnly] public ComponentLookup<PublicTransportVehicleData> PublicTransportVehicleDatas;
            [ReadOnly] public ComponentLookup<CargoTransportVehicleData> CargoTransportVehicleDatas;
            [ReadOnly] public BufferLookup<LayoutElement> LayoutElements;
            [ReadOnly] public BufferLookup<Passenger> Passengers;
            [ReadOnly] public BufferLookup<Game.Economy.Resources> Resources;
        }

        /// <summary>
        /// Returns (load, capacity). Load is passenger count (excluding pets) or sum of cargo resource amounts.
        /// </summary>
        public static int2 GetLoadAndCapacity(Entity entity, in Lookups lookups)
        {
            int load = 0;
            int capacity = 0;
            if (!lookups.PrefabRefs.TryGetComponent(entity, out PrefabRef prefabRef))
            {
                return new int2(0, 0);
            }

            if (lookups.LayoutElements.TryGetBuffer(entity, out DynamicBuffer<LayoutElement> layout) && layout.Length != 0)
            {
                for (int i = 0; i < layout.Length; i++)
                {
                    Entity vehicle = layout[i].m_Vehicle;
                    AccumulateLoad(vehicle, ref load, lookups);
                    if (lookups.PrefabRefs.TryGetComponent(vehicle, out PrefabRef vehiclePrefab))
                    {
                        capacity += GetCapacity(vehiclePrefab.m_Prefab, lookups);
                    }
                }
            }
            else
            {
                AccumulateLoad(entity, ref load, lookups);
                capacity = GetCapacity(prefabRef.m_Prefab, lookups);
            }

            return new int2(load, capacity);
        }

        private static void AccumulateLoad(Entity vehicle, ref int load, in Lookups lookups)
        {
            if (lookups.Passengers.TryGetBuffer(vehicle, out DynamicBuffer<Passenger> passengers))
            {
                for (int j = 0; j < passengers.Length; j++)
                {
                    if (!lookups.Pets.HasComponent(passengers[j].m_Passenger))
                    {
                        load++;
                    }
                }
            }
            else if (lookups.Resources.TryGetBuffer(vehicle, out DynamicBuffer<Game.Economy.Resources> resources))
            {
                for (int k = 0; k < resources.Length; k++)
                {
                    load += resources[k].m_Amount;
                }
            }
        }

        private static int GetCapacity(Entity prefab, in Lookups lookups)
        {
            if (lookups.PublicTransportVehicleDatas.TryGetComponent(prefab, out PublicTransportVehicleData ptData))
            {
                return ptData.m_PassengerCapacity;
            }
            if (lookups.CargoTransportVehicleDatas.TryGetComponent(prefab, out CargoTransportVehicleData cargoData))
            {
                return cargoData.m_CargoCapacity;
            }
            return 0;
        }
    }
}
