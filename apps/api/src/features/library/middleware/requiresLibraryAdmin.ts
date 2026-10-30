import type { NextFunction, Response } from "express";
import { z } from "zod/v4";
import { ScopeForbiddenError, USER_ROLES } from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import { parseSchema } from "@/utils/parseSchema";
import { sendError, sendForbiddenError } from "@/utils/sendError";

const scopeQuerySchema = z.object({
    organizationId: z.string().min(1).optional(),
});

/**
 * The global library is written by the admin. The role comes from the
 * user cache (30s TTL, not invalidated when a role changes), so a demotion
 * takes up to that long to apply. The scope is never chosen by the client: an
 * `organizationId` is refused with 403 `SCOPE_FORBIDDEN`, since the library of
 * an organization has its own mount (see `RequiresLibraryOwner`).
 */
export const RequiresLibraryAdmin = (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
        return sendForbiddenError(res);
    }

    const query = parseSchema(scopeQuerySchema, req.query, res);
    if (!query) return;
    if (query.organizationId !== undefined) {
        return sendError({ res, reportError: new ScopeForbiddenError() });
    }

    req.libraryScope = { organizationId: null };
    next();
};
