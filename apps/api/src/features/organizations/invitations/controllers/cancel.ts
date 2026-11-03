import type { Response } from "express";
import { OrganizationInvitationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const cancelInvitation = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId", "invitationId"),
            req.params,
            res
        );
        if (!params) return;

        await OrganizationInvitationService.cancel(
            params.organizationId,
            params.invitationId
        );
        res.status(204).end();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
