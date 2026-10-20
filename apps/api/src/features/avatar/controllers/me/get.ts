import type { Response } from "express";
import { AvatarService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getMyAvatar = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const avatar = await AvatarService.getUserAvatar(req.user.id);
        res.status(200).json(avatar);
    } catch (error) {
        return sendError({
            res,
            resource: "user",
            action: "read",
            reportError: error,
        });
    }
};
