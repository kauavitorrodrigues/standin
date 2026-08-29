import type { Response } from "express";
import { SpaceService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listSpaces = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("organizationId"), req.params, res);
        if (!params) return;

        const spaces = await SpaceService.listByOrganization(params.organizationId);
        res.status(200).json({ spaces });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
