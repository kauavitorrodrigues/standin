import type { NextFunction, Response } from "express";
import { resolveRole, type Role } from "@standin/auth";
import type { ExtendedRequest } from "@/types/request";
import { sendForbiddenError } from "@/utils/sendError";

export const RequiresRole = (allowedRoles: readonly Role[]) => {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);

        const role = resolveRole(req.user, req.organizationMembership?.role);
        if (!allowedRoles.includes(role)) return sendForbiddenError(res);

        next();
    };
};
