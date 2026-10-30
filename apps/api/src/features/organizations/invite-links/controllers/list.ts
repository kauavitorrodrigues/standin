import type { Response } from "express";
import { OrganizationInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listInviteLinks = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const links = await OrganizationInviteService.list(
            params.organizationId
        );
        res.status(200).json({ links });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
