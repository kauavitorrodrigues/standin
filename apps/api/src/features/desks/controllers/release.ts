import type { Response } from "express";
import { MapEvents } from "@standin/contracts";
import { DeskService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const releaseDesk = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.mapAccess) return;

        const params = parseSchema(
            paramsSchema("spaceId", "mapAssetId"),
            req.params,
            res
        );
        if (!params) return;

        const result = await DeskService.release(
            params.spaceId,
            params.mapAssetId,
            { userId: req.user.id, canManage: req.mapAccess.canEdit }
        );

        emitMapEvent(req.mapAccess, MapEvents.DESK_RELEASED, {
            mapAssetId: result.mapAssetId,
            userId: result.userId,
        });

        res.sendStatus(200);
    } catch (error) {
        return sendError({
            res,
            resource: "user",
            action: "update",
            reportError: error,
        });
    }
};
