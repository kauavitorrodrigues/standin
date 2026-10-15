import type { Response } from "express";
import { MapTemplateDataSchema } from "@standin/contracts";
import { MapTemplateService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createTemplate = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const data = parseSchema(MapTemplateDataSchema, req.body, res);
        if (!data) return;

        const template = await MapTemplateService.create(req.user.id, data);
        res.status(201).json({
            template,
            templateId: template.id,
            mapId: template.mapId,
        });
    } catch (error) {
        return sendError({
            res,
            resource: "template",
            action: "create",
            reportError: error,
        });
    }
};
