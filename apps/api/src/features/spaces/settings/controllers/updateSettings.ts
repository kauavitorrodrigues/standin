import type { Response } from "express";
import { SpaceSettingsUpdateSchema } from "@standin/contracts";
import { SpaceService } from "@standin/core";
import { broadcastSpaceSettingsChange } from "@/lib/socket/services/broadcastSpaceSettingsChange";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateSettings = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.spaceRef) return;

        const data = parseSchema(SpaceSettingsUpdateSchema, req.body, res);
        if (!data) return;

        const settings = await SpaceService.updateSettings(
            req.spaceRef.organizationId,
            req.spaceRef.id,
            data
        );
        broadcastSpaceSettingsChange(req.spaceRef.id, settings);
        res.status(200).json({ settings });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "update",
            reportError: error,
        });
    }
};
