using Belzont.Interfaces;
using BelzontTLM.Palettes;
using Game;
using Game.Modding;
using Game.UI.Menu;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

[assembly: AssemblyVersion("0.0.1.0")]
namespace BelzontTLM
{
    public class ExtendedTransportManagerMod : BasicIMod<XTMModData>, IMod
    {
        public static new ExtendedTransportManagerMod Instance => (ExtendedTransportManagerMod)BasicIMod.Instance;

        public override string SimpleName => "Extended Transport Manager";

        public override string SafeName => "ExtendedTransportManager";

        public override string Acronym => "XTM";

        public override string Description => "!!!";

        public override void DoOnCreateWorld(UpdateSystem updateSystem)
        {
            updateSystem.UpdateAfter<XTMLineViewerSection>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAfter<XTMLineListingSection>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAfter<XTMLineViewerSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAfter<XTMRouteAutoColorSystem>(SystemUpdatePhase.UIUpdate);
        }

        public override void OnDispose()
        {
        }

        public override void DoOnLoad()
        {

        }

        protected override IEnumerable<OptionsUISystem.Section> GenerateModOptionsSections()
        {
            return new OptionsUISystem.Section[] { };
        }

        public override XTMModData CreateNewModData()
        {
            return new XTMModData();
        }

        public string PalettesFolder => Path.Combine(ModSettingsRootFolder, "Palettes");
    }
}
