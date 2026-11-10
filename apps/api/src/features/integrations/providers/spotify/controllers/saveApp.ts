import type { Response } from "express";
import { SpotifyAppSaveSchema } from "@standin/contracts";
import { SpotifyService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { buildSpotifyRedirectUri } from "../utils/buildRedirectUri";

export const saveSpotifyApp = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );

        if (!params) return;

        const data = parseSchema(SpotifyAppSaveSchema, req.body, res);
        if (!data) return;

        await SpotifyService.saveApp({
            organizationId: params.organizationId,
            userId: req.user.id,
            ...data,
        });

        const status = await SpotifyService.getOwnerStatus(
            params.organizationId,
            buildSpotifyRedirectUri()
        );

        res.status(200).json(status);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
