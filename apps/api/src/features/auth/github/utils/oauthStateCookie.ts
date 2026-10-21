import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { OAuthStateInvalidError } from "@standin/contracts";
import {
    OAUTH_RANDOM_BYTES,
    OAUTH_STATE_COOKIE,
    OAUTH_STATE_COOKIE_MAX_AGE_MS,
    OAUTH_STATE_COOKIE_SEPARATOR,
} from "../consts/oauthStateCookie";

export type OAuthStateSecrets = {
    state: string;
    verifier: string;
};

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
});

const randomValue = () => randomBytes(OAUTH_RANDOM_BYTES).toString("base64url");

const hash = (value: string) => createHash("sha256").update(value).digest();

// Compares the digests, so the check takes the same time whatever the input.
const isSame = (a: string, b: string) => timingSafeEqual(hash(a), hash(b));

/** Makes the `state` and the PKCE verifier of one sign in attempt. */
export const createOAuthStateSecrets = (): OAuthStateSecrets => ({
    state: randomValue(),
    verifier: randomValue(),
});

/** Keeps both in a short lived httpOnly cookie until the callback. */
export const writeOAuthStateCookie = (
    res: Response,
    { state, verifier }: OAuthStateSecrets
) => {
    res.cookie(
        OAUTH_STATE_COOKIE,
        `${state}${OAUTH_STATE_COOKIE_SEPARATOR}${verifier}`,
        { ...cookieOptions(), maxAge: OAUTH_STATE_COOKIE_MAX_AGE_MS }
    );
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
    const raw: unknown = req.cookies?.[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, cookieOptions());

    if (typeof raw !== "string" || typeof receivedState !== "string") {
        throw new OAuthStateInvalidError();
    }

    const [state, verifier, ...rest] = raw.split(OAUTH_STATE_COOKIE_SEPARATOR);
    if (!state || !verifier || rest.length > 0) {
        throw new OAuthStateInvalidError();
    }
    if (!isSame(state, receivedState)) throw new OAuthStateInvalidError();

    return verifier;
};
