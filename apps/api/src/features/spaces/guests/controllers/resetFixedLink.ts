import type { Response } from "express";
import { SpaceInviteService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const resetFixedLink = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.spaceRef) return;

        const link = await SpaceInviteService.resetFixed(
            req.spaceRef.id,
            req.user.id
        );
        res.set("Cache-Control", "no-store");
        res.status(200).json({ link });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "update",
            reportError: error,
        });
    }
};
