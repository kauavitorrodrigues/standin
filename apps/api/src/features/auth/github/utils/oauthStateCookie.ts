import type { Request, Response } from "express";
import { OAuthStateInvalidError } from "@standin/contracts";
import {
    consumeOAuthCookie,
    createOAuthRandomValue,
    writeOAuthCookie,
} from "@/lib/oauth/stateCookie";
import {
    OAUTH_STATE_COOKIE,
    OAUTH_STATE_COOKIE_PARTS,
} from "../consts/oauthStateCookie";

export type OAuthStateSecrets = {
    state: string;
    verifier: string;
};

/** Makes the `state` and the PKCE verifier of one sign in attempt. */
export const createOAuthStateSecrets = (): OAuthStateSecrets => ({
    state: createOAuthRandomValue(),
    verifier: createOAuthRandomValue(),
});

/** Keeps both in a short lived httpOnly cookie until the callback. */
export const writeOAuthStateCookie = (
    res: Response,
    { state, verifier }: OAuthStateSecrets
) => {
    writeOAuthCookie(res, OAUTH_STATE_COOKIE, [state, verifier]);
};

/**
 * Checks the `state` of the callback against the cookie and returns the PKCE
 * verifier. The cookie is single use, so it is cleared on every try. A missing
 * cookie, a malformed one or a different `state` is an
 * `OAuthStateInvalidError`.
 */
export const consumeOAuthStateCookie = (
    req: Request,
    res: Response,
    receivedState: unknown
): string => {
    const parts = consumeOAuthCookie(
        req,
        res,
        OAUTH_STATE_COOKIE,
        receivedState,
        OAUTH_STATE_COOKIE_PARTS
    );
    if (!parts) throw new OAuthStateInvalidError();

    return parts[1];
};
