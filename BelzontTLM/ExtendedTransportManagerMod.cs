using Belzont.Interfaces;
using BelzontTLM.Palettes;
using Game;
using Game.Modding;
using System.IO;
using System.Reflection;

[assembly: AssemblyVersion("0.0.4.0")]
namespace BelzontTLM
{
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
