import type { SpotifyConnectResult } from "@standin/contracts";
import { buildWebRootUrl } from "@/lib/oauth/buildWebRootUrl";

/**
 * Where the browser goes after the callback: the web root with the result in
 * `?spotify=`, which the app reads once and removes.
 */
export const buildSpotifyWebRedirectUrl = (
    result: SpotifyConnectResult
): string => buildWebRootUrl({ spotify: result });
