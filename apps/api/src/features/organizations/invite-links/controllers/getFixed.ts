import type { Response } from "express";
import { OrganizationInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getFixedLink = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const link = await OrganizationInviteService.getFixed(
            params.organizationId,
            req.user.id
        );
        // The token is in the answer: it must not be cached.
        res.set("Cache-Control", "no-store");
        res.status(200).json({ link });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
