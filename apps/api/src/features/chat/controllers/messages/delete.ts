import type { Response } from "express";
import { MessageService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteMessage = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("conversationId", "messageId"),
            req.params,
            res,
        );
        if (!params) return;

        const message = await MessageService.delete(
            params.conversationId,
            params.messageId,
            req.user.id,
        );
        res.status(200).json({ message });
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "delete",
            reportError: error,
        });
    }
};
