import type { Response } from "express";
import { SpaceGuestService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

/** The spaces the signed in person can enter as a guest right now. */
export const listGuestSpaces = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const spaces = await SpaceGuestService.listSpacesOf(req.user.id);
        res.status(200).json({ spaces });
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
