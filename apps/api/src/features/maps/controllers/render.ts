import type { Response } from "express";
import { MapService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const renderMap = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.mapAccess) return;

        const payload = await MapService.buildRenderPayload(
            req.mapAccess,
            req.user.id
        );
        res.status(200).json(payload);
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "read",
            reportError: error,
        });
    }
};
