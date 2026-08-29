import type { Response } from "express";
import { OrganizationDataSchema } from "@standin/contracts";
import { OrganizationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createOrganization = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const data = parseSchema(OrganizationDataSchema, req.body, res);
        if (!data) return;

        const organization = await OrganizationService.create(req.user.id, data);
        res.status(201).json({ organization });
    } catch (error) {
        return sendError({
            res,
            resource: "organization",
            action: "create",
            reportError: error,
        });
    }
};
