import type { NextFunction, Response } from "express";
import { resolveRoles, type Role } from "@standin/auth";
import type { ExtendedRequest } from "@/types/request";
import { sendForbiddenError } from "@/utils/sendError";

export const RequiresRole = (allowedRoles: readonly Role[]) => {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);

        const roles = resolveRoles(req.user, req.organizationMembership?.role);
        if (!roles.some((role) => allowedRoles.includes(role))) {
            return sendForbiddenError(res);
        }

        next();
    };
};
