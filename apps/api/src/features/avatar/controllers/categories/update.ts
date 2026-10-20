import type { Response } from "express";
import {
    AvatarCategoryParamsSchema,
    UpdateAvatarCategorySchema,
} from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateAvatarCategory = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(AvatarCategoryParamsSchema, req.params, res);
        if (!params) return;
        const body = parseSchema(UpdateAvatarCategorySchema, req.body, res);
        if (!body) return;

        const category = await AvatarService.updateCategory(params.slot, body);
        res.status(200).json({ category });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
