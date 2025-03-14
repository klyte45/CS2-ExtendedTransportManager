using Belzont.Interfaces;
using Colossal.IO.AssetDatabase;
using Game.Modding;

[FileLocation("K45_XTM_settings")]
public class XTMModData : BasicModData
{
    public XTMModData(IMod mod) : base(mod) { }

    public override void OnSetDefaults()
    {
    }
}