
using Belzont.Utils;
using Game.Prefabs;
using Game.UI;
using Unity.Entities;
using static Game.UI.NameSystem;

namespace BelzontTLM.Overrides
{
    public class NameSystemOverrides : Redirector, IRedirectable
    {

        public void DoPatches(World world)
        {
            prefabSystem = world.GetExistingSystemManaged<PrefabSystem>();
            managementSystem = world.GetOrCreateSystemManaged<XTMLineManagementController>();
            entityManager = world.EntityManager;

            var getRouteName = typeof(NameSystem).GetMethod("GetRouteName", RedirectorUtils.allFlags);

            AddRedirect(getRouteName, GetType().GetMethod(nameof(GetRouteName), RedirectorUtils.allFlags));
        }
        private static XTMLineManagementController managementSystem;
        private static PrefabSystem prefabSystem;
        private static EntityManager entityManager;

        private static bool GetRouteName(ref Name __result, ref Entity route, ref Entity prefab)
        {
            RoutePrefab prefab2 = prefabSystem.GetPrefab<RoutePrefab>(prefab);
            __result = Name.FormattedName(prefab2.m_LocaleID + "[" + prefab2.name + "]", "NUMBER", managementSystem.GetEffectiveRouteNumber(route));
            return false;
        }

    }
}