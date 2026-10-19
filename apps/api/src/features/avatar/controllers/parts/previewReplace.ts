import type { Response } from "express";
import { AvatarService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readImagePart } from "@/features/library/utils/readUploadParts";

// `partId` is the id of any row of `avatar_parts`: a base part or one of its
// color variations.
export const replaceAvatarPartPreview = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(paramsSchema("partId"), req.params, res);
        if (!params) return;

        const { previewUrl } = await AvatarService.replacePartPreview(
            params.partId,
            readImagePart(req)
        );
        res.status(200).json({ previewUrl });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
