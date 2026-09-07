import type { Response } from "express";
import { MessageReactionService } from "@standin/core";
import { ReactionDataSchema } from "@standin/contracts";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const addReaction = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("conversationId", "messageId"),
            req.params,
            res,
        );
        if (!params) return;

        const data = parseSchema(ReactionDataSchema, req.body, res);
        if (!data) return;

        const reaction = await MessageReactionService.add(
            params.conversationId,
            params.messageId,
            req.user.id,
            data.emoji,
        );

        res.status(201).json({ reaction });
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "create",
            reportError: error,
        });
    }
};
