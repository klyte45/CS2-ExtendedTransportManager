using Belzont.Interfaces;
using BelzontTLM;
using Colossal.UI.Binding;
using K45EUIS_Ext;
using System;

namespace XTM_EUIS
{
    public class XTM_EUIS : IEUISAppRegister
    {
        public string ModAppIdentifier => "line-viewer";

        public string DisplayName => "XTM - Line viewer";

        public string UrlJs => "http://localhost:8500/k45-xtm-line-viewer.js";//"coui://k45.euis/UI/k45-euis-root.js";
        public string UrlCss => "http://localhost:8500/k45-xtm-line-viewer.css";//"coui://k45.euis/UI/k45-euis-root.js";

        public string UrlIcon => $"coui://{BasicIMod.Instance.CouiHost}/UI/images/XTM.svg";

        public string ModderIdentifier => "k45";

        public string ModAcronym => "xtm";

        public Action<Action<string, object[]>> OnGetEventEmitter => (eventCaller) => ExtendedTransportManagerMod.Instance.GetManagedSystem<XTMLineViewerController>().SetupCaller(eventCaller);

        public Action<Action<string, Delegate>> OnGetEventsBinder => (eventCaller) => ExtendedTransportManagerMod.Instance.GetManagedSystem<XTMLineViewerController>().SetupEventBinder(eventCaller);

        public Action<Action<string, Delegate>> OnGetCallsBinder => (eventCaller) => ExtendedTransportManagerMod.Instance.GetManagedSystem<XTMLineViewerController>().SetupCallBinder(eventCaller);

        public Action<Func<string, Action<IJsonWriter>, RawValueBinding>> OnGetRawValueBindingRegisterer => (eventCaller) => ExtendedTransportManagerMod.Instance.GetManagedSystem<XTMLineViewerController>().SetupRawBindings(eventCaller);
    }
}
