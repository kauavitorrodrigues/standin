import type { Response } from "express";
import { SpaceGuestService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

/**
 * The state of the signed in person's own request, the fallback when the socket
 * drops. Null when they never asked.
 */
export const getMyGuest = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(paramsSchema("spaceId"), req.params, res);
        if (!params) return;

        const guest = await SpaceGuestService.findState(
            req.user.id,
            params.spaceId
        );
        res.status(200).json({ guest });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            reportError: error,
        });
    }
};
