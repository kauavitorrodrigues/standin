import type { Response } from "express";
import { OrganizationService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listOrganizations = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const organizations = await OrganizationService.listByUser(req.user.id);
        res.status(200).json({ organizations });
    } catch (error) {
        return sendError({
            res,
            resource: "organization",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
