using Game.UI.InGame;

namespace BelzontTLM.UI
{
    public class XTMMainPanel : TabbedGamePanel
    {
        public override bool blocking => true;

        public override LayoutPosition position => LayoutPosition.Center;
        public override bool retainProperties => true;

    }
}
