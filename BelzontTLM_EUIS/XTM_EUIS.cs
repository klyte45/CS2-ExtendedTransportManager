﻿using Belzont.Interfaces;
using Colossal.UI.Binding;
using K45EUIS_Ext;
using System;

namespace XTM_EUIS
{
    public class XTM_EUIS_LineViewer : IEUISAppRegister
    {
        public string ModAppIdentifier => "line-viewer";

        public string DisplayName => "XTM - Line viewer";

        public string UrlJs => "http://localhost:8500/k45-xtm-line-viewer.js";//"coui://k45.euis/UI/k45-euis-root.js";
        public string UrlCss => "http://localhost:8500/k45-xtm-line-viewer.css";//"coui://k45.euis/UI/k45-euis-root.js";

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
        public Action<Func<string, Action<IJsonWriter>, RawValueBinding>> OnGetRawValueBindingRegisterer => (eventCaller) => BasicIMod.Instance.SetupRawBindings(eventCaller);
    }
}
