import type { Response } from "express";
import { SoundboardService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { buildViewer, scopeOf } from "../utils/buildViewer";

export const removeSoundboardClip = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const viewer = buildViewer(req);
        if (!viewer) return;
        const params = parseSchema(paramsSchema("clipId"), req.params, res);
        if (!params) return;

        await SoundboardService.delete(params.clipId, scopeOf(req), viewer);
        res.status(204).end();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
