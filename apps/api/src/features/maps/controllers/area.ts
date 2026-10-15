import type { Response } from "express";
import { AreaService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The stamp of one area the map may place. The version is part of the URL, so
// the answer never changes for that URL and the client keeps it for good.
export const getMapArea = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess) return;
        const params = parseSchema(paramsSchema("areaId"), req.params, res);
        if (!params) return;

        const area = await AreaService.getForMap(req.mapAccess, params.areaId);
        res.set("Cache-Control", "private, max-age=31536000, immutable");
        res.status(200).json({ area });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "read",
            reportError: error,
        });
    }
};
