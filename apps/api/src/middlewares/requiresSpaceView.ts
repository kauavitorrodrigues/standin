import type { NextFunction, Response } from "express";
import { MapService, SpaceService } from "@standin/core";
import { SpaceNotFoundError } from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { z } from "zod/v4";

const querySchema = z.object({ spaceId: z.string().min(1) });

const readSpaceInput = (
    source: "params" | "query",
    req: ExtendedRequest,
    res: Response
) => {
    switch (source) {
        case "query":
            return parseSchema(querySchema, req.query, res);
        default:
            return parseSchema(paramsSchema("spaceId"), req.params, res);
    }
};

/**
 * For routes addressed by space id outside the organization path: lets in the
 * members of the organization of the space and the guests admitted to it, and
 * nobody else. A space the person cannot see is reported as missing.
 */
const requiresSpaceView =
    (source: "params" | "query") =>
    async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);

        const input = readSpaceInput(source, req, res);
        if (!input) return;

        try {
            const ref = await SpaceService.findRefById(input.spaceId);
            const access = await MapService.getAccess(req.user, ref.mapId);
            if (!access.canView) throw new SpaceNotFoundError();

            req.spaceRef = ref;
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

export const RequiresSpaceView = requiresSpaceView("params");
export const RequiresSpaceViewFromQuery = requiresSpaceView("query");
