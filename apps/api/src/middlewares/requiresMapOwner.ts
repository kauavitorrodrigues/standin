import type { NextFunction, Response } from "express";
import { MapAssetForbiddenError } from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import { sendError } from "@/utils/sendError";

/**
 * After `RequiresSpaceAccess`: only who can edit the map (the owner of the
 * organization, or the admin for a template) goes on.
 */
export const RequiresMapOwner = (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.mapAccess?.canEdit) {
        return sendError({ res, reportError: new MapAssetForbiddenError() });
    }
    next();
};
