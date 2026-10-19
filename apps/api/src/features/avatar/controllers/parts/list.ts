import type { Response } from "express";
import { AvatarPartListQuerySchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listAvatarParts = async (req: ExtendedRequest, res: Response) => {
    try {
        const query = parseSchema(AvatarPartListQuerySchema, req.query, res);
        if (!query) return;

        const list = await AvatarService.listParts(query);
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
