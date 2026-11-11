import { EMBEDDED_WEBSITE_MODES } from "../consts";
import { ObjectBehaviorErrorMessages as Messages } from "../error-messages";
import type { EmbeddedWebsiteParams } from "../schemas";
import type {
    BehaviorParamsValidation,
    EmbeddedWebsiteOptions,
} from "../types";
import { deriveSuffix } from "./deriveSuffix";
import { parseEmbeddedWebsiteUrl } from "./parseEmbeddedWebsiteUrl";

const REASON_MESSAGES = {
    invalid: Messages.url.invalid,
    own_origin: Messages.url.ownOrigin,
} as const;

const check = (
    address: string,
    options: EmbeddedWebsiteOptions
): BehaviorParamsValidation => {
    const result = parseEmbeddedWebsiteUrl(address, options);
    if (result.ok) return { ok: true };
    return { ok: false, message: REASON_MESSAGES[result.reason] };
};

/**
 * The part the shape cannot say: whether the address the params carry is safe
 * to show. In derived mode the prefix and a sample suffix are checked
 * together, so the final address is what gets validated.
 */
export const validateBehaviorParams = (
    params: EmbeddedWebsiteParams,
    options: EmbeddedWebsiteOptions = {}
): BehaviorParamsValidation => {
    if (params.mode === EMBEDDED_WEBSITE_MODES.URL) {
        return check(params.url, options);
    }

    // The suffix may only land in the path, the query or the fragment: a
    // prefix that stops inside the host would give each object another host,
    // and the own-origin check would only have seen the sample one.
    const first = check(`${params.prefix}${deriveSuffix("sample-a")}`, options);
    if (!first.ok) return first;
    const second = check(
        `${params.prefix}${deriveSuffix("sample-b")}`,
        options
    );
    if (!second.ok) return second;
    const sameHost =
        new URL(`${params.prefix}${deriveSuffix("sample-a")}`).host ===
        new URL(`${params.prefix}${deriveSuffix("sample-b")}`).host;
    return sameHost
        ? { ok: true }
        : { ok: false, message: Messages.prefix.invalid };
};
