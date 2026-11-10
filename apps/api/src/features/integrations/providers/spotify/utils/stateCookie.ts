import type { Request, Response } from "express";
import { SpotifyStateInvalidError } from "@standin/contracts";
import {
    consumeOAuthCookie,
    createOAuthRandomValue,
    writeOAuthCookie,
} from "@/lib/oauth/stateCookie";
import { SPOTIFY_STATE_COOKIE, SPOTIFY_STATE_COOKIE_PARTS } from "../consts";
import type { SpotifyStateCookie } from "../types";

/** A fresh `state` for one connection attempt. */
export const createSpotifyState = (): string => createOAuthRandomValue();

/**
 * Keeps the attempt in a short lived httpOnly cookie until the callback: the
 * `state` and who is connecting to which organization. The address of Spotify
 * is fixed, so the organization cannot travel in it.
 */
export const writeSpotifyStateCookie = (
    res: Response,
    { state, organizationId, userId }: SpotifyStateCookie
) => {
    writeOAuthCookie(res, SPOTIFY_STATE_COOKIE, [
        state,
        organizationId,
        userId,
    ]);
};

/**
 * Checks the `state` of the callback against the cookie and returns the
 * attempt. The cookie is single use, so it is cleared on every try. A missing
 * or malformed cookie or a different `state` is a `SpotifyStateInvalidError`.
 */
export const consumeSpotifyStateCookie = (
    req: Request,
    res: Response,
    receivedState: unknown
): SpotifyStateCookie => {
    const parts = consumeOAuthCookie(
        req,
        res,
        SPOTIFY_STATE_COOKIE,
        receivedState,
        SPOTIFY_STATE_COOKIE_PARTS
    );
    if (!parts) throw new SpotifyStateInvalidError();

    const [state, organizationId, userId] = parts;
    return { state, organizationId, userId };
};
