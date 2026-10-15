import type { NextFunction, Response } from "express";
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

    // The admin has no implicit access to organizations, only members do.
    if (!membership) return sendForbiddenError(res);

    req.organizationMembership = membership;
    next();
};
