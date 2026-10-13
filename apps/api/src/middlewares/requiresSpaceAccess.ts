import type { NextFunction, Response } from "express";
import { MapService, SpaceService } from "@standin/core";
import { MapNotFoundError } from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";

/**
 * For routes addressed by space id outside the organization path (desks):
 * resolves the space's map and the access of the user to it. Members read,
 * and the owner of the organization manages.
 */
export const RequiresSpaceAccess = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) return sendForbiddenError(res);

    const params = parseSchema(paramsSchema("spaceId"), req.params, res);
    if (!params) return;

    try {
        const { mapId } = await SpaceService.findRefById(params.spaceId);
        const access = await MapService.getAccess(req.user, mapId);
        if (!access.canRead) throw new MapNotFoundError();

        req.mapAccess = access;
        next();
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            reportError: error,
        });
    }
};
