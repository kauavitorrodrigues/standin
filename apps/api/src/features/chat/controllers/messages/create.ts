import type { Response } from "express";
import { MessageService } from "@standin/core";
import { MessageDataSchema, MessageErrorMessages } from "@standin/contracts";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { notifyNewMessage } from "./notifyNewMessage";

export const createMessage = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId", "conversationId"),
            req.params,
            res
        );
        if (!params) return;

        const data = parseSchema(
            MessageDataSchema,
            {
                content: req.body.content,
                threadParentId: req.body.threadParentId,
                showThreadReplyInChannel: req.body.showThreadReplyInChannel,
            },
            res
        );
        if (!data) return;

        const attachmentFiles =
            (req.files as Express.Multer.File[] | undefined) ?? [];

        if (!data.content && attachmentFiles.length === 0) {
            return sendError({
                res,
                message: MessageErrorMessages.content.orAttachmentRequired,
            });
        }

        const message = await MessageService.create(
            params.conversationId,
            req.user.id,
            {
                content: data.content,
                attachmentFiles,
                threadParentId: data.threadParentId,
                showThreadReplyInChannel: data.showThreadReplyInChannel,
            }
        );

        const threadSummary = message.threadParentId
            ? await MessageService.threadSummary(message.threadParentId)
            : null;

        void notifyNewMessage(
            params.conversationId,
            params.organizationId,
            {
                id: req.user.id,
                name: req.user.name,
                profilePictureUrl: req.user.profilePictureUrl,
            },
            message,
            threadSummary
        );

        res.status(201).json({ message, threadSummary });
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "create",
            reportError: error,
        });
    }
};
