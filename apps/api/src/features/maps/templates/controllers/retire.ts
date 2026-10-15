import type { Response } from "express";
import { MapTemplateService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const retireTemplate = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("templateId"), req.params, res);
        if (!params) return;

        const template = await MapTemplateService.retire(params.templateId);
        res.status(200).json({ template });
    } catch (error) {
        return sendError({
            res,
            resource: "template",
            action: "update",
            reportError: error,
        });
    }
};
