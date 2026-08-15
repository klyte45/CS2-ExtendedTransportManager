using Belzont.Interfaces;
using Colossal.Serialization.Entities;
using Game;
using Game.UI;
using Game.UI.Editor;
using System;
using System.Linq;

namespace BelzontTLM
{
    public partial class XTMEditorUISystem : UISystemBase
    {
        protected override void OnGamePreload(Purpose purpose, GameMode mode)
        {
            base.OnGamePreload(purpose, mode);
            if (mode != GameMode.Editor)
            {
                return;
            }

            var wantTool = (BasicIMod.ModData as XTMModData)?.ShowEditorPalettesButton != false;
            EditorToolUISystem editorToolUISystem = World.GetExistingSystemManaged<EditorToolUISystem>();
            var tools = editorToolUISystem.tools;
            var existingIndex = Array.FindIndex(tools, t => t is XTMEditorTool || t?.id == XTMEditorTool.TOOL_ID);

            if (wantTool)
            {
                if (existingIndex >= 0)
                {
                    return;
                }

                Array.Resize(ref tools, tools.Length + 1);
                tools[^1] = new XTMEditorTool(World);
                editorToolUISystem.tools = tools;
                return;
            }

            if (existingIndex < 0)
            {
                return;
            }

            var withoutTool = tools.Where((_, i) => i != existingIndex).ToArray();
            editorToolUISystem.tools = withoutTool;
        }
    }
}
