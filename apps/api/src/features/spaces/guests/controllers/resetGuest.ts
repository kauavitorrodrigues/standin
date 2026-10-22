import type { Response } from "express";
import { SpaceGuestService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const resetGuest = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.spaceRef) return;

        const params = parseSchema(paramsSchema("guestId"), req.params, res);
        if (!params) return;

        const guest = await SpaceGuestService.reset(
            req.spaceRef.id,
            params.guestId
        );
        res.status(200).json({ guest });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "update",
            reportError: error,
        });
    }
};
