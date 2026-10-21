import type { Response } from "express";
import { UserService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const removeProfilePicture = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;

        const user = await UserService.updateProfilePicture(req.user.id, {
            action: "remove",
        });
        res.status(200).json({ user });
    } catch (error) {
        return sendError({
            res,
            resource: "user",
            action: "update",
            reportError: error,
        });
    }
};
