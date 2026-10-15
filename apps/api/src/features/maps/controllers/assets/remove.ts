import type { Response } from "express";
import { DeleteMapAssetQuerySchema, MapEvents } from "@standin/contracts";
import { MapAssetService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import type { ExtendedRequest } from "@/types/request";

export const removeMapAsset = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.mapAccess) return;

        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;

        const query = parseSchema(DeleteMapAssetQuerySchema, req.query, res);
        if (!query) return;

        const result = await MapAssetService.remove(
            req.mapAccess,
            req.user.id,
            params.assetId,
            query.releaseDesk
        );

        emitMapEvent(req.mapAccess, MapEvents.ASSET_REMOVED, {
            mapId: req.mapAccess.mapId,
            removedIds: result.removedIds,
            detachedIds: result.detachedIds,
        });
        if (result.releasedDeskUserId) {
            emitMapEvent(req.mapAccess, MapEvents.DESK_RELEASED, {
                mapAssetId: params.assetId,
                userId: result.releasedDeskUserId,
            });
        }

        res.status(200).json(result);
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "delete",
            reportError: error,
        });
    }
};
