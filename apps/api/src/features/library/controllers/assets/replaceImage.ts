import type { Response } from "express";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readImagePart } from "../../utils/readUploadParts";

export const replaceLibraryAssetImage = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;

        const asset = await AssetService.replaceAssetImage(
            params.assetId,
            req.libraryScope.organizationId,
            readImagePart(req)
        );
        res.status(200).json({ asset });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
