import type { Response } from "express";
import { sendError } from "@/utils/sendError";
import { SoundboardService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { buildViewer, scopeOf } from "../utils/buildViewer";
import { buildCreateClipInput } from "../utils/buildCreateClipInput";

export const createSoundboardClip = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const viewer = buildViewer(req);
        if (!viewer) return;

        const { upload, fields } = buildCreateClipInput(req);
        const clip = await SoundboardService.create(
            scopeOf(req),
            upload,
            fields,
            viewer
        );
        res.status(201).json({ clip });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
