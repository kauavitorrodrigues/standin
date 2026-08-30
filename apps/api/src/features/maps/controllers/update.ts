import type { Response } from "express";
import { MapUpdateSchema } from "@standin/contracts";
import { MapService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateMap = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "mapId"),
            req.params,
            res,
        );
        if (!params) return;

        const data = parseSchema(MapUpdateSchema, req.body, res);
        if (!data) return;

        const map = await MapService.update(
            params.organizationId,
            params.mapId,
            data,
        );
        res.status(200).json({ map });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "update",
            reportError: error,
        });
    }
};
