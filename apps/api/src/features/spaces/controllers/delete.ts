import type { Response } from "express";
import { SpaceService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteSpace = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "spaceId"),
            req.params,
            res,
        );
        if (!params) return;

        await SpaceService.delete(params.organizationId, params.spaceId);
        res.sendStatus(200);
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "delete",
            reportError: error,
        });
    }
};
