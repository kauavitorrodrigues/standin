import type { Response } from "express";
import { DeleteAssetQuerySchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteLibraryAsset = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;
        const query = parseSchema(DeleteAssetQuerySchema, req.query, res);
        if (!query) return;

        const { ids, deleted } = await AssetService.deleteAsset(
            params.assetId,
            req.libraryScope.organizationId,
            { family: query.family }
        );
        res.status(200).json({ ids, deleted });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "delete",
            reportError: error,
        });
    }
};
