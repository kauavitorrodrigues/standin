import type { Response } from "express";
import { AvatarCategoryParamsSchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const removeAvatarCategoryPreview = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(AvatarCategoryParamsSchema, req.params, res);
        if (!params) return;

        const category = await AvatarService.removeCategoryPreview(params.slot);
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
