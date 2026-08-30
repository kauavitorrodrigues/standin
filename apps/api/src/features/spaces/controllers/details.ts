import type { Response } from "express";
import { SpaceService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getSpaceDetails = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "spaceId"),
            req.params,
            res,
        );
        if (!params) return;

        const space = await SpaceService.findDetailsById(
            params.organizationId,
            params.spaceId,
        );
        res.status(200).json({ space });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            reportError: error,
        });
    }
};
