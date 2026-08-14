import { TransportType } from "#enum/TransportType";
import { AutoColorService } from "#service/AutoColorService";

const MAGENTA = "#FF00FF";
const cache = new Map<string, string>();

function cacheKey(type: TransportType, isCargo: boolean): string {
    return `${type}.${isCargo}`;
}

/** Resolve default line color for a transport type (cached). Magenta on failure. */
export async function getTransportTypeDefaultColor(
    type: TransportType,
    isCargo: boolean,
): Promise<string> {
    const key = cacheKey(type, isCargo);
    const hit = cache.get(key);
    if (hit) return hit;
    try {
        const color = await AutoColorService.defaultLineColor(type, isCargo);
        const resolved = color?.startsWith("#") ? color : MAGENTA;
        // Do not permanently cache failure magenta — allow retry after backend fix/reload.
        if (resolved !== MAGENTA) {
            cache.set(key, resolved);
        }
        return resolved;
    } catch {
        return MAGENTA;
    }
}

export function clearTransportTypeColorCache(): void {
    cache.clear();
}
