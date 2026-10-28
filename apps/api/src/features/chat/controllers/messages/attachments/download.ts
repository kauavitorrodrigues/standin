import type { Response } from "express";
import { MessageAttachmentService, FileService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const downloadAttachment = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("conversationId", "messageId", "attachmentId"),
            req.params,
            res
        );
        if (!params) return;

        const attachment = await MessageAttachmentService.findAccessible(
            params.attachmentId,
            params.messageId,
            params.conversationId
        );

        const stream = await FileService.download(attachment.fileName);

        res.setHeader("Content-Type", attachment.mimeType);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(attachment.originalName)}"`
        );

        stream.on("error", (error) => {
            if (!res.headersSent) {
                return sendError({
                    res,
                    resource: "message",
                    action: "read",
                    reportError: error,
                });
            }
            res.destroy(error);
        });

        // `pipe` leaves the source open when the client goes away, which holds
        // an S3 socket (or a file descriptor) until the pool runs dry.
        res.on("close", () => stream.destroy());
        stream.pipe(res);
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "read",
            reportError: error,
        });
    }
};
