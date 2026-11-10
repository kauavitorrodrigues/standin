import type { Response } from "express";
import { SpotifyService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import type { ExtendedRequest } from "@/types/request";
import { buildSpotifyRedirectUri } from "../utils/buildRedirectUri";
import { buildSpotifyWebRedirectUrl } from "../utils/buildWebRedirectUrl";
import { resolveSpotifyConnectResult } from "../utils/resolveConnectResult";
import {
    createSpotifyState,
    writeSpotifyStateCookie,
} from "../utils/stateCookie";

// The browser navigates here, so every outcome is a redirect, never JSON.
export const startSpotifyConnection = async (
    req: ExtendedRequest,
    res: Response
) => {
    if (!req.user) return;
    const params = parseSchema(paramsSchema("organizationId"), req.params, res);
    if (!params) return;

    try {
        const state = createSpotifyState();
        const url = await SpotifyService.startConnection({
            organizationId: params.organizationId,
            userId: req.user.id,
            redirectUri: buildSpotifyRedirectUri(),
            state,
        });

        writeSpotifyStateCookie(res, {
            state,
            organizationId: params.organizationId,
            userId: req.user.id,
        });

        res.redirect(url);
    } catch (error) {
        console.error("[Spotify] could not start the connection:", error);
        res.redirect(
            buildSpotifyWebRedirectUrl(resolveSpotifyConnectResult(error))
        );
    }
};
