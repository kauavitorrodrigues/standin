import type { WebsitePreview } from "@standin/contracts";
import { HTML_TYPES, ICON_TYPES, WEBSITE_PREVIEW_LIMITS } from "../consts";
import type { FetchResource } from "../types";
import { canEmbedInFrame } from "../utils/canEmbedInFrame";
import { parsePageMetadata } from "../utils/parsePageMetadata";
import { pickIconUrl } from "../utils/pickIconUrl";
import { fetchPublicResource } from "./fetchPublicResource";

// A page that could not be read says nothing against being shown, so the
// person is let try and the frame reports its own failure.
export const EMPTY_WEBSITE_PREVIEW: WebsitePreview = {
    title: null,
    faviconDataUrl: null,
    canEmbed: true,
};

const readIcon = async (
    url: string | null,
    fetchResource: FetchResource
): Promise<string | null> => {
    if (!url) return null;

    try {
        const icon = await fetchResource(url, {
            acceptedTypes: ICON_TYPES,
            maxBytes: WEBSITE_PREVIEW_LIMITS.MAX_ICON_BYTES,
            overflow: "reject",
        });
        if (icon.body.length === 0) return null;

        return `data:${icon.contentType};base64,${icon.body.toString("base64")}`;
    } catch {
        return null;
    }
};

/**
 * Reads the title, the icon and whether the site accepts a frame. It never
 * fails: a page that cannot be read, or an icon that cannot, leaves that part
 * null, since the preview only dresses the card and the person can still open
 * the site. The origins are the ones of the app, which the frame would sit on.
 */
export const loadWebsitePreview = async (
    url: string,
    appOrigins: readonly string[],
    fetchResource: FetchResource = fetchPublicResource
): Promise<WebsitePreview> => {
    try {
        const page = await fetchResource(url, {
            acceptedTypes: HTML_TYPES,
            maxBytes: WEBSITE_PREVIEW_LIMITS.MAX_HTML_BYTES,
            overflow: "truncate",
        });
        const metadata = parsePageMetadata(page.body.toString("utf8"));
        const iconUrl = pickIconUrl(metadata.iconHrefs, page.finalUrl);

        return {
            title: metadata.title,
            faviconDataUrl: await readIcon(iconUrl, fetchResource),
            canEmbed: appOrigins.every((origin) =>
                canEmbedInFrame(page.frameHeaders, origin)
            ),
        };
    } catch {
        return EMPTY_WEBSITE_PREVIEW;
    }
};
