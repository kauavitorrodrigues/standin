import type { WebsitePreview } from "@standin/contracts";
import { HTML_TYPES, ICON_TYPES, WEBSITE_PREVIEW_LIMITS } from "../consts";
import type { FetchResource } from "../types";
import { parsePageMetadata } from "../utils/parsePageMetadata";
import { pickIconUrl } from "../utils/pickIconUrl";
import { fetchPublicResource } from "./fetchPublicResource";

export const EMPTY_WEBSITE_PREVIEW: WebsitePreview = {
    title: null,
    faviconDataUrl: null,
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
 * Reads the title and the icon of a page. It never fails: a page that cannot
 * be read, or an icon that cannot, leaves that part null, since the preview
 * only dresses the card and the person can still open the site.
 */
export const loadWebsitePreview = async (
    url: string,
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
        };
    } catch {
        return EMPTY_WEBSITE_PREVIEW;
    }
};
