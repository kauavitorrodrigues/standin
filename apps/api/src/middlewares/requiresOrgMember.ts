import type { NextFunction, Response } from "express";
import { USER_ROLES } from "@standin/contracts";
import { OrganizationService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";

export const RequiresOrgMember = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) return;

    const params = parseSchema(paramsSchema("organizationId"), req.params, res);
    if (!params) return;

    const membership = await OrganizationService.findMembership(
        req.user.id,
        params.organizationId
    );

    // Admins manage every organization, with or without a membership.
    if (!membership && req.user.role !== USER_ROLES.ADMIN) {
        return sendForbiddenError(res);
    }

    req.organizationMembership = membership ?? undefined;
    next();
};
