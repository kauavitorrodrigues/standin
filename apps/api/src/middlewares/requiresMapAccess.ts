import type { NextFunction, Response } from "express";
import { MapService } from "@standin/core";
import type { MapAccess } from "@standin/core";
import { MapNotFoundError } from "@standin/contracts";
import { MAP_ACCESS_MODES, type MapAccessMode } from "@/consts/mapAccess";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";

// A guest passes `view` and nothing else: `canRead` stays the members' door.
const isAllowed = (mode: MapAccessMode, access: MapAccess): boolean => {
    switch (mode) {
        case MAP_ACCESS_MODES.EDIT:
            return access.canEdit;
        case MAP_ACCESS_MODES.VIEW:
            return access.canView;
        default:
            return access.canRead;
    }
};

/**
 * Resolves who owns the map (a space or a template) and what the user can do
 * on it, from the database on every request.
 *
 * - `view`: members of the organization and the guests admitted to the space.
 * - `read`: members of the space's organization, or the admin for a template.
 * - `edit`: the owner of the organization, or the admin for a template.
 *
 * Members decorating their own desk only need `read`: the object service
 * checks that the desk is theirs.
 */
export const RequiresMapAccess = (mode: MapAccessMode) => {
    return async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);

        const params = parseSchema(paramsSchema("mapId"), req.params, res);
        if (!params) return;

        try {
            const access = await MapService.getAccess(req.user, params.mapId);
            const allowed = isAllowed(mode, access);
            // A map the user cannot see is reported as missing.
            if (!allowed && !access.canView) throw new MapNotFoundError();
            if (!allowed) return sendForbiddenError(res);

            req.mapAccess = access;
            next();
        } catch (error) {
            return sendError({
                res,
                resource: "map",
                action: "read",
                reportError: error,
            });
        }
    };
};
