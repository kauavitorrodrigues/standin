import type { Response } from "express";
import { ConversationService } from "@standin/core";
import { DirectConversationDataSchema } from "@standin/contracts";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createDirectConversation = async (
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

        const body = parseSchema(DirectConversationDataSchema, req.body, res);
        if (!body) return;

        const conversation = await ConversationService.findOrCreateDirect(
            params.organizationId,
            req.user.id,
            body.recipientUserId
        );
        res.status(200).json({ conversation });
    } catch (error) {
        return sendError({
            res,
            resource: "conversation",
            action: "create",
            reportError: error,
        });
    }
};
