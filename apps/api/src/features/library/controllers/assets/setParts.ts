import type { Response } from "express";
import { SetAssetPartsSchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const setLibraryAssetParts = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;
        const body = parseSchema(SetAssetPartsSchema, req.body, res);
        if (!body) return;

        const parts = await AssetService.setParts(
            params.assetId,
            req.libraryScope.organizationId,
            body
        );
        res.status(200).json({ parts });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
