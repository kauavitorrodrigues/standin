import type { Response } from "express";
import { UpdateAvatarBaseSchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateAvatarBase = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("baseId"), req.params, res);
        if (!params) return;
        const body = parseSchema(UpdateAvatarBaseSchema, req.body, res);
        if (!body) return;

        const base = await AvatarService.updateBase(params.baseId, body);
        res.status(200).json({ base });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
