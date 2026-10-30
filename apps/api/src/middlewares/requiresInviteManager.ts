import type { NextFunction, Response } from "express";
import { ORGANIZATION_MEMBER_ROLES, USER_ROLES } from "@standin/contracts";
import { OrganizationService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";

/**
 * Who may make and close the invite links of an organization: its owner, and
 * the instance admin (who may not be a member). Anyone else, and an
 * organization that does not exist, gets the same 403.
 */
export const RequiresInviteManager = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) return sendForbiddenError(res);

    const params = parseSchema(paramsSchema("organizationId"), req.params, res);
    if (!params) return;

    try {
        const membership = await OrganizationService.findMembership(
            req.user.id,
            params.organizationId
        );
        if (membership?.role === ORGANIZATION_MEMBER_ROLES.OWNER) return next();

        if (req.user.role !== USER_ROLES.ADMIN) return sendForbiddenError(res);

        const organization = await OrganizationService.findById(
            params.organizationId
        );
        if (!organization) return sendForbiddenError(res);
    } catch (error) {
        return sendError({ res, reportError: error });
    }

    next();
};
