// Normally VITE_BASE_API_URL is the API's full origin. In LAN mode (see the
// `dev:lan` script) it is a path prefix ("/api") that the Vite dev server
// proxies to the API, so the page and the API share one https origin.
const configuredApiUrl: string | undefined = import.meta.env.VITE_BASE_API_URL;

if (configuredApiUrl === undefined) {
    throw new Error(
        "VITE_BASE_API_URL is not set. Copy it from .env.example into .env."
    );
}

export const API_BASE_URL: string = configuredApiUrl;

const isProxied = API_BASE_URL.startsWith("/");

// socket.io treats a path in the url as a namespace, so a proxied API has to
// be addressed by origin plus a custom engine path instead.
export const SOCKET_URL = isProxied ? window.location.origin : API_BASE_URL;
export const SOCKET_PATH_OPTIONS = isProxied
    ? { path: `${API_BASE_URL}/socket.io` }
    : {};
