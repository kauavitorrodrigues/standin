import type { Response } from "express";
import { ConversationService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listParticipants = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("conversationId"),
            req.params,
            res
        );
        if (!params) return;

        const participants = await ConversationService.listParticipants(
            params.conversationId
        );
        res.status(200).json({ participants });
    } catch (error) {
        return sendError({
            res,
            resource: "participant",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
