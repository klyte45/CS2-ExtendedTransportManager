using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Palettes;
using Game;
using Game.Modding;
using Game.Policies;
using System.IO;

namespace BelzontTLM
{
    public class ExtendedTransportManagerMod : BasicIMod, IMod
    {
        public static new ExtendedTransportManagerMod Instance => (ExtendedTransportManagerMod)BasicIMod.Instance;

        public override string Acronym => "XTM";        


        public override void DoOnCreateWorld(UpdateSystem updateSystem)
        {
            // Wipe standalone XTM entities before deserialize (same relative slot as vanilla ClearSystem).
            updateSystem.UpdateBefore<XTMClearSystem>(SystemUpdatePhase.Deserialize);

            updateSystem.UpdateAfter<XTMStopsLinkingSystem>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateBefore<XTMRouteAutoColorSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMLineViewerController>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMLineManagementController>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMFareGroupController>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMVehicleModelGroupController>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAfter<XTMLineListingSection>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAt<XTMSegmentOccupancyHistorySystem>(SystemUpdatePhase.GameSimulation);
            updateSystem.UpdateAfter<XTMFareGroupSystem, ModifiedSystem>(SystemUpdatePhase.Modification4);
            // Drain fare apply queue at end of frame (Belzont EndFrame = MainLoop).
            updateSystem.UpdateAfter<XTMFareGroupEndFrameSystem>(SystemUpdatePhase.MainLoop);
            updateSystem.UpdateAfter<XTMVehicleModelGroupSystem, Game.Routes.InitializeSystem>(SystemUpdatePhase.Modification4);
            updateSystem.UpdateAfter<XTMVehicleModelGroupApplySystem, XTMVehicleModelGroupSystem>(SystemUpdatePhase.Modification4);
            updateSystem.UpdateAt<XTM_WEIntegrationController>(SystemUpdatePhase.ModificationEnd);
            updateSystem.UpdateAt<XTMInfoPanelSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMEditorUISystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMWhatsNewUISystem>(SystemUpdatePhase.UIUpdate);

            KFileUtils.EnsureFolderCreation(ExtendedTransportManagerMod.Instance.PalettesFolder);
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
