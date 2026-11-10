import type { Response } from "express";
import { SpotifyService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getSpotifyStatus = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;
        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const status = await SpotifyService.getMemberStatus({
            organizationId: params.organizationId,
            userId: req.user.id,
        });
        res.status(200).json(status);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
