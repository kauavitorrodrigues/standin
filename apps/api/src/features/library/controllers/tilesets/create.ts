import type { Response } from "express";
import { CreateTilesetDataSchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readUploadParts } from "../../utils/readUploadParts";

export const createLibraryTileset = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user || !req.libraryScope) return;
        const { image, data } = readUploadParts(req, CreateTilesetDataSchema);

        const tileset = await AssetService.createTileset(image, data, {
            organizationId: req.libraryScope.organizationId,
            createdBy: req.user.id,
        });
        res.status(201).json({ tileset });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "create",
            reportError: error,
        });
    }
};
