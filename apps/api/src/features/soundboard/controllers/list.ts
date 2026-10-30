import type { Response } from "express";
import { SoundboardClipListQuerySchema } from "@standin/contracts";
import { SoundboardService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { buildViewer, scopeOf } from "../utils/buildViewer";

export const listSoundboardClips = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const viewer = buildViewer(req);
        if (!viewer) return;
        const query = parseSchema(
            SoundboardClipListQuerySchema,
            req.query,
            res
        );
        if (!query) return;

        const page = await SoundboardService.list(
            { ...query, organizationId: scopeOf(req) },
            viewer
        );
        res.status(200).json(page);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
