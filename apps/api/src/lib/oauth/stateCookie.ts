import { randomBytes } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import {
    OAUTH_RANDOM_BYTES,
    OAUTH_STATE_COOKIE_MAX_AGE_MS,
    OAUTH_STATE_COOKIE_SEPARATOR,
} from "./consts";
import { isSameState, splitOAuthCookie } from "./helpers";

const cookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
});

/** A fresh random value for a `state` or a PKCE verifier. */
export const createOAuthRandomValue = (): string =>
    randomBytes(OAUTH_RANDOM_BYTES).toString("base64url");

/**
 * Keeps the attempt in a short lived httpOnly cookie until the callback. The
 * first part is the `state`.
 */
export const writeOAuthCookie = (
    res: Response,
    name: string,
    parts: string[]
) => {
    res.cookie(name, parts.join(OAUTH_STATE_COOKIE_SEPARATOR), {
        ...cookieOptions(),
        maxAge: OAUTH_STATE_COOKIE_MAX_AGE_MS,
    });
};

/**
 * Checks the `state` of the callback against the first part of the cookie and
 * returns the parts, or null when it is missing, malformed, has another number
 * of parts or a different `state`. The cookie is single use, so it is cleared
 * on every try.
 */
export const consumeOAuthCookie = (
    req: Request,
    res: Response,
    name: string,
    receivedState: unknown,
    expectedParts: number
): string[] | null => {
    const raw: unknown = req.cookies?.[name];
    res.clearCookie(name, cookieOptions());

    const parts = splitOAuthCookie(raw, expectedParts);
    if (!parts) return null;
    if (!isSameState(parts[0], receivedState)) return null;

    return parts;
};
