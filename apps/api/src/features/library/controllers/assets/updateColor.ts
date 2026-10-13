import type { Response } from "express";
import { UpdateLibraryColorSchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateLibraryColor = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;
        const body = parseSchema(UpdateLibraryColorSchema, req.body, res);
        if (!body) return;

        const { asset, assets } = await AssetService.updateColor(
            params.assetId,
            req.libraryScope.organizationId,
            body
        );
        res.status(200).json({ asset, assets });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
