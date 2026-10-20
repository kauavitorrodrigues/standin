import type { Response } from "express";
import { AvatarConfigSchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The socket hears about the change through `AvatarService.onSheetChanged`,
// which the service runs before it deletes the old file.
export const setMyAvatar = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;
        const body = parseSchema(AvatarConfigSchema, req.body, res);
        if (!body) return;

        const avatar = await AvatarService.setUserAvatar(req.user.id, body);
        res.status(200).json(avatar);
    } catch (error) {
        return sendError({
            res,
            resource: "user",
            action: "update",
            reportError: error,
        });
    }
};
