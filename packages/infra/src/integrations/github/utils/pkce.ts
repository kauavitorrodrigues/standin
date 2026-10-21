import { createHash } from "node:crypto";

// Part of the OAuth protocol the provider speaks, so it lives here: the API
// makes the random verifier, the provider turns it into the challenge.

/** The S256 challenge of a PKCE verifier (RFC 7636). */
export const buildCodeChallenge = (verifier: string): string =>
    createHash("sha256").update(verifier).digest("base64url");
