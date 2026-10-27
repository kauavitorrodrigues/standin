import type { Response } from "express";
import { ProfilePictureUnsupportedMediaError } from "@standin/contracts";
import { UserService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { UserCache } from "@/features/auth/services/userCache";
import { buildProfilePictureAction } from "../utils/buildProfilePictureAction";
import { validateProfilePictureFile } from "../utils/validateProfilePictureFile";

export const setProfilePicture = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;
        if (!req.file) throw new ProfilePictureUnsupportedMediaError();
        if (!validateProfilePictureFile(req.file, res)) return;

        const action = await buildProfilePictureAction(req.file.buffer);
        const user = await UserService.updateProfilePicture(
            req.user.id,
            action
        );
        UserCache.invalidate(req.user.id);

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
