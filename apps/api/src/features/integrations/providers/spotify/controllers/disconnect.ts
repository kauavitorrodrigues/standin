import type { Response } from "express";
import { SpotifyService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const disconnectSpotify = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;
        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        await SpotifyService.disconnect({
            organizationId: params.organizationId,
            userId: req.user.id,
        });
        res.status(204).end();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
