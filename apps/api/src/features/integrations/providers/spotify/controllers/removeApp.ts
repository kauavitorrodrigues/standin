import type { Response } from "express";
import { SpotifyService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const removeSpotifyApp = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        await SpotifyService.removeApp(params.organizationId);
        res.status(204).end();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
