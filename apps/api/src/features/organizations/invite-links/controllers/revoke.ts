import type { Response } from "express";
import { OrganizationInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const revokeInviteLink = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId", "linkId"),
            req.params,
            res
        );
        if (!params) return;

        const link = await OrganizationInviteService.revoke(
            params.organizationId,
            params.linkId
        );
        res.status(200).json({ link });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
