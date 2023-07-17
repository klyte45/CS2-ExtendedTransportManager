
using Belzont.Utils;
using Colossal.Entities;
using Colossal.OdinSerializer.Utilities;
using Game.Prefabs;
using Game.Routes;
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
            entityManager = world.EntityManager;

            var GetRouteName = typeof(NameSystem).GetMethod("GetRouteName", RedirectorUtils.allFlags);

            AddRedirect(GetRouteName, GetType().GetMethod("GetRouteName", RedirectorUtils.allFlags));
        }
        private static PrefabSystem prefabSystem;
        private static EntityManager entityManager;

        private static bool GetRouteName(ref Name __result, ref Entity route, ref Entity prefab)
        {
            RoutePrefab prefab2 = prefabSystem.GetPrefab<RoutePrefab>(prefab);
            var hasData = entityManager.TryGetComponent<XTMRouteExtraData>(route, out var extraData);
            RouteNumber componentData = entityManager.GetComponentData<RouteNumber>(route);
            __result = Name.FormattedName(prefab2.m_LocaleID + "[" + prefab2.name + "]", "NUMBER", hasData && !extraData.Acronym.IsNullOrWhitespace() ? extraData.Acronym : componentData.m_Number.ToString());
            return false;
        }

    }
}