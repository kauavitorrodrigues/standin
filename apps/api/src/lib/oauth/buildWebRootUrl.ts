/**
 * The web root with some query parameters, for where the browser goes after a
 * callback. It uses `FRONTEND_URL`, the same origin the CORS setting trusts.
 */
export const buildWebRootUrl = (params: Record<string, string>): string => {
    const url = new URL(process.env.FRONTEND_URL as string);
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
    url.search = "";
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    return url.toString();
};
