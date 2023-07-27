using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Palettes;
using Colossal.Entities;
using Game;
using Game.Common;
using Game.Routes;
using Game.UI;
using System;
using Unity.Entities;
using UnityEngine;
using static Belzont.Utils.NameSystemExtensions;
using Color = Game.Routes.Color;

namespace BelzontTLM
{
    public class XTMLineManagementSystem : SystemBase, IBelzontBindable
    {
        private NameSystem m_NameSystem;
        private EndFrameBarrier m_EndFrameBarrier;

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("lineManagement.setRouteAcronym", SetRouteAcronym);
            eventCaller("lineManagement.setRouteName", SetRouteName);
            eventCaller("lineManagement.setRouteNumber", SetRouteInternalNumber);
            eventCaller("lineManagement.setIgnorePalette", SetRouteIgnorePalette);
            eventCaller("lineManagement.setRouteFixedColor", SetRouteFixedColor);
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }
        private string SetRouteAcronym(Entity targetEntity, string acronym)
        {
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            var componentExists = EntityManager.TryGetComponent<XTMRouteExtraData>(targetEntity, out var component);
            component.SetAcronym(acronym);
            if (componentExists)
            {
                entityCommandBuffer.SetComponent(targetEntity, component);
            }
            else
            {
                entityCommandBuffer.AddComponent(targetEntity, component);
            }
            entityCommandBuffer.AddComponent<Updated>(targetEntity);
            return acronym;
        }
        private bool SetRouteIgnorePalette(Entity targetEntity, bool ignore)
        {
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            var componentExists = EntityManager.HasComponent<XTMPaletteLockedColor>(targetEntity);

            if (componentExists && !ignore)
            {
                entityCommandBuffer.RemoveComponent<XTMPaletteLockedColor>(targetEntity);
            }
            else if (!componentExists && ignore)
            {
                entityCommandBuffer.AddComponent<XTMPaletteLockedColor>(targetEntity);
            }
            entityCommandBuffer.AddComponent<Updated>(targetEntity);
            return ignore;
        }
        private int SetRouteInternalNumber(Entity entity, int routeNum)
        {
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            EntityManager.TryGetComponent<RouteNumber>(entity, out var component);
            component.m_Number = routeNum;
            entityCommandBuffer.SetComponent(entity, component);
            entityCommandBuffer.AddComponent<XTMPaletteRequireUpdate>(entity);
            return routeNum;
        }
        private string SetRouteFixedColor(Entity entity, string color)
        {
            Color32 colorObj;
            try
            {
                colorObj = Belzont.Utils.ColorExtensions.FromRGB(color, color.StartsWith("#"));
            }
            catch
            {
                return null;
            }
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            EntityManager.TryGetComponent<Color>(entity, out var component);
            component.m_Color = colorObj;
            entityCommandBuffer.SetComponent(entity, component);
            entityCommandBuffer.AddComponent<XTMPaletteRequireUpdate>(entity);
            return color;
        }
        private ValuableName SetRouteName(Entity entity, string newName)
        {
            EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
            m_NameSystem.SetCustomName(entity, newName ?? String.Empty);
            entityCommandBuffer.AddComponent<Updated>(entity);
            return m_NameSystem.GetName(entity).ToValueableName();
        }
        protected override void OnCreate()
        {
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();
        }

        protected override void OnUpdate()
        {
        }
    }
}
