import type { Response } from "express";
import { MapTemplateService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteTemplate = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("templateId"), req.params, res);
        if (!params) return;

        await MapTemplateService.delete(params.templateId);
        res.sendStatus(200);
    } catch (error) {
        return sendError({
            res,
            resource: "template",
            action: "delete",
            reportError: error,
        });
    }
};
