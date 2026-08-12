using Belzont.Utils;
using BelzontTLM.Palettes;
using Colossal.Entities;
using Game.Prefabs;
using Game.Routes;
using Game.UI;
using Game.UI.InGame;
using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;
using Color = Game.Routes.Color;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    /// <summary>
    /// Shared builder for passenger/cargo line shield DTOs used by occupancy and fare-group APIs.
    /// </summary>
    public static class LineShieldBuilder
    {
        public static LineShieldInfo Build(EntityManager em, NameSystem nameSystem, Entity lineEntity)
        {
            em.TryGetComponent(lineEntity, out XTMRouteExtraData xtmData);
            em.TryGetComponent(lineEntity, out RouteNumber routeNumber);
            Color color = em.GetComponentData<Color>(lineEntity);
            PrefabRef prefabRef = em.GetComponentData<PrefabRef>(lineEntity);
            TransportLineData lineData = em.GetComponentData<TransportLineData>(prefabRef.m_Prefab);
            Route route = em.GetComponentData<Route>(lineEntity);
            RouteSchedule schedule = RouteUtils.CheckOption(route, RouteOption.Day)
                ? RouteSchedule.Day
                : (RouteUtils.CheckOption(route, RouteOption.Night) ? RouteSchedule.Night : RouteSchedule.DayAndNight);

            return new LineShieldInfo
            {
                entity = lineEntity,
                name = nameSystem.GetName(lineEntity).ToValueableName(),
                routeNumber = routeNumber.m_Number,
                xtmData = xtmData,
                color = color.m_Color.ToRGB(true),
                type = lineData.m_TransportType.ToString(),
                isCargo = lineData.m_CargoTransport,
                isFixedColor = em.HasComponent<XTMPaletteLockedColor>(lineEntity),
                active = !RouteUtils.CheckOption(route, RouteOption.Inactive),
                schedule = (int)schedule
            };
        }

        public static LineShieldInfo[] BuildMany(EntityManager em, NameSystem nameSystem, NativeList<Entity> lines)
        {
            var result = new LineShieldInfo[lines.Length];
            for (int i = 0; i < lines.Length; i++)
            {
                result[i] = Build(em, nameSystem, lines[i]);
            }
            return result;
        }

        public static LineShieldInfo[] BuildMany(EntityManager em, NameSystem nameSystem, IList<Entity> lines)
        {
            var result = new LineShieldInfo[lines.Count];
            for (int i = 0; i < lines.Count; i++)
            {
                result[i] = Build(em, nameSystem, lines[i]);
            }
            return result;
        }
    }
}
