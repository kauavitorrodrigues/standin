import type { Response } from "express";
import { SpaceInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const requestInvite = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(paramsSchema("token"), req.params, res);
        if (!params) return;

        const result = await SpaceInviteService.request(
            req.user.id,
            params.token
        );
        res.status(200).json(result);
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "create",
            reportError: error,
        });
    }
};
