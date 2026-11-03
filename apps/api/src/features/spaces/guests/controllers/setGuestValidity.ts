import type { Response } from "express";
import { SpaceGuestValidityUpdateSchema } from "@standin/contracts";
import { SpaceInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const setGuestValidity = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.spaceRef) return;

        const data = parseSchema(SpaceGuestValidityUpdateSchema, req.body, res);
        if (!data) return;

        const link = await SpaceInviteService.setValidity(
            req.spaceRef.id,
            req.user.id,
            data.guestValidityHours
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
