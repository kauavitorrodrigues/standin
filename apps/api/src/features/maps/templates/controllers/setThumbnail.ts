import type { Response } from "express";
import { MissingFileError } from "@standin/contracts";
import { MapTemplateService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const setTemplateThumbnail = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(paramsSchema("templateId"), req.params, res);
        if (!params) return;

        if (!req.file) throw new MissingFileError();

        const { template, warnings } = await MapTemplateService.setThumbnail(
            params.templateId,
            req.file
        );
        res.status(200).json({ template, warnings });
    } catch (error) {
        return sendError({
            res,
            resource: "template",
            action: "update",
            reportError: error,
        });
    }
};
