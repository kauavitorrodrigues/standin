import type { Response } from "express";
import { MapTemplatesQuerySchema, USER_ROLES } from "@standin/contracts";
import { OrganizationService, MapTemplateService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError, sendForbiddenError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The admin sees every template. The owner of an organization sees the
// published global ones, to start a space from. Anyone else has no use for
// the catalog.
export const listTemplates = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const query = parseSchema(MapTemplatesQuerySchema, req.query, res);
        if (!query) return;

        if (req.user.role === USER_ROLES.ADMIN) {
            const templates = await MapTemplateService.list(query.sizeTier);
            return res.status(200).json({ templates });
        }

        const isOwner = await OrganizationService.isOwnerOfAny(req.user.id);
        if (!isOwner) return sendForbiddenError(res);

        const templates = await MapTemplateService.listPublished(query.sizeTier);
        res.status(200).json({ templates });
    } catch (error) {
        return sendError({
            res,
            resource: "template",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
