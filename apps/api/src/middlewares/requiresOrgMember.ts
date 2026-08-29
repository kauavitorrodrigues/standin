import type { NextFunction, Response } from "express";
import { OrganizationService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";

export const RequiresOrgMember = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
) => {
    if (!req.user) return;

    const params = parseSchema(paramsSchema("organizationId"), req.params, res);
    if (!params) return;

    const membership = await OrganizationService.findMembership(
        req.user.id,
        params.organizationId,
    );

    if (!membership) return sendForbiddenError(res);

    req.organizationMembership = membership;
    next();
};

export const RequiresOrgOwner = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
) => {
    if (!req.organizationMembership) return;

    if (!OrganizationService.isOwner(req.organizationMembership)) {
        return sendForbiddenError(res);
    }

    next();
};
