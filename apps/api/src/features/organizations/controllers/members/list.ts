import type { Response } from "express";
import { OrganizationMemberService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listMembers = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const members = await OrganizationMemberService.listActiveWithProfile(
            params.organizationId
        );
        res.status(200).json({ members });
    } catch (error) {
        return sendError({
            res,
            resource: "member",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
