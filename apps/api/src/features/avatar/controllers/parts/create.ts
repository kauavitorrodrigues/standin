import type { Response } from "express";
import { CreateAvatarPartDataSchema } from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readUploadParts } from "@/features/library/utils/readUploadParts";
import { readPreviewPart } from "../../utils/readPreviewPart";

export const createAvatarPart = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;
        const { image, data } = readUploadParts(
            req,
            CreateAvatarPartDataSchema
        );

        const { part, warnings } = await AvatarService.createPart(
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
