import type { Response } from "express";
import { OrganizationMemberService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// A member leaves the organization.
export const leaveOrganization = async (
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

        await OrganizationMemberService.leave(
            req.user.id,
            params.organizationId
        );
        res.status(204).end();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
