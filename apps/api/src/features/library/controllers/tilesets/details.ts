import type { Response } from "express";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getLibraryTileset = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("tilesetId"), req.params, res);
        if (!params) return;

        const tileset = await AssetService.getTileset(
            params.tilesetId,
            req.libraryScope.organizationId
        );
        res.status(200).json({ tileset });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "read",
            reportError: error,
        });
    }
};
