using Game.UI.Editor;
using Unity.Entities;

namespace BelzontTLM
{
    public class XTMEditorTool : EditorTool
    {
        public const string TOOL_ID = "k45__xtm_MainWindow";

        public XTMEditorTool(World world) : base(world)
        {
            id = TOOL_ID;
            icon = "coui://xtm.k45/UI/images/iconWhite.svg";
        }
    }
}
