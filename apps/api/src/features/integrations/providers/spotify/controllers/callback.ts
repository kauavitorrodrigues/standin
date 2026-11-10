import type { Response } from "express";
import { SPOTIFY_CONNECT_RESULTS } from "@standin/contracts";
import { SpotifyService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { assertValidAttempt } from "../utils/assertValidAttempt";
import { buildSpotifyRedirectUri } from "../utils/buildRedirectUri";
import { buildSpotifyWebRedirectUrl } from "../utils/buildWebRedirectUrl";
import { readAuthorizationCode } from "../utils/readAuthorizationCode";
import { resolveSpotifyConnectResult } from "../utils/resolveConnectResult";
import { consumeSpotifyStateCookie } from "../utils/stateCookie";

// The browser comes back from Spotify, so every outcome is a redirect, never
// JSON.
export const spotifyCallback = async (req: ExtendedRequest, res: Response) => {
    try {
        const attempt = consumeSpotifyStateCookie(req, res, req.query.state);
        await assertValidAttempt(req, attempt);
        const code = readAuthorizationCode(req);

        await SpotifyService.completeConnection({
            organizationId: attempt.organizationId,
            userId: attempt.userId,
            redirectUri: buildSpotifyRedirectUri(),
            code,
        });

        res.redirect(
            buildSpotifyWebRedirectUrl(SPOTIFY_CONNECT_RESULTS.CONNECTED)
        );
    } catch (error) {
        console.error("[Spotify] connection failed:", error);
        res.redirect(
            buildSpotifyWebRedirectUrl(resolveSpotifyConnectResult(error))
        );
    }
};
