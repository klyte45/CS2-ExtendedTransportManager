using Unity.Entities;

namespace BelzontTLM
{
    public struct AvailableVehicle(Entity entity, bool isSecondary)
    {
        public Entity entity = entity;
        public bool isSecondary = isSecondary;
    }
}
