using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.IO.AssetDatabase;
using Colossal.OdinSerializer.Utilities;
using Colossal.Serialization.Entities;
using Game;
using Game.SceneFlow;
using Game.UI;
using System;

namespace BelzontTLM
{
    public partial class XTMWhatsNewUISystem : UISystemBase, IBelzontBindable
    {
        private const string kThumbnailResource = "Properties.Thumbnail.png";

        private Action<string, object[]> m_eventCaller;
        private bool m_pendingShow;
        private bool m_whatsNewEligible;
        private string m_pendingChangelog;
        private string m_pendingVersion;
        private bool m_pendingShowOnNewVersion;

        public void SetupCallBinder(Action<string, Delegate> callBinder)
        {
            callBinder("whatsNew.setShowOnNewVersion", new Action<bool>(SetShowOnNewVersion));
            callBinder("whatsNew.acknowledge", new Action(AcknowledgeWhatsNew));
            callBinder("whatsNew.pullPending", new Func<object>(PullPendingWhatsNew));
            callBinder("whatsNew.shouldShow", new Func<bool>(ShouldShowWhatsNewNow));
            callBinder("whatsNew.canPresent", new Func<bool>(CanPresentWhatsNewNow));
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            m_eventCaller = eventCaller;
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        protected override void OnGameLoadingComplete(Purpose purpose, GameMode mode)
        {
            base.OnGameLoadingComplete(purpose, mode);
            m_whatsNewEligible = false;

            if (mode != GameMode.Game && mode != GameMode.Editor)
            {
                return;
            }

            var modData = BasicIMod.ModData as XTMModData;
            if (modData is null || !ShouldShowWhatsNew(modData, out var changelog))
            {
                return;
            }

            m_whatsNewEligible = true;
            m_pendingVersion = BasicIMod.FullVersion;
            m_pendingChangelog = changelog;
            m_pendingShowOnNewVersion = modData.ShowWhatsNewOnNewVersion;
            m_pendingShow = true;
        }

        protected override void OnUpdate()
        {
            if (!m_pendingShow || m_eventCaller is null)
            {
                return;
            }

            if (!CanPresentWhatsNewNow())
            {
                return;
            }

            var view = GameManager.instance?.userInterface?.view?.View;
            if (view is null || !view.IsReadyForBindings())
            {
                return;
            }

            m_pendingShow = false;
            m_eventCaller("whatsNew.show", BuildWhatsNewPayload(m_pendingVersion, m_pendingChangelog, m_pendingShowOnNewVersion));
        }

        private static bool HasChangelogContent(out string changelog)
        {
            changelog = null;
            if (!KResourceLoader.ResourceExistsMod("changelog.md"))
            {
                return false;
            }

            changelog = KResourceLoader.LoadResourceStringMod("changelog.md");
            return !changelog.IsNullOrWhitespace();
        }

        private static bool ShouldShowWhatsNew(XTMModData data, out string changelog)
        {
            if (!HasChangelogContent(out changelog))
            {
                return false;
            }

            return data.ShowWhatsNewOnNewVersion
                && data.LastWhatsNewVersionShown != BasicIMod.FullVersion;
        }

        private static XTMModData GetModData() => BasicIMod.ModData as XTMModData;

        private static void SaveModSettings()
        {
            _ = AssetDatabase.global.SaveSettings();
        }

        private void SetShowOnNewVersion(bool value)
        {
            var modData = GetModData();
            if (modData is null)
            {
                return;
            }

            modData.ShowWhatsNewOnNewVersion = value;
            SaveModSettings();
        }

        private void AcknowledgeWhatsNew()
        {
            var modData = GetModData();
            if (modData is null)
            {
                return;
            }

            modData.LastWhatsNewVersionShown = BasicIMod.FullVersion;
            SaveModSettings();
        }

        private static bool CanPresentWhatsNew()
        {
            var gameManager = GameManager.instance;
            var overlay = gameManager?.userInterface?.overlayBindings;
            if (overlay is null)
            {
                return false;
            }

            return gameManager.state == GameManager.State.WorldReady
                && overlay.currentlyActiveScreen != OverlayScreen.Loading;
        }

        private bool CanPresentWhatsNewNow()
        {
            return m_whatsNewEligible && CanPresentWhatsNew();
        }

        private bool ShouldShowWhatsNewNow()
        {
            var modData = GetModData();
            return modData is not null && ShouldShowWhatsNew(modData, out _);
        }

        private object PullPendingWhatsNew()
        {
            if (!CanPresentWhatsNewNow())
            {
                return null;
            }

            var modData = GetModData();
            if (modData is null || !ShouldShowWhatsNew(modData, out var changelog))
            {
                return null;
            }

            return BuildWhatsNewPayload(BasicIMod.FullVersion, changelog, modData.ShowWhatsNewOnNewVersion);
        }

        private static object[] BuildWhatsNewPayload(string version, string changelog, bool showOnNewVersion)
        {
            return new object[] { version, changelog, showOnNewVersion, GetWhatsNewThumbnailDataUrl() };
        }

        private static string GetWhatsNewThumbnailDataUrl()
        {
            if (!KResourceLoader.ResourceExistsMod(kThumbnailResource))
            {
                return null;
            }

            var bytes = KResourceLoader.LoadResourceDataMod(kThumbnailResource);
            if (bytes is null || bytes.Length == 0)
            {
                return null;
            }

            return "data:image/png;base64," + Convert.ToBase64String(bytes);
        }
    }
}
