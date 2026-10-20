import type { Response } from "express";
import { AvatarService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getAvatarEditor = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const editor = await AvatarService.getEditor(req.user.id);
        res.status(200).json(editor);
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
