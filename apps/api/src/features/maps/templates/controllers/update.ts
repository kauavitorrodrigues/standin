import type { Response } from "express";
import { MapTemplateUpdateSchema } from "@standin/contracts";
import { MapTemplateService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateTemplate = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("templateId"), req.params, res);
        if (!params) return;

        const data = parseSchema(MapTemplateUpdateSchema, req.body, res);
        if (!data) return;

        const template = await MapTemplateService.update(params.templateId, data);
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
