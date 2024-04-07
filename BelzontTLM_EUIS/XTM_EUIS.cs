#if !RELEASE
//#define LOCAL
#endif

using BelzontTLM;
using K45EUIS_Ext;
using System;

namespace XTM_EUIS
{
    public class XTM_EUIS_LineViewer : IEUISAppRegister
    {
        public string ModAppIdentifier => "main";

        public string DisplayName => "XTM - Main settings window";

#if LOCAL
        public string UrlJs => "http://localhost:8501/k45-xtm-main.js";
        public string UrlCss => "http://localhost:8501/k45-xtm-main.css";
#else

        public string UrlJs => $"coui://{ExtendedTransportManagerMod.Instance.CouiHost}/UI/k45-xtm-main.js";
        public string UrlCss => $"coui://{ExtendedTransportManagerMod.Instance.CouiHost}/UI/k45-xtm-main.css";
#endif
        public string UrlIcon => $"coui://{ExtendedTransportManagerMod.Instance.CouiHost}/UI/images/XTM.svg";

        public string ModderIdentifier => "k45";

        public string ModAcronym => "xtm";
    }

    public class XTM_EUIS : IEUISModRegister
    {
        public string ModderIdentifier => "k45";
        public string ModAcronym => "xtm";
        public Action<Action<string, object[]>> OnGetEventEmitter => (eventCaller) => ExtendedTransportManagerMod.Instance.SetupCaller(eventCaller);
        public Action<Action<string, Delegate>> OnGetEventsBinder => (eventCaller) => ExtendedTransportManagerMod.Instance.SetupEventBinder(eventCaller);
        public Action<Action<string, Delegate>> OnGetCallsBinder => (eventCaller) => ExtendedTransportManagerMod.Instance.SetupCallBinder(eventCaller);
    }
}
