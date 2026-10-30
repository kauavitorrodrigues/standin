import type { Response } from "express";
import { OrganizationInviteLinkCreateSchema } from "@standin/contracts";
import { OrganizationInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createInviteLink = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const data = parseSchema(
            OrganizationInviteLinkCreateSchema,
            req.body ?? {},
            res
        );
        if (!data) return;

        const link = await OrganizationInviteService.create(
            params.organizationId,
            req.user.id,
            data
        );
        // The only answer that carries the token. It must not be cached.
        res.set("Cache-Control", "no-store");
        res.status(201).json({ link });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
