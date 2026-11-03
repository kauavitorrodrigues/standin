import type { Response } from "express";
import { OrganizationInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const resetFixedLink = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const link = await OrganizationInviteService.resetFixed(
            params.organizationId,
            req.user.id
        );
        res.set("Cache-Control", "no-store");
        res.status(200).json({ link });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
