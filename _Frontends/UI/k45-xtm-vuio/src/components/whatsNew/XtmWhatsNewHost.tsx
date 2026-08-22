import { useEffect, useRef, useState } from "react";
import { XtmWhatsNewDialog } from "./XtmWhatsNewDialog";
import {
    subscribeWhatsNewShow,
    waitForPendingWhatsNew,
    WhatsNewShowPayload,
} from "./whatsNewService";

let engineUnsubscribe: (() => void) | null = null;
const showListeners = new Set<(payload: WhatsNewShowPayload) => void>();
let activeHostId: number | null = null;
let nextHostId = 0;

function ensureEngineSubscription() {
    if (engineUnsubscribe) {
        return;
    }
    engineUnsubscribe = subscribeWhatsNewShow((next) => {
        for (const listener of showListeners) {
            listener(next);
        }
    });
}

function releaseEngineSubscription() {
    if (showListeners.size === 0 && engineUnsubscribe) {
        engineUnsubscribe();
        engineUnsubscribe = null;
    }
}

async function syncPendingShow(
    onShow: (payload: WhatsNewShowPayload) => void,
    isCancelled: () => boolean,
) {
    const pending = await waitForPendingWhatsNew(isCancelled);
    if (pending && !isCancelled()) {
        onShow(pending);
    }
}

export function XtmWhatsNewHost() {
    const hostIdRef = useRef(0);
    if (hostIdRef.current === 0) {
        hostIdRef.current = ++nextHostId;
    }
    const hostId = hostIdRef.current;

    const [payload, setPayload] = useState<WhatsNewShowPayload | null>(null);
    const [showOnNewVersion, setShowOnNewVersionLocal] = useState(true);

    useEffect(() => {
        ensureEngineSubscription();

        if (activeHostId === null) {
            activeHostId = hostId;
        }

        let cancelled = false;
        const isCancelled = () => cancelled;

        const onShow = (next: WhatsNewShowPayload) => {
            if (activeHostId !== hostId) {
                return;
            }
            setShowOnNewVersionLocal(next.showOnNewVersion);
            setPayload(next);
        };

        showListeners.add(onShow);
        void syncPendingShow(onShow, isCancelled);

        return () => {
            cancelled = true;
            showListeners.delete(onShow);
            if (activeHostId === hostId) {
                activeHostId = null;
            }
            releaseEngineSubscription();
        };
    }, [hostId]);

    if (activeHostId !== hostId || !payload) {
        return null;
    }

    return (
        <XtmWhatsNewDialog
            version={payload.version}
            changelogMarkdown={payload.changelogMarkdown}
            thumbnailUrl={payload.thumbnailUrl}
            showOnNewVersion={showOnNewVersion}
            onShowOnNewVersionChange={setShowOnNewVersionLocal}
            onClose={() => setPayload(null)}
        />
    );
}
