import type { NextFunction, Response } from "express";
import { can, resolveRoles, type Action, type Resource } from "@standin/auth";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";

export const RequiresPermission = (action: Action, resource: Resource) => {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);

        const roles = resolveRoles(req.user, req.organizationMembership?.role);
        const permission = can(roles, action, resource);
        if (!permission.success) {
            return sendError({ res, code: 403, message: permission.error });
        }

        next();
    };
};
