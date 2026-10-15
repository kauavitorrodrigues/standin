import type { NextFunction, Response } from "express";
import { ROLES } from "@standin/contracts";
import { resolveRoles } from "@standin/auth";
import type { ExtendedRequest } from "@/types/request";
import { sendForbiddenError } from "@/utils/sendError";

/**
 * After `RequiresOrgMember`: the library of an organization is written by its
 * owner only. The admin has no implicit access to an organization, so the
 * role is the membership one. The scope is the organization of the URL.
 */
export const RequiresLibraryOwner = (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    const membership = req.organizationMembership;
    if (!req.user || !membership) return sendForbiddenError(res);

    const roles = resolveRoles(req.user, membership.role);
    if (!roles.includes(ROLES.OWNER)) return sendForbiddenError(res);

    req.libraryScope = { organizationId: membership.organizationId };
    next();
};
