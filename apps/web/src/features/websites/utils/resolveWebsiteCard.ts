import {
    EMBEDDED_WEBSITE_FALLBACK_URL,
    resolveEmbeddedUrl,
    type PlacedAsset,
} from "@standin/contracts";
import type { WebsiteCardData } from "../types/website";

/**
 * What the card of a placed object shows: the final address, or nothing to
 * open when the stored one is no longer valid. An object without params has no
 * card at all.
 */
export const resolveWebsiteCard = (
    placed: readonly Pick<PlacedAsset, "id" | "behaviorParams">[],
    objectId: string,
    appOrigins: string[]
): WebsiteCardData | null => {
    const item = placed.find((candidate) => candidate.id === objectId);
    if (!item?.behaviorParams) return null;

    const url = resolveEmbeddedUrl(objectId, item.behaviorParams, {
        appOrigins,
    });
    if (url === EMBEDDED_WEBSITE_FALLBACK_URL) return { kind: "unavailable" };

    return { kind: "available", url, host: new URL(url).host };
};
