// The API hands out absolute URLs for stored files (map JSON, tileset
// images), built from its own SERVER_URL, typically http://localhost:3001.
// That only works on the machine running the API. In LAN mode the page is
// served over https and reaches the API through a path prefix (see
// `dev:lan`), so those URLs are rebased onto that prefix: another computer
// then fetches them from the same origin as the page, and https never
// mixes with an http asset.
//
// Only URLs under the API's own static path are touched. Files kept in
// external storage (S3, a CDN) are already reachable from anywhere and must
// keep their address.
const LOCAL_STORAGE_PATH_PREFIX = "/public/";

export const rebaseAssetUrl = (url: string, apiBaseUrl: string): string => {
    if (!apiBaseUrl.startsWith("/")) return url;

    try {
        const { pathname, search } = new URL(url);
        if (!pathname.startsWith(LOCAL_STORAGE_PATH_PREFIX)) return url;

        return `${apiBaseUrl}${pathname}${search}`;
    } catch {
        return url;
    }
};
