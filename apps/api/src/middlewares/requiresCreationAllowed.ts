import type { NextFunction, Response } from "express";
import { USER_ROLES } from "@standin/contracts";
import { GlobalSettingsService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";

const ASSERTS = {
    organization: GlobalSettingsService.assertOrganizationCreationAllowed,
    space: GlobalSettingsService.assertSpaceCreationAllowed,
};

/**
 * Applies the instance switch for creating organizations or spaces. It runs
 * next to `RequiresPermission`: that checks who the person is, this checks
 * whether the instance lets non-admins create at all. The admin always may.
 */
export const RequiresCreationAllowed = (resource: keyof typeof ASSERTS) => {
    return async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);
        if (req.user.role === USER_ROLES.ADMIN) return next();

        try {
            await ASSERTS[resource]();
        } catch (error) {
            return sendError({ res, reportError: error });
        }

        next();
    };
};
