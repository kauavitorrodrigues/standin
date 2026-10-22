import type { Response } from "express";
import { SpaceService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

/** The space for a member or an admitted guest, with nothing of the organization. */
export const viewSpace = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(paramsSchema("spaceId"), req.params, res);
        if (!params) return;

        const space = await SpaceService.findView(req.user.id, params.spaceId);
        res.status(200).json({ space });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            reportError: error,
        });
    }
};
