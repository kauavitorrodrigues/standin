import type { Response } from "express";
import { MissingFileError } from "@standin/contracts";
import { SpaceService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const setSpaceThumbnail = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "spaceId"),
            req.params,
            res
        );
        
        if (!params) return;

        if (!req.file) throw new MissingFileError();

        const space = await SpaceService.setThumbnail(
            params.organizationId,
            params.spaceId,
            req.file
        );
        
        res.status(200).json({ space });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "update",
            reportError: error,
        });
    }
};
