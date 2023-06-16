using K45EUIS_Ext;
using System;
using System.Collections.Generic;

namespace BelzontTLM_EUIS
{
    public class BTLM_EUIS : IEUISAppRegister
    {
        public string AppName => "@k45/btlm";

        public string DisplayName => "Transport Lines Manager Belzont Edition";

        public string UrlJs => "coui://k45.euis/UI/k45-euis-root.js";

        public string UrlIcon => "coui://gameui/Media/Game/Icons/TramLine.svg";

        public string ModderIdentifier => "k45";

        public string ModAcronym => "tlmb";

        public Dictionary<string, Delegate> EventsToBind => new Dictionary<string, Delegate>();

        public Dictionary<string, Delegate> CallsToBind => new Dictionary<string, Delegate>();
    }
}
