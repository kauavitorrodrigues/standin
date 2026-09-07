import type { Response } from "express";
import { MessageService } from "@standin/core";
import { MessageUpdateSchema } from "@standin/contracts";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateMessage = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("conversationId", "messageId"),
            req.params,
            res
        );
        if (!params) return;

        const data = parseSchema(MessageUpdateSchema, req.body, res);
        if (!data) return;

        const message = await MessageService.update(
            params.conversationId,
            params.messageId,
            req.user.id,
            data
        );
        res.status(200).json({ message });
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "update",
            reportError: error,
        });
    }
};
