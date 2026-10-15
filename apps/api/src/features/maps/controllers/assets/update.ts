import type { Response } from "express";
import { MapEvents, UpdateMapAssetSchema } from "@standin/contracts";
import { MapAssetService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import type { ExtendedRequest } from "@/types/request";

export const updateMapAsset = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.mapAccess) return;

        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;

        const data = parseSchema(UpdateMapAssetSchema, req.body, res);
        if (!data) return;

        const result = await MapAssetService.update(
            req.mapAccess,
            req.user.id,
            params.assetId,
            data
        );

        emitMapEvent(
            req.mapAccess,
            result.kind === "replaced"
                ? MapEvents.ASSET_REPLACED
                : MapEvents.ASSET_MOVED,
            { mapId: req.mapAccess.mapId, placed: result.placed }
        );

        res.status(200).json({ placed: result.placed });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "update",
            reportError: error,
        });
    }
};
