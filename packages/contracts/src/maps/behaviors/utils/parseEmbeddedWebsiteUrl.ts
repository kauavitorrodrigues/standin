import { EMBEDDED_WEBSITE_URL_MAX, FORBIDDEN_URL_PROTOCOLS } from "../consts";
import type {
    EmbeddedWebsiteOptions,
    EmbeddedWebsiteUrlResult,
} from "../types";
import { toEmbeddableUrl } from "./toEmbeddableUrl";

const invalid: EmbeddedWebsiteUrlResult = { ok: false, reason: "invalid" };

/**
 * Checks an address typed for an embedded website and returns the one to put
 * in the frame: https only, no script or data schemes, at most 2048
 * characters, never the origin of the app itself. Known providers come back in
 * their embeddable form.
 */
export const parseEmbeddedWebsiteUrl = (
    value: string,
    options: EmbeddedWebsiteOptions = {}
): EmbeddedWebsiteUrlResult => {
    const text = value.trim();
    if (text.length === 0 || text.length > EMBEDDED_WEBSITE_URL_MAX) {
        return invalid;
    }

    const parsed = URL.canParse(text) ? new URL(text) : null;
    if (!parsed) return invalid;
    if (FORBIDDEN_URL_PROTOCOLS.includes(parsed.protocol)) return invalid;
    if (parsed.protocol !== "https:") return invalid;
    // A login in the address would be sent to the site along with the page.
    if (parsed.username || parsed.password) return invalid;

    const own = (options.appOrigins ?? []).some(
        (origin) =>
            URL.canParse(origin) && new URL(origin).origin === parsed.origin
    );
    if (own) return { ok: false, reason: "own_origin" };

    const url = toEmbeddableUrl(parsed);
    if (url.length > EMBEDDED_WEBSITE_URL_MAX) return invalid;
    return { ok: true, url };
};
