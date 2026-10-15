import type { Response } from "express";
import { LayoutOpsRequestSchema, MapEvents } from "@standin/contracts";
import { MapService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import type { ExtendedRequest } from "@/types/request";

export const applyLayoutOps = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess) return;

        const data = parseSchema(LayoutOpsRequestSchema, req.body, res);
        if (!data) return;

        const result = await MapService.applyLayoutOps(
            req.mapAccess,
            data.baseVersion,
            data.ops
        );

        emitMapEvent(req.mapAccess, MapEvents.LAYOUT_OPS_APPLIED, {
            mapId: req.mapAccess.mapId,
            version: result.version,
            ops: result.ops,
        });

        res.status(200).json({ version: result.version });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "update",
            reportError: error,
        });
    }
};
