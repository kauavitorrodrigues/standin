import type { NextFunction, Response } from "express";
import { BaseError, type ServiceTokenScope } from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendUnauthorizedError } from "@/utils/sendError";
import { authenticateFromRequest } from "@/features/auth/services/authenticateFromRequest";
import type { AuthenticateOptions } from "@/types/authenticate";

const buildAuthMiddleware =
    (options: AuthenticateOptions) =>
    async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        try {
            const user = await authenticateFromRequest(req, options);
            if (!user) return sendUnauthorizedError(res);
            req.user = user;
            next();
        } catch (error) {
            // A service token that is revoked, expired or out of scope says why.
            // Anything else is a bug and goes to the error handler.
            if (!(error instanceof BaseError)) throw error;
            return sendError({ res, reportError: error });
        }
    };

// Session only (JWT or cookie): a service token is refused here.
const requiresSession = buildAuthMiddleware({});

// Also accepts a service token that has the scope. A session passes too, the
// scope only limits tokens.
const scoped = (scope: ServiceTokenScope) => buildAuthMiddleware({ scope });

export const RequiresAuth = Object.assign(requiresSession, { scoped });
