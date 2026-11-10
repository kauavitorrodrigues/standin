import type { Response } from "express";
import { SpotifyService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { buildSpotifyRedirectUri } from "../utils/buildRedirectUri";

export const getSpotifyApp = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const status = await SpotifyService.getOwnerStatus(
            params.organizationId,
            buildSpotifyRedirectUri()
        );
        res.status(200).json(status);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
