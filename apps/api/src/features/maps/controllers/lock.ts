import type { Response } from "express";
import { MapLockService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// Who is editing the map right now, for whoever can read it. The session of
// the holder never leaves the server.
export const getMapLock = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess) return;

        res.status(200).json(MapLockService.getState(req.mapAccess.mapId));
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "read",
            reportError: error,
        });
    }
};
