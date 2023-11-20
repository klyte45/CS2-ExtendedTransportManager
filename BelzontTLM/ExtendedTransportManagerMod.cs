using Belzont.Interfaces;
using BelzontTLM.Palettes;
using Game;
using System.IO;
#if THUNDERSTORE
using System.Collections.Generic;
using Belzont.Utils;
using Game.UI.Menu;
using BepInEx;
#else
using Game.Modding;
#endif

namespace BelzontTLM
{
#if THUNDERSTORE

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

    public class ExtendedTransportManagerMod : BasicIMod<XTMModData>
    {
        protected override IEnumerable<OptionsUISystem.Section> GenerateModOptionsSections() { yield break; }
        public override XTMModData CreateNewModData() => new();
#else
    public class ExtendedTransportManagerMod : BasicIMod, IMod
    {
#endif
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
#if THUNDERSTORE
        public override BasicModData CreateSettingsFile() => new XTMModData();
#else
        public override BasicModData CreateSettingsFile() => new XTMModData(this);
#endif
        public string PalettesFolder => Path.Combine(ModSettingsRootFolder, "Palettes");
    }
}
