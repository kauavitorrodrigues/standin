import type { Response } from "express";
import { UpdateAvatarPartSchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateAvatarPart = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("partId"), req.params, res);
        if (!params) return;
        const body = parseSchema(UpdateAvatarPartSchema, req.body, res);
        if (!body) return;

        const part = await AvatarService.updatePart(params.partId, body);
        res.status(200).json({ part });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
