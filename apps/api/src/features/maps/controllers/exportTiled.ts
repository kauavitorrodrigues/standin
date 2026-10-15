import type { Response } from "express";
import { MapService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// Tiled JSON generated from the database, nothing is stored.
export const exportMap = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess) return;

        const tiled = await MapService.exportTiled(req.mapAccess.mapId);
        res.status(200).json(tiled);
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "read",
            reportError: error,
        });
    }
};
