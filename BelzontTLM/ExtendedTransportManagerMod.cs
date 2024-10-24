﻿using Belzont.Interfaces;
using BelzontTLM.Palettes;
using Game;
using System.IO;
using Game.Modding;

namespace BelzontTLM
{
    public class ExtendedTransportManagerMod : BasicIMod, IMod
    {
        public static new ExtendedTransportManagerMod Instance => (ExtendedTransportManagerMod)BasicIMod.Instance;

        public override string Acronym => "XTM";


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
