import type { Response } from "express";
import { ClaimDeskSchema, MapEvents } from "@standin/contracts";
import { DeskService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const claimDesk = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.mapAccess) return;

        const params = parseSchema(
            paramsSchema("spaceId", "mapAssetId"),
            req.params,
            res
        );
        if (!params) return;

        const data = parseSchema(ClaimDeskSchema, req.body ?? {}, res);
        if (!data) return;

        const result = await DeskService.claim(
            params.spaceId,
            params.mapAssetId,
            req.user.id,
            data.swap
        );

        if (result.releasedMapAssetId) {
            emitMapEvent(req.mapAccess, MapEvents.DESK_RELEASED, {
                mapAssetId: result.releasedMapAssetId,
                userId: result.userId,
            });
        }
        emitMapEvent(req.mapAccess, MapEvents.DESK_CLAIMED, {
            mapAssetId: result.mapAssetId,
            userId: result.userId,
        });

        res.status(200).json({
            mapAssetId: result.mapAssetId,
            userId: result.userId,
        });
    } catch (error) {
        return sendError({
            res,
            resource: "user",
            action: "update",
            reportError: error,
        });
    }
};
