import type { Response } from "express";
import { CreateAssetDataSchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readUploadParts } from "../../utils/readUploadParts";

export const createLibraryAsset = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user || !req.libraryScope) return;
        const { image, data } = readUploadParts(req, CreateAssetDataSchema);

        const asset = await AssetService.createAsset(image, data, {
            organizationId: req.libraryScope.organizationId,
            createdBy: req.user.id,
        });
        res.status(201).json({ asset });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "create",
            reportError: error,
        });
    }
};
