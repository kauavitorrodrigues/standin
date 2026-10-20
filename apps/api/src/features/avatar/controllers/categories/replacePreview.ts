import type { Response } from "express";
import { AvatarCategoryParamsSchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readImagePart } from "@/features/library/utils/readUploadParts";

export const replaceAvatarCategoryPreview = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(AvatarCategoryParamsSchema, req.params, res);
        if (!params) return;

        const category = await AvatarService.replaceCategoryPreview(
            params.slot,
            readImagePart(req)
        );
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
