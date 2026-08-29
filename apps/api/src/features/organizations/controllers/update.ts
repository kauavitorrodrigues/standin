import type { Response } from "express";
import { OrganizationUpdateSchema } from "@standin/contracts";
import { OrganizationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateOrganization = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("organizationId"), req.params, res);
        if (!params) return;

        const data = parseSchema(OrganizationUpdateSchema, req.body, res);
        if (!data) return;

        const organization = await OrganizationService.update(
            params.organizationId,
            data,
        );

        res.status(200).json({ organization });
    } catch (error) {
        return sendError({
            res,
            resource: "organization",
            action: "update",
            reportError: error,
        });
    }
};
