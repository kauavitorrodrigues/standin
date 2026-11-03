import type { Response } from "express";
import { PageQuerySchema } from "@standin/contracts";
import { OrganizationMemberService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The people of the organization with their e-mail. Only for who runs the
// invites, so the e-mails of the others stay private.
export const listMemberEntries = async (
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

        const query = parseSchema(PageQuerySchema, req.query, res);
        if (!query) return;

        const { items, total } = await OrganizationMemberService.listEntries(
            params.organizationId,
            query
        );
        res.status(200).json({ members: items, total });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
