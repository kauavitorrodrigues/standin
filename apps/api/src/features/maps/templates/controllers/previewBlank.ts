import type { Response } from "express";
import { z } from "zod/v4";
import { MapSizeTierSchema } from "@standin/contracts";
import { MapService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

const PREVIEW_CACHE_SECONDS = 60;

const paramsSchema = z.object({ sizeTier: MapSizeTierSchema });

// Public: no sign in. Nothing is created, the map is only drawn.
export const previewBlankMap = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(paramsSchema, req.params, res);
        if (!params) return;

        const preview = await MapService.previewBlank(params.sizeTier);
        res.set("Cache-Control", `public, max-age=${PREVIEW_CACHE_SECONDS}`);
        res.status(200).json({ preview });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "read",
            reportError: error,
        });
    }
};
