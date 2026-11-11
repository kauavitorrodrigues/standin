import type { Response } from "express";
import { SpotifyService } from "@standin/core";
import { clearListeningOfUser } from "@/lib/socket/music/listening/clearListeningOfUser";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The owner removes the connection of another person.
export const removeSpotifyConnection = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "userId"),
            req.params,
            res
        );
        if (!params) return;

        await SpotifyService.disconnect(params);
        await clearListeningOfUser(params.organizationId, params.userId);
        res.status(204).end();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
