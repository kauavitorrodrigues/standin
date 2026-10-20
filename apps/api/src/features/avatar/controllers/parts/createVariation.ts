import type { Response } from "express";
import { CreateAvatarVariationDataSchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readUploadParts } from "@/features/library/utils/readUploadParts";
import { readPreviewPart } from "../../utils/readPreviewPart";

export const createAvatarPartVariation = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;
        const params = parseSchema(paramsSchema("partId"), req.params, res);
        if (!params) return;
        const { image, data } = readUploadParts(
            req,
            CreateAvatarVariationDataSchema
        );

        const { part, warnings } = await AvatarService.createVariation(
            params.partId,
            image,
            readPreviewPart(req),
            data,
            { createdBy: req.user.id }
        );
        res.status(201).json({ part, warnings });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "create",
            reportError: error,
        });
    }
};
