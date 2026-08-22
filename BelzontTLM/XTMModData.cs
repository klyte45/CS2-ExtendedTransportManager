using Belzont.Interfaces;
using Colossal.IO.AssetDatabase;
using Game.Modding;
using Game.Settings;

[FileLocation("K45_XTM_settings")]
[SettingsUIShowGroupName(XTMModData.kLineListingSection, XTMModData.kEditorSection, XTMModData.kAlertModalsSection)]
public class XTMModData : BasicModData
{
    public const string kUiTab = "UI";
    public const string kLineListingSection = "LineListing";
    public const string kEditorSection = "Editor";
    public const string kAlertModalsSection = "AlertModals";

    private bool useXtmLineListingDefault = true;
    private bool showEditorPalettesButton = true;
    private bool showWhatsNewOnNewVersion = true;
    private string lastWhatsNewVersionShown = string.Empty;

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

    [SettingsUISection(kUiTab, kAlertModalsSection)]
    public bool ShowWhatsNewOnNewVersion
    {
        get => showWhatsNewOnNewVersion;
        set => showWhatsNewOnNewVersion = value;
    }

    [SettingsUIHidden]
    public string LastWhatsNewVersionShown
    {
        get => lastWhatsNewVersionShown;
        set => lastWhatsNewVersionShown = value ?? string.Empty;
    }

    public override void OnSetDefaults()
    {
        UseXtmLineListingDefault = true;
        ShowEditorPalettesButton = true;
        ShowWhatsNewOnNewVersion = true;
        LastWhatsNewVersionShown = string.Empty;
    }
}
