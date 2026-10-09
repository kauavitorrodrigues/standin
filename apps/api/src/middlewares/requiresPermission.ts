import type { NextFunction, Response } from "express";
import { can, resolveRole, type Action, type Resource } from "@standin/auth";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";

export const RequiresPermission = (action: Action, resource: Resource) => {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);

        const role = resolveRole(req.user, req.organizationMembership?.role);
        const permission = can(role, action, resource);
        if (!permission.success) {
            return sendError({ res, code: 403, message: permission.error });
        }

        next();
    };
};
