import engine from "cohtml/cohtml";

const SHOW_EVENT = "k45::xtm.whatsNew.show";

export type WhatsNewShowPayload = {
    version: string;
    changelogMarkdown: string;
    showOnNewVersion: boolean;
    thumbnailUrl: string | null;
};

function parseShowPayload(raw: unknown): WhatsNewShowPayload | null {
    if (!Array.isArray(raw) || raw.length < 3) {
        return null;
    }
    const [version, changelogMarkdown, showOnNewVersion, thumbnailUrl] = raw;
    if (typeof version !== "string" || typeof changelogMarkdown !== "string") {
        return null;
    }
    return {
        version,
        changelogMarkdown,
        showOnNewVersion: !!showOnNewVersion,
        thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : null,
    };
}

export function subscribeWhatsNewShow(listener: (payload: WhatsNewShowPayload) => void): () => void {
    const handler = (
        version: string,
        changelogMarkdown: string,
        showOnNewVersion: boolean,
        thumbnailUrl?: string,
    ) => {
        void (async () => {
            if (!(await canPresentWhatsNew())) {
                return;
            }
            listener({
                version,
                changelogMarkdown,
                showOnNewVersion: !!showOnNewVersion,
                thumbnailUrl: thumbnailUrl ?? null,
            });
        })();
    };
    engine.on(SHOW_EVENT, handler);
    return () => engine.off(SHOW_EVENT, handler);
}

export async function pullPendingWhatsNew(): Promise<WhatsNewShowPayload | null> {
    const raw = await engine.call("k45::xtm.whatsNew.pullPending");
    return parseShowPayload(raw);
}

export async function shouldShowWhatsNew(): Promise<boolean> {
    return !!(await engine.call("k45::xtm.whatsNew.shouldShow"));
}

export async function canPresentWhatsNew(): Promise<boolean> {
    return !!(await engine.call("k45::xtm.whatsNew.canPresent"));
}

const PENDING_POLL_MS = 250;

export async function waitForPendingWhatsNew(
    isCancelled: () => boolean,
): Promise<WhatsNewShowPayload | null> {
    while (!isCancelled()) {
        if (!(await shouldShowWhatsNew())) {
            return null;
        }

        if (await canPresentWhatsNew()) {
            const pending = await pullPendingWhatsNew();
            if (pending) {
                return pending;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, PENDING_POLL_MS));
    }

    return null;
}

export async function setShowOnNewVersion(value: boolean): Promise<void> {
    await engine.call("k45::xtm.whatsNew.setShowOnNewVersion", value);
}

export async function acknowledgeWhatsNew(): Promise<void> {
    await engine.call("k45::xtm.whatsNew.acknowledge");
}
