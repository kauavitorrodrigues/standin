import type { Response } from "express";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getLibraryFamily = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;

        const family = await AssetService.getFamily(
            params.assetId,
            req.libraryScope.organizationId
        );
        res.status(200).json({ family });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "read",
            reportError: error,
        });
    }
};
