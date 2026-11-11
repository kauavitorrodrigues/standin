import {
    EMBEDDED_WEBSITE_FALLBACK_URL,
    EMBEDDED_WEBSITE_MODES,
} from "../consts";
import type { EmbeddedWebsiteParams } from "../schemas";
import type { EmbeddedWebsiteOptions } from "../types";
import { deriveSuffix } from "./deriveSuffix";
import { parseEmbeddedWebsiteUrl } from "./parseEmbeddedWebsiteUrl";

/**
 * The address to put in the frame of an object. A stored value that is no
 * longer valid (an older rule, an edited row) gives the fixed fallback
 * instead of the stored text.
 */
export const resolveEmbeddedUrl = (
    objectId: string,
    params: EmbeddedWebsiteParams,
    options: EmbeddedWebsiteOptions = {}
): string => {
    const address =
        params.mode === EMBEDDED_WEBSITE_MODES.URL
            ? params.url
            : `${params.prefix}${deriveSuffix(objectId)}`;
    const result = parseEmbeddedWebsiteUrl(address, options);
    return result.ok ? result.url : EMBEDDED_WEBSITE_FALLBACK_URL;
};
