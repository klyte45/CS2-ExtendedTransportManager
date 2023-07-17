using Belzont.Interfaces;
using Colossal.UI.Binding;
using K45EUIS_Ext;
using System;

namespace XTM_EUIS
{
    public class XTM_EUIS_LineViewer : IEUISAppRegister
    {
        public string ModAppIdentifier => "main";

        public string DisplayName => "XTM - Main settings window";

        public string UrlJs => "http://localhost:8500/k45-xtm-main.js";//$"coui://{BasicIMod.Instance.CouiHost}/UI/k45-xtm-main.js";//
        public string UrlCss => "http://localhost:8500/k45-xtm-main.css";//$"coui://{BasicIMod.Instance.CouiHost}/UI/k45-xtm-main.css";//
        public string UrlIcon => $"coui://{BasicIMod.Instance.CouiHost}/UI/images/XTM.svg";

        public string ModderIdentifier => "k45";

        public string ModAcronym => "xtm";
    }

    public class XTM_EUIS : IEUISModRegister
    {
        public string ModderIdentifier => "k45";
        public string ModAcronym => "xtm";
        public Action<Action<string, object[]>> OnGetEventEmitter => (eventCaller) => BasicIMod.Instance.SetupCaller(eventCaller);
        public Action<Action<string, Delegate>> OnGetEventsBinder => (eventCaller) => BasicIMod.Instance.SetupEventBinder(eventCaller);
        public Action<Action<string, Delegate>> OnGetCallsBinder => (eventCaller) => BasicIMod.Instance.SetupCallBinder(eventCaller);
    }
}
