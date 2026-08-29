import type { Response } from "express";
import { SpaceUpdateSchema } from "@standin/contracts";
import { SpaceService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateSpace = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "spaceId"),
            req.params,
            res,
        );
        if (!params) return;

        const data = parseSchema(SpaceUpdateSchema, req.body, res);
        if (!data) return;

        const space = await SpaceService.update(
            params.organizationId,
            params.spaceId,
            data,
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
