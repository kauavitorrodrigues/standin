import type { Response } from "express";
import { SpaceGuestService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listGuests = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.spaceRef) return;

        const guests = await SpaceGuestService.list(req.spaceRef.id);
        res.status(200).json(guests);
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
