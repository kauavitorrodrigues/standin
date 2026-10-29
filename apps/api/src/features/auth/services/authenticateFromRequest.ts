import type { Request } from "express";
import { ServiceTokenService } from "@standin/core";
import { extractBearerToken } from "@/lib/jwt";
import type { AuthenticateOptions } from "@/types/authenticate";
import { authenticateFromServiceToken } from "./authenticateFromServiceToken";
import { authenticateFromToken } from "./authenticateFromToken";

export const authenticateFromRequest = async (
    req: Request,
    options: AuthenticateOptions = {}
) => {
    const bearer = extractBearerToken(req.headers.authorization);

    // A service token only travels in the header, never in the cookie, and
    // only a route that names a scope accepts it.
    if (bearer && ServiceTokenService.isServiceToken(bearer)) {
        if (!options.scope) return false;
        return authenticateFromServiceToken(bearer, options.scope);
    }

    const token = bearer ?? req.cookies?.token;
    if (!token) return false;

    return authenticateFromToken(token);
};
