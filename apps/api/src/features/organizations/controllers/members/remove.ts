import type { Response } from "express";
import { OrganizationMemberService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The owner removes a member. The service checks who asks.
export const removeMember = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId", "userId"),
            req.params,
            res
        );
        if (!params) return;

        await OrganizationMemberService.remove(
            req.user.id,
            params.organizationId,
            params.userId
        );
        res.status(204).end();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
