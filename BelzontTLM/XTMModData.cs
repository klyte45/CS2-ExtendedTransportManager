using Belzont.Interfaces;
using Colossal.IO.AssetDatabase;
using Game.Modding;
using Game.Settings;

[FileLocation("K45_XTM_settings")]
[SettingsUIShowGroupName(XTMModData.kLineListingSection, XTMModData.kEditorSection)]
public class XTMModData : BasicModData
{
    public const string kUiTab = "UI";
    public const string kLineListingSection = "LineListing";
    public const string kEditorSection = "Editor";

    private bool useXtmLineListingDefault = true;
    private bool showEditorPalettesButton = true;

    public XTMModData(IMod mod) : base(mod) { }

    [SettingsUISection(kUiTab, kLineListingSection)]
    public bool UseXtmLineListingDefault
    {
        get => useXtmLineListingDefault;
        set => useXtmLineListingDefault = value;
    }

    [SettingsUISection(kUiTab, kEditorSection)]
    public bool ShowEditorPalettesButton
    {
        get => showEditorPalettesButton;
        set => showEditorPalettesButton = value;
    }

    public override void OnSetDefaults()
    {
        UseXtmLineListingDefault = true;
        ShowEditorPalettesButton = true;
    }
}
