import { createHash, randomBytes } from "node:crypto";

/** 32 random bytes in base64url: unguessable, safe in a URL. Never logged. */
export const generateInviteToken = (): string =>
    randomBytes(32).toString("base64url");

/**
 * What the database keeps of a token. The token is already random and long, so
 * a plain SHA-256 is enough: the hash cannot be turned back into a link, and
 * the same token always gives the same hash to look it up by.
 */
export const hashInviteToken = (token: string): string =>
    createHash("sha256").update(token).digest("hex");
