import type { Response } from "express";
import { MapService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteMap = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "mapId"),
            req.params,
            res,
        );
        if (!params) return;

        const map = await MapService.delete(
            params.organizationId,
            params.mapId,
        );
        res.status(200).json({ map });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "delete",
            reportError: error,
        });
    }
};
