using Belzont.Interfaces;
using System.Xml.Serialization;
#if !THUNDERSTORE
using Game.Modding;
#endif

#if THUNDERSTORE
[XmlRoot("XTMModData")]
#endif
public class XTMModData : BasicModData
{
#if THUNDERSTORE
    public XTMModData() : base() { }
#else
    public XTMModData(IMod mod) : base(mod){}        
#endif
    public override void OnSetDefaults()
    {
    }
}