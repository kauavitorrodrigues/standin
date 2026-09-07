import type { Response } from "express";
import { MessageService } from "@standin/core";
import { MessageListQuerySchema } from "@standin/contracts";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listMessages = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId", "conversationId"),
            req.params,
            res
        );
        if (!params) return;

        const query = parseSchema(MessageListQuerySchema, req.query, res);
        if (!query) return;

        const result = await MessageService.listByConversation(
            params.conversationId,
            req.user.id,
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
