type RefreshListener = () => void;

let xtmMapEnabled = true;
const listeners = new Set<RefreshListener>();

export function setXtmMapEnabled(enabled: boolean): void {
    xtmMapEnabled = enabled;
}

export function isXtmMapEnabled(): boolean {
    return xtmMapEnabled;
}

/** Subscribe the XTM linear map; returns unsubscribe. */
export function subscribeXtmLineMapRefresh(listener: RefreshListener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

let pendingRefreshTimer = 0;

/**
 * Refresh only the XTM linear map when it is enabled (no SIP clearSelection flash).
 * No-op when the vanilla line canvas is showing.
 * Optional delayMs: wait before fetching (number/acronym settle slower than the bind call returns).
 */
export function requestXtmLineMapRefresh(delayMs = 0): void {
    if (!xtmMapEnabled) return;
    if (delayMs > 0) {
        if (pendingRefreshTimer) window.clearTimeout(pendingRefreshTimer);
        pendingRefreshTimer = window.setTimeout(() => {
            pendingRefreshTimer = 0;
            requestXtmLineMapRefresh(0);
        }, delayMs);
        return;
    }
    listeners.forEach((listener) => {
        try {
            listener();
        } catch {
            /* ignore listener errors */
        }
    });
}
