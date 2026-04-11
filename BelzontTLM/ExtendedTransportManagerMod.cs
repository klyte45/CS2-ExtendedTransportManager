using Belzont.Interfaces;
using BelzontTLM.Palettes;
using Game;
using Game.Modding;
using System.IO;

namespace BelzontTLM
{
    public class ExtendedTransportManagerMod : BasicIMod, IMod
    {
        public static new ExtendedTransportManagerMod Instance => (ExtendedTransportManagerMod)BasicIMod.Instance;

        public override string Acronym => "XTM";


        public override void DoOnCreateWorld(UpdateSystem updateSystem)
        {
            updateSystem.UpdateAfter<XTMStopsLinkingSystem>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateBefore<XTMRouteAutoColorSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMLineViewerController>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMLineManagementController>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAfter<XTMLineListingSection>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAt<XTM_WEIntegrationController>(SystemUpdatePhase.ModificationEnd);
            updateSystem.UpdateAt<XTMInfoPanelSystem>(SystemUpdatePhase.UIUpdate);
        }

        public override void OnDispose()
        {
        }

        public override void DoOnLoad()
        {

        }
        public override BasicModData CreateSettingsFile() => new XTMModData(this);

        public string PalettesFolder => Path.Combine(ModSettingsRootFolder, "Palettes");
    }
}
