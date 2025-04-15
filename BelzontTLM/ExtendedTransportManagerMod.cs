#if !RELEASE
#define LOCAL
#endif

using Belzont.Interfaces;
using BelzontTLM.Palettes;
using Game;
using Game.Modding;
using System.Collections.Generic;
using System.IO;

namespace BelzontTLM
{
    public class ExtendedTransportManagerMod : BasicIMod, IMod
    {
        public static new ExtendedTransportManagerMod Instance => (ExtendedTransportManagerMod)BasicIMod.Instance;

        public override string Acronym => "XTM";

        
        public override void DoOnCreateWorld(UpdateSystem updateSystem)
        {
            updateSystem.UpdateAt<XTMStopsLinkingSystem>(SystemUpdatePhase.MainLoop);

            updateSystem.UpdateBefore<XTMRouteAutoColorSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMLineViewerController>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMLineManagementController>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAfter<XTMLineViewerSection>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAfter<XTMLineListingSection>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAt<XTM_WEIntegrationController>(SystemUpdatePhase.ModificationEnd);
        }

        public override void OnDispose()
        {
        }

        public override void DoOnLoad()
        {

        }
        public override BasicModData CreateSettingsFile() => new XTMModData(this);

        public string PalettesFolder => Path.Combine(ModSettingsRootFolder, "Palettes");

#if LOCAL
        private string BaseUrlApps => "http://localhost:8501";
#else
        private string BaseUrlApps => $"coui://{CouiHost}/UI";
#endif

        protected override bool EuisIsMandatory => true;
        protected override bool UseEuisRegister => true;
        protected override Dictionary<string, EuisAppRegister> EuisApps => new()
        {
            ["main"] = new("XTM - Main settings window", $"{BaseUrlApps}/k45-xtm-main.js", $"{BaseUrlApps}/k45-xtm-main.css", $"coui://{CouiHost}/UI/images/XTM.svg")
        };
    }
}
