import { Entity } from "@klyte45/vuio-commons";
import { game } from "cs2/bindings";

export type OverviewScreenMode = "listing" | "fareGroups" | "occupancyPassengers" | "occupancyCargo";

/** Survives Transportation Overview remounts within the session. */
let persistedOverviewMode: OverviewScreenMode = "listing";
let pendingFareGroup: Entity | null = null;
let forceXtmListing = false;
let pendingFareGroupToken = 0;
let overviewModeToken = 0;
const pendingFareGroupListeners = new Set<() => void>();
const forceXtmListingListeners = new Set<() => void>();
const overviewModeListeners = new Set<() => void>();

export function getPersistedOverviewMode(): OverviewScreenMode {
    return persistedOverviewMode;
}

export function getOverviewModeToken(): number {
    return overviewModeToken;
}

export function setPersistedOverviewMode(mode: OverviewScreenMode): void {
    if (persistedOverviewMode === mode) return;
    persistedOverviewMode = mode;
    overviewModeToken += 1;
    for (const listener of overviewModeListeners) {
        listener();
    }
}

export function subscribeOverviewMode(listener: () => void): () => void {
    overviewModeListeners.add(listener);
    return () => {
        overviewModeListeners.delete(listener);
    };
}

export function getPendingFareGroupToken(): number {
    return pendingFareGroupToken;
}

export function consumePendingFareGroup(): Entity | null {
    const group = pendingFareGroup;
    pendingFareGroup = null;
    return group;
}

export function consumeForceXtmListing(): boolean {
    if (!forceXtmListing) return false;
    forceXtmListing = false;
    return true;
}

export function subscribeForceXtmListing(listener: () => void): () => void {
    forceXtmListingListeners.add(listener);
    return () => {
        forceXtmListingListeners.delete(listener);
    };
}

export function subscribePendingFareGroup(listener: () => void): () => void {
    pendingFareGroupListeners.add(listener);
    return () => {
        pendingFareGroupListeners.delete(listener);
    };
}

/** Open Transportation Overview on Fare Groups and select the given group. */
export function openFareGroupEditor(group: Entity): void {
    if (!group) return;
    setPersistedOverviewMode("fareGroups");
    pendingFareGroup = group;
    pendingFareGroupToken += 1;
    forceXtmListing = true;
    for (const listener of forceXtmListingListeners) {
        listener();
    }
    for (const listener of pendingFareGroupListeners) {
        listener();
    }
    game.showTransportationOverviewPanel(game.TransportationOverviewPanelTab.PublicTransport);
}
