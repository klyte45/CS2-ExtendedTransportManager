using K45EUIS_Ext;
using System;
using System.Collections.Generic;

namespace XTM_EUIS
{
    public class XTM_EUIS : IEUISAppRegister 
    {
        public string AppName => "@k45/xtm-line-viewer";

        public string DisplayName => "XTM - Line viewer";

        public string UrlJs => "http://localhost:8500/k45-xtm-line-viewer.js";//"coui://k45.euis/UI/k45-euis-root.js";

        public string UrlIcon => "coui://gameui/Media/Game/Icons/TramLine.svg";

        public string ModderIdentifier => "k45";

        public string ModAcronym => "xtm";

        public Dictionary<string, Delegate> EventsToBind => new Dictionary<string, Delegate>();

        public Dictionary<string, Delegate> CallsToBind => new Dictionary<string, Delegate>();
    }
}
