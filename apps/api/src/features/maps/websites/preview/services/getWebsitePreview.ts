import { MapService } from "@standin/core";
import type { WebsitePreview } from "@standin/contracts";
import { createTtlCache } from "@/lib/cache/createTtlCache";
import { WEBSITE_PREVIEW_CACHE } from "../consts";
import {
    EMPTY_WEBSITE_PREVIEW,
    loadWebsitePreview,
} from "./loadWebsitePreview";

// Keyed by the address, so every object that points at one page shares it.
const found = createTtlCache<WebsitePreview>({
    ttlMs: WEBSITE_PREVIEW_CACHE.TTL_MS,
    maxEntries: WEBSITE_PREVIEW_CACHE.MAX_ENTRIES,
});
const missed = createTtlCache<WebsitePreview>({
    ttlMs: WEBSITE_PREVIEW_CACHE.MISS_TTL_MS,
    maxEntries: WEBSITE_PREVIEW_CACHE.MAX_ENTRIES,
});
// Many people clicking the same object at once cost one request to the site.
const pending = new Map<string, Promise<WebsitePreview>>();

const remember = (url: string, preview: WebsitePreview): WebsitePreview => {
    const isEmpty = preview.title === null && preview.faviconDataUrl === null;
    (isEmpty ? missed : found).set(url, preview);
    return preview;
};

/**
 * The title and icon of the website of a placed object. The address comes
 * from what is stored for the object, never from the request.
 */
export const getWebsitePreview = async (
    mapId: string,
    objectId: string,
    load: (url: string) => Promise<WebsitePreview> = loadWebsitePreview
): Promise<WebsitePreview> => {
    const url = await MapService.resolveWebsiteUrl(mapId, objectId);
    if (url === null) return EMPTY_WEBSITE_PREVIEW;

    const cached = found.get(url) ?? missed.get(url);
    if (cached) return cached;

    const running = pending.get(url);
    if (running) return running;

    const task = load(url)
        .then((preview) => remember(url, preview))
        .finally(() => pending.delete(url));
    pending.set(url, task);
    return task;
};
