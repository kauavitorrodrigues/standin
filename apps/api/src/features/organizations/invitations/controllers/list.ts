import type { Response } from "express";
import { PageQuerySchema } from "@standin/contracts";
import { OrganizationInvitationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listInvitations = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const query = parseSchema(PageQuerySchema, req.query, res);
        if (!query) return;

        const { items, total } = await OrganizationInvitationService.list(
            params.organizationId,
            query
        );
        res.set("Cache-Control", "no-store");
        res.status(200).json({ invitations: items, total });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
