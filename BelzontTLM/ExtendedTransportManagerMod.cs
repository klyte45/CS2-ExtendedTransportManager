using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Palettes;
using BelzontTLM.UI;
using Game;
using Game.Modding;
using Game.UI.InGame;
using System.IO;
using Unity.Entities;

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

            KFileUtils.EnsureFolderCreation(ExtendedTransportManagerMod.Instance.PalettesFolder);
        }

        public override void OnDispose()
        {
        }

        public override void DoOnLoad()
        {
            World.DefaultGameObjectInjectionWorld.GetOrCreateSystemManaged<GamePanelUISystem>().SetDefaultArgs(new XTMMainPanel());
            LogUtils.DoInfoLog($"Registered panel: {typeof(XTMMainPanel).FullName}");
        }
        public override BasicModData CreateSettingsFile() => new XTMModData(this);

        public string PalettesFolder => Path.Combine(ModSettingsRootFolder, "Palettes");
    }
}
