import type { Response } from "express";
import { SpaceGuestAccessSchema } from "@standin/contracts";
import { SpaceGuestService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const setGuestAccess = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.spaceRef) return;

        const data = parseSchema(SpaceGuestAccessSchema, req.body, res);
        if (!data) return;

        const space = await SpaceGuestService.setAccess(
            req.spaceRef.organizationId,
            req.spaceRef.id,
            data.guestAccess
        );
        res.status(200).json({ space });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "update",
            reportError: error,
        });
    }
};
