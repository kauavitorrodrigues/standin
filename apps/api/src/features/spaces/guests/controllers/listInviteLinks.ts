import type { Response } from "express";
import { SpaceInviteService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listInviteLinks = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.spaceRef) return;

        const links = await SpaceInviteService.list(req.spaceRef.id);
        res.status(200).json({ links });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
