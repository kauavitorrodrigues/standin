import type { Response } from "express";
import { SpaceInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const revokeInviteLink = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.spaceRef) return;

        const params = parseSchema(paramsSchema("linkId"), req.params, res);
        if (!params) return;

        const link = await SpaceInviteService.revoke(
            req.spaceRef.id,
            params.linkId
        );
        res.status(200).json({ link });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "delete",
            reportError: error,
        });
    }
};
