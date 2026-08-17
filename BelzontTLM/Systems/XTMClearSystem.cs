using Game;
using Unity.Entities;
using UnityEngine.Scripting;

namespace BelzontTLM
{
    /// <summary>
    /// Destroys standalone XTM-owned entities before deserialization so they do not
    /// leak across new-game / load-game transitions. Modeled on vanilla
    /// <c>Game.Serialization.ClearSystem</c>.
    /// </summary>
    public partial class XTMClearSystem : GameSystemBase
    {
        private EntityQuery m_ClearQuery;

        [Preserve]
        protected override void OnCreate()
        {
            base.OnCreate();
            m_ClearQuery = GetEntityQuery(new EntityQueryDesc
            {
                Any = new ComponentType[]
                {
                    ComponentType.ReadOnly<XTMFareGroup>(),
                    ComponentType.ReadOnly<XTMVehicleModelGroup>()
                }
            });
        }

        [Preserve]
        protected override void OnUpdate()
        {
            EntityManager.DestroyEntity(m_ClearQuery);
        }

        [Preserve]
        public XTMClearSystem()
        {
        }
    }
}
