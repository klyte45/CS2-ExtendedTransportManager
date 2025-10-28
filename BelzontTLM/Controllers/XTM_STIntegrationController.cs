using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Integrations.SmartTransportation;
using Game;
using System;
using System.Collections.Generic;
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

        private Colossal.Hash128 GetRouteRule(Entity routeEntity) => ST_ManageRouteBridge.GetRouteRule(routeEntity).Item1;
        private (Colossal.Hash128, string)[] ListAvailableRouteRules(Entity routeEntity) => ST_ManageRouteBridge.GetRouteRules(routeEntity);
        private void SetRouteRule(Entity routeEntity, Colossal.Hash128 routeRuleId) => ST_ManageRouteBridge.SetRouteRule(routeEntity, routeRuleId);

        #endregion



        protected override void OnCreate()
        {
            base.OnCreate();
        }

        protected override void OnStartRunning()
        {
            base.OnStartRunning();
            if (!stInitialized)
            {
                stInitialized = true;
                stAvailable = BridgeUtils.ApplyPatches("SmartTransportation", new List<(Type, string)>
                {
                    (typeof(ST_ManageRouteBridge), "ManageRouteBridge")
                });


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
