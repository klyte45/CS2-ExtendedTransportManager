using Belzont.Utils;
using Colossal.Entities;
using Game.Prefabs;
using Game.UI;
using Unity.Entities;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public class LineVehicleNamed
    {
        public Entity entity { get; }
        public float position { get; }
        public int cargo { get; }
        public int capacity { get; }
        public bool isCargo { get; }
        public ValuableName name { get; }
        public Vector3Json worldPosition { get; }
        public float azimuth { get; }
        public float odometer { get; }
        public float maintenanceRange { get; }

        public LineVehicleNamed(LineVehicle src, NameSystem nameSystem, EntityManager entityManager)
        {
            entity = src.entity;
            position = src.position;
            cargo = src.cargo;
            capacity = src.capacity;
            isCargo = src.isCargo;
            name = nameSystem.GetName(src.entity).ToValueableName();
            worldPosition = new(src.worldPosition);
            azimuth = src.rotation.eulerAngles.y;
            odometer = src.odometer;
            var data = entityManager.TryGetComponent(entityManager.GetComponentData<PrefabRef>(src.entity).m_Prefab, out PublicTransportVehicleData publicTransportVehicleData);
            maintenanceRange = data ? publicTransportVehicleData.m_MaintenanceRange : -1;
        }
    }
}
