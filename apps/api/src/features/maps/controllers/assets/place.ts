import type { Response } from "express";
import { MapEvents, PlaceMapAssetSchema } from "@standin/contracts";
import { MapAssetService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import type { ExtendedRequest } from "@/types/request";

export const placeMapAsset = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.mapAccess) return;

        const data = parseSchema(PlaceMapAssetSchema, req.body, res);
        if (!data) return;

        const placed = await MapAssetService.place(
            req.mapAccess,
            req.user.id,
            data
        );

        emitMapEvent(req.mapAccess, MapEvents.ASSET_PLACED, {
            mapId: req.mapAccess.mapId,
            placed,
        });

        res.status(201).json({ placed });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "create",
            reportError: error,
        });
    }
};
