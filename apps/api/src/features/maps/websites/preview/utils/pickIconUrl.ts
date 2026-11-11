import { WEBSITE_PREVIEW_LIMITS } from "../consts";

// Only an https address on the default port is an icon worth fetching.
const toIconUrl = (href: string, base: string): string | null => {
    if (!URL.canParse(href, base)) return null;

    const url = new URL(href, base);
    const isDefaultPort =
        url.port === "" || url.port === String(WEBSITE_PREVIEW_LIMITS.PORT);
    if (url.protocol !== "https:" || !isDefaultPort) return null;
    return url.href;
};

/**
 * The address of the icon to fetch: the first one the page declares that can
 * be used, resolved against the page that declared it, else `/favicon.ico`.
 */
export const pickIconUrl = (iconHrefs: readonly string[], pageUrl: string) => {
    for (const href of iconHrefs) {
        const url = toIconUrl(href, pageUrl);
        if (url) return url;
    }
    return toIconUrl("/favicon.ico", pageUrl);
};
