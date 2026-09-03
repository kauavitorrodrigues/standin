import type { Response } from "express";
import { MessageService } from "@standin/core";
import { MessageDataSchema } from "@standin/contracts";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createMessage = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("conversationId"),
            req.params,
            res
        );
        if (!params) return;

        const data = parseSchema(
            MessageDataSchema,
            { content: req.body.content },
            res
        );
        if (!data) return;

        const attachmentFiles =
            (req.files as Express.Multer.File[] | undefined) ?? [];

        const message = await MessageService.create(
            params.conversationId,
            req.user.id,
            { content: data.content, attachmentFiles }
        );

        res.status(201).json({ message });
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "create",
            reportError: error,
        });
    }
};
