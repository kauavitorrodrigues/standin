import type { NextFunction, Response } from "express";
import { OrganizationOwnerOnlyError } from "@standin/contracts";
import { OrganizationService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";

/**
 * Only the owner of the organization of the route. It runs after
 * `RequiresOrgMember`, which finds the membership. The instance admin gets no
 * implicit access here, like the other routes of an organization.
 */
export const RequiresOrgOwner = (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.organizationMembership) return sendForbiddenError(res);
    if (!OrganizationService.isOwner(req.organizationMembership)) {
        return sendError({
            res,
            reportError: new OrganizationOwnerOnlyError(),
        });
    }

    next();
};
