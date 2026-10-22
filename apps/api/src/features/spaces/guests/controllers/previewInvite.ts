import type { Response } from "express";
import { SpaceInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const previewInvite = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(paramsSchema("token"), req.params, res);
        if (!params) return;

        const invite = await SpaceInviteService.preview(
            req.user.id,
            params.token
        );
        res.status(200).json({ invite });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            reportError: error,
        });
    }
};
