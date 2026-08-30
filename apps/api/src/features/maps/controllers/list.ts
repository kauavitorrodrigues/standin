import type { Response } from "express";
import { MapService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listMaps = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("organizationId"), req.params, res);
        if (!params) return;

        const maps = await MapService.listByOrganization(params.organizationId);
        res.status(200).json({ maps });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
