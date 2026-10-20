import type { Response } from "express";
import { AvatarService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readImagePart } from "@/features/library/utils/readUploadParts";

export const replaceAvatarBasePreview = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(paramsSchema("baseId"), req.params, res);
        if (!params) return;

        const base = await AvatarService.replaceBasePreview(
            params.baseId,
            readImagePart(req)
        );
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
