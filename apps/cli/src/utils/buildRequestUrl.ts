import type { ApiCall } from "../types";

// The base, the path and the query as one URL.
export const buildRequestUrl = (base: string, call: ApiCall): string => {
    const url: URL = new URL(`${base}${call.path}`);
    for (const [name, value] of Object.entries(call.query ?? {})) {
        url.searchParams.set(name, String(value));
    }
    return url.toString();
};
