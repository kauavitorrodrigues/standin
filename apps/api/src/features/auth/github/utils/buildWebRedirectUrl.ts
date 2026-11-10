import { buildWebRootUrl } from "@/lib/oauth/buildWebRootUrl";

/**
 * Where the browser goes after the callback: the web root, which sends a
 * signed in person on to the app. With an error code the root is the login
 * page, which reads `?error=`.
 */
export const buildWebRedirectUrl = (errorCode?: string): string =>
    buildWebRootUrl(errorCode ? { error: errorCode } : {});
