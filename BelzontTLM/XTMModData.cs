using Belzont.Interfaces;
using Colossal.IO.AssetDatabase;
using Game.Modding;
using Game.Settings;

[FileLocation("K45_XTM_settings")]
[SettingsUIShowGroupName(XTMModData.kLineListingSection)]
public class XTMModData : BasicModData
{
    public const string kUiTab = "UI";
    public const string kLineListingSection = "LineListing";

    private bool useXtmLineListingDefault = true;

    public XTMModData(IMod mod) : base(mod) { }

    [SettingsUISection(kUiTab, kLineListingSection)]
    public bool UseXtmLineListingDefault
    {
        get => useXtmLineListingDefault;
        set => useXtmLineListingDefault = value;
    }

    public override void OnSetDefaults()
    {
        UseXtmLineListingDefault = true;
    }
}
