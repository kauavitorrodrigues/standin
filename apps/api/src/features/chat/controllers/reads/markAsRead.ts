import type { Response } from "express";
import { ConversationReadService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { notifyMessagesSeen } from "./notifyMessagesSeen";

export const markConversationAsRead = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId", "conversationId"),
            req.params,
            res
        );
        if (!params) return;

        await ConversationReadService.markAsRead(
            params.conversationId,
            req.user.id
        );

        void notifyMessagesSeen(
            params.conversationId,
            params.organizationId,
            req.user.id
        );

        res.status(204).send();
    } catch (error) {
        return sendError({
            res,
            resource: "conversation",
            action: "update",
            reportError: error,
        });
    }
};
