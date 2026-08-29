import type { Response } from "express";
import { OrganizationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteOrganization = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("organizationId"), req.params, res);
        if (!params) return;

        await OrganizationService.delete(params.organizationId);
        res.sendStatus(200);
    } catch (error) {
        return sendError({
            res,
            resource: "organization",
            action: "delete",
            reportError: error,
        });
    }
};
