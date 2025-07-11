using Belzont.Interfaces;
using Belzont.Utils;
using Game;
using HarmonyLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Unity.Entities;

namespace BelzontTLM
{
    public partial class XTM_STIntegrationController : GameSystemBase, IBelzontBindable
    {
        private bool stInitialized;
        private bool stAvailable;

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("stIntegration.isAvailable", () => stAvailable);
            eventCaller("stIntegration.getRouteRule", GetRouteRule);
            eventCaller("stIntegration.listAvailableRouteRules", ListAvailableRouteRules);
            eventCaller("stIntegration.setRouteRule", SetRouteRule);
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        #region UI Calls

        private ST_Route GetRouteRule(Entity routeEntity) => new(ST_GetRouteRule(routeEntity));
        private ST_Route[] ListAvailableRouteRules(Entity routeEntity) => ST_GetRouteRules(routeEntity)
            .Select(x => new ST_Route(x))
            .ToArray();
        private void SetRouteRule(Entity routeEntity, int routeRuleId) => ST_SetRouteRule(routeEntity, routeRuleId);

        #endregion

        private struct ST_Route
        {
            public int RouteRuleId;
            public string RouteRuleName;

            public ST_Route(ValueTuple<int, string> routeData)
            {
                RouteRuleId = routeData.Item1;
                RouteRuleName = routeData.Item2;
            }
        }

        protected override void OnCreate()
        {
            base.OnCreate();
        }


        private static void ST_SetRouteRule(Entity routeEntity, int routeRuleId) => throw new NotImplementedException("STUB ONLY!");
        private static ValueTuple<int, string> ST_GetRouteRule(Entity routeEntity) => throw new NotImplementedException("STUB ONLY!");
        private static ValueTuple<int, string>[] ST_GetRouteRules(Entity routeEntity) => throw new NotImplementedException("STUB ONLY!");


        protected override void OnStartRunning()
        {
            base.OnStartRunning();
            if (!stInitialized)
            {
                stInitialized = true;
                if (AppDomain.CurrentDomain.GetAssemblies().SingleOrDefault(assembly => assembly.GetName().Name == "SmartTransportation") is Assembly stAssembly)
                {
                    if (stAssembly.GetExportedTypes().FirstOrDefault(x => x.Name == "ManageRouteBridge") is Type targetType)
                    {
                        foreach (var (localMethod, bridgeMethodName) in new List<(string, string)>() {
                            (nameof(ST_SetRouteRule), "SetRouteRule"),
                            (nameof(ST_GetRouteRule), "GetRouteRule"),
                            (nameof(ST_GetRouteRules), "GetRouteRules"),
                        })
                        {
                            var targetMethod = GetType().GetMethod(localMethod, RedirectorUtils.allFlags);
                            var srcMethod = targetType.GetMethod(bridgeMethodName, RedirectorUtils.allFlags, null, targetMethod.GetParameters().Select(x => x.ParameterType).ToArray(), null);
                            if (srcMethod != null)
                            {
                                Harmony.ReversePatch(srcMethod, new HarmonyMethod(targetMethod));
                            }
                            else LogUtils.DoWarnLog($"Method not found while patching WE: {targetType.FullName} {srcMethod.Name}({string.Join(", ", targetMethod.GetParameters().Select(x => $"{x.ParameterType}"))})");
                        }
                        stAvailable = true;
                    }
                }
                if (!stAvailable)
                {
                    Enabled = false;
                }
            }
        }
        protected override void OnUpdate()
        {
        }
    }
}
