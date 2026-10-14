import type { Response } from "express";
import { MapTemplateService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

const PREVIEW_CACHE_SECONDS = 60;

// Public: no sign in. Only a published global template answers.
export const previewTemplate = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("templateId"), req.params, res);
        if (!params) return;

        const preview = await MapTemplateService.preview(params.templateId);
        res.set("Cache-Control", `public, max-age=${PREVIEW_CACHE_SECONDS}`);
        res.status(200).json({ preview });
    } catch (error) {
        return sendError({
            res,
            resource: "template",
            action: "read",
            reportError: error,
        });
    }
};
