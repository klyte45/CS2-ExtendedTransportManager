import translate from "#utility/translate";
import { replaceArgs, VanillaComponentResolver, VanillaWidgets } from "@klyte45/vuio-commons";
import { trigger } from "cs2/api";
import { FormattedParagraphs, MarkdownRenderer, Panel, Portal, Scrollable } from "cs2/ui";
import { useMemo } from "react";
import { VANILLA_SCROLLABLE_RESERVE_PROPS } from "#components/glossary/glossaryScrollable";
import { acknowledgeWhatsNew, setShowOnNewVersion } from "./whatsNewService";
import "#styles/whatsNew.scss";

const markdownRenderer = new MarkdownRenderer();

const EXTERNAL_LINK_PATTERN = /^https?:\/\//i;

function openWhatsNewLink(data: string) {
    if (EXTERNAL_LINK_PATTERN.test(data)) trigger("paradox", "showLink", data);
}

type Props = {
    version: string;
    changelogMarkdown: string;
    thumbnailUrl: string | null;
    showOnNewVersion: boolean;
    onShowOnNewVersionChange: (value: boolean) => void;
    onClose: () => void;
};

export function XtmWhatsNewDialog({
    version,
    changelogMarkdown,
    thumbnailUrl,
    showOnNewVersion,
    onShowOnNewVersionChange,
    onClose,
}: Props) {
    const PanelTitleBar = VanillaComponentResolver.instance.PanelTitleBar;
    const Checkbox = VanillaWidgets.instance.Checkbox;

    const title = replaceArgs(translate("whatsNew.title"), { version });

    const renderer = useMemo(() => markdownRenderer, []);

    const onCheckboxChange = (checked: boolean) => {
        onShowOnNewVersionChange(checked);
        void setShowOnNewVersion(checked);
    };

    const onReadLater = () => onClose();

    const onOk = () => {
        void acknowledgeWhatsNew().finally(onClose);
    };

    return (
        <Portal>
            <div className="xtm-whatsNewDialog_anchor">
                <Panel
                    className="xtm-whatsNewDialog_panel"
                    contentClassName="xtm-whatsNewDialog_content"
                    header={
                        <PanelTitleBar
                            className="xtm-whatsNewDialog_titleBar"
                            onCloseOverride={onReadLater}
                        >
                            {title}
                        </PanelTitleBar>
                    }
                >
                    <div className="xtm-whatsNewDialog_content">
                        <Scrollable
                            className="xtm-whatsNewDialog_scrollable"
                            {...VANILLA_SCROLLABLE_RESERVE_PROPS}
                        >
                            <div className="xtm-whatsNewDialog_scrollRow">
                                {thumbnailUrl ? (
                                    <img
                                        className="xtm-whatsNewDialog_thumbnail"
                                        src={thumbnailUrl}
                                        alt=""
                                    />
                                ) : null}
                                <div className="xtm-whatsNewDialog_body">
                                    <FormattedParagraphs
                                        renderer={renderer}
                                        text={changelogMarkdown}
                                        onLinkSelect={openWhatsNewLink}
                                    />
                                </div>
                            </div>
                        </Scrollable>
                        <div className="xtm-whatsNewDialog_footer">
                            <div className="xtm-whatsNewDialog_checkboxRow">
                                <Checkbox
                                    checked={showOnNewVersion}
                                    onChange={onCheckboxChange}
                                />
                                <span className="xtm-whatsNewDialog_checkboxLabel">
                                    {translate("whatsNew.showOnFuture")}
                                </span>
                            </div>
                            <div className="k45_dialogBtns xtm-whatsNewDialog_actions">
                                <button type="button" className="negativeBtn" onClick={onReadLater}>
                                    {translate("whatsNew.readLater")}
                                </button>
                                <button type="button" className="positiveBtn" onClick={onOk}>
                                    {translate("whatsNew.ok")}
                                </button>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </Portal>
    );
}
