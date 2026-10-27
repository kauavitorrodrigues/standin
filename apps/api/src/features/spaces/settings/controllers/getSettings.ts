import type { Response } from "express";
import { SpaceService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getSettings = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.spaceRef) return;

        const settings = await SpaceService.getSettings(
            req.spaceRef.organizationId,
            req.spaceRef.id
        );
        res.status(200).json({ settings });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            reportError: error,
        });
    }
};
