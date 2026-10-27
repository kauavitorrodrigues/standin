import type { Response } from "express";
import { ConversationService } from "@standin/core";
import { ConversationsListQuerySchema } from "@standin/contracts";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listConversations = async (
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

        const query = parseSchema(ConversationsListQuerySchema, req.query, res);
        if (!query) return;

        const result = await ConversationService.listForUser(
            req.user.id,
            params.organizationId,
            query
        );
        res.status(200).json(result);
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
