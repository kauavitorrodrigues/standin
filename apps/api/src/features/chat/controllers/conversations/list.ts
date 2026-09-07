import type { Response } from "express";
import { ConversationService } from "@standin/core";
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

        const result = await ConversationService.listForUser(
            req.user.id,
            params.organizationId
        );
        res.status(200).json(result);
    } catch (error) {
        return sendError({
            res,
            resource: "conversation",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
