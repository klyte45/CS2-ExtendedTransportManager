using Belzont.Interfaces;
using Game.Settings;
using System;
using Unity.Entities;

namespace BelzontTLM
{
    public partial class XTMCommonSystem : SystemBase, IBelzontBindable
    {
        private bool dirty_measureSetting;
        private InterfaceSettings.UnitSystem value_measureSetting;

        private Action<string, object[]> EventCaller { get; set; }

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("common.getMeasureUnits", () => (int)SharedSettings.instance.userInterface.unitSystem);
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            EventCaller = eventCaller;
        }

        public void OnMeasureUnitsChanged()
        {
        }

        protected override void OnUpdate()
        {
            var val = SharedSettings.instance.userInterface.unitSystem;
            if (dirty_measureSetting || value_measureSetting != val)
            {
                value_measureSetting = val;
                dirty_measureSetting = false;
                EventCaller?.Invoke("common.onMeasureUnitsChanged", new object[0]);
            }
        }
        protected override void OnCreate()
        {
            base.OnCreate();
        }
    }
}
