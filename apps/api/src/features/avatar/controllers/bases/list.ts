import type { Response } from "express";
import { AvatarService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listAvatarBases = async (_req: ExtendedRequest, res: Response) => {
    try {
        const list = await AvatarService.listBases();
        res.status(200).json(list);
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
