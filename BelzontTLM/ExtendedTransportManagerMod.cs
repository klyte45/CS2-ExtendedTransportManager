using Belzont.Interfaces;
using BelzontTLM.Palettes;
using Game;
using System.IO;
using Game.Modding;
#if BEPINEX_CS2
using ExtendedTransportManager;
using System.Collections.Generic;
using Belzont.Utils;
using Game.UI.Menu;
using BepInEx;
#endif

namespace BelzontTLM
{
#if BEPINEX_CS2

    [BepInPlugin(MyPluginInfo.PLUGIN_GUID, MyPluginInfo.PLUGIN_NAME, MyPluginInfo.PLUGIN_VERSION)]
    public class EUIBepinexPlugin : BaseUnityPlugin
    {
        public void Awake()
        {
            LogUtils.LogsEnabled = false;
            LogUtils.Logger = Logger;
            LogUtils.DoInfoLog($"STARTING MOD!");
            Redirector.PatchAll();
        }
    }

#endif
    public class ExtendedTransportManagerMod : BasicIMod, IMod
    {
        public static new ExtendedTransportManagerMod Instance => (ExtendedTransportManagerMod)BasicIMod.Instance;

        public override string SimpleName => "Extended Transport Manager";

        public override string SafeName => "ExtendedTransportManager";

        public override string Acronym => "XTM";

        public override string Description => "!!!";

        public override void DoOnCreateWorld(UpdateSystem updateSystem)
        {

            updateSystem.UpdateBefore<XTMRouteAutoColorSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateBefore<XTMStopsLinkingSystem>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAt<XTMLineViewerSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<XTMLineManagementSystem>(SystemUpdatePhase.UIUpdate);

            updateSystem.UpdateAfter<XTMLineViewerSection>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAfter<XTMLineListingSection>(SystemUpdatePhase.UIUpdate);
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
