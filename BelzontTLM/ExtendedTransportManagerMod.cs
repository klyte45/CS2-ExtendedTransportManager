using Belzont.Interfaces;
using Belzont.Utils;
using BelzontTLM.Palettes;
using Game;
using Game.Modding;
using Game.UI.Menu;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Unity.Entities;

[assembly: AssemblyVersion("0.0.0.*")]
namespace BelzontTLM
{
    public class ExtendedTransportManagerMod : BasicIMod<XTMModData>, IMod
    {
        public static new ExtendedTransportManagerMod Instance => (ExtendedTransportManagerMod)BasicIMod.Instance;

        public override string SimpleName => "Extended Transport Manager";

        public override string SafeName => "ExtendedTransportManager";

        public override string Acronym => "XTM";

        public override string Description => "!!!";

        private UpdateSystem m_updateSystem;

        public override void DoOnCreateWorld(UpdateSystem updateSystem)
        {
            m_updateSystem = updateSystem;
            updateSystem.UpdateAfter<XTMLineViewerController>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAfter<XTMRouteAutoPaletteSystem>(SystemUpdatePhase.UIUpdate);
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

        public T GetManagedSystem<T>() where T : ComponentSystemBase
        {
            return m_updateSystem.World.GetOrCreateSystemManaged<T>();
        }

        public string PalettesFolder => Path.Combine(ModSettingsRootFolder, "Palettes");
    }
}
