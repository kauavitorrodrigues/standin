import type { NextFunction, Response } from "express";
import { ConversationService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";

export const RequiresConversationAccess = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) return;

    const params = parseSchema(paramsSchema("conversationId"), req.params, res);
    if (!params) return;

    try {
        const hasAccess = await ConversationService.canAccess(
            req.user.id,
            params.conversationId
        );
        if (!hasAccess) return sendForbiddenError(res);

        next();
    } catch (error) {
        return sendError({
            res,
            resource: "message",
            action: "read",
            reportError: error,
        });
    }
};
