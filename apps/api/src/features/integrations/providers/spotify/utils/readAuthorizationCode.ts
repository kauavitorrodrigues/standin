import type { Request } from "express";
import { SpotifyAuthorizationDeniedError } from "@standin/contracts";
import { readQueryString } from "@/lib/oauth/readQueryString";

/**
 * The code Spotify sent back. An `error` (the person said no) or no code at
 * all is a `SpotifyAuthorizationDeniedError`.
 */
export const readAuthorizationCode = (req: Request): string => {
    if (readQueryString(req.query.error)) {
        throw new SpotifyAuthorizationDeniedError();
    }

    const code = readQueryString(req.query.code);
    if (!code) throw new SpotifyAuthorizationDeniedError();

    return code;
};
