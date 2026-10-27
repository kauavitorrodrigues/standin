import type { Response } from "express";
import { MessageReactionService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { notifyReactionToggled } from "./notifyReactionToggled";

export const removeReaction = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId", "conversationId", "messageId", "emoji"),
            req.params,
            res
        );
        if (!params) return;

        await MessageReactionService.remove(
            params.conversationId,
            params.messageId,
            req.user.id,
            params.emoji
        );

        void notifyReactionToggled({
            conversationId: params.conversationId,
            organizationId: params.organizationId,
            messageId: params.messageId,
            emoji: params.emoji,
            actorId: req.user.id,
            added: false,
        });
        res.status(204).send();
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "delete",
            reportError: error,
        });
    }
};
