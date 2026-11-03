import type { Response } from "express";
import { OrganizationInvitationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The desks of a space of the organization that can be kept for an invited
// person.
export const listFreeDesks = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId", "spaceId"),
            req.params,
            res
        );
        if (!params) return;

        const desks = await OrganizationInvitationService.freeDesks(
            params.organizationId,
            params.spaceId
        );
        res.status(200).json({ desks });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
