import type { Response } from "express";
import { OrganizationInvitationCreateSchema } from "@standin/contracts";
import { OrganizationInvitationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createInvitations = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const data = parseSchema(
            OrganizationInvitationCreateSchema,
            req.body,
            res
        );
        if (!data) return;

        const result = await OrganizationInvitationService.create(
            params.organizationId,
            req.user.id,
            data
        );
        res.set("Cache-Control", "no-store");
        res.status(201).json(result);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
