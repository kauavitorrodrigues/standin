import { createHash, timingSafeEqual } from "node:crypto";
import { OAUTH_STATE_COOKIE_SEPARATOR } from "./consts";

const hash = (value: string) => createHash("sha256").update(value).digest();

/**
 * Whether the `state` of the callback is the one in the cookie. It compares
 * the digests, so the check takes the same time whatever the input.
 */
export const isSameState = (expected: string, received: unknown): boolean => {
    if (typeof received !== "string") return false;

    return timingSafeEqual(hash(expected), hash(received));
};

/**
 * The parts of the cookie, or null when it is missing, is not text, has
 * another number of parts or an empty one.
 */
export const splitOAuthCookie = (
    raw: unknown,
    expectedParts: number
): string[] | null => {
    if (typeof raw !== "string") return null;

    const parts = raw.split(OAUTH_STATE_COOKIE_SEPARATOR);
    if (parts.length !== expectedParts) return null;
    if (parts.some((part) => !part)) return null;

    return parts;
};
