import type { Response } from "express";
import { RenameTilesetSchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateLibraryTileset = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("tilesetId"), req.params, res);
        if (!params) return;
        const body = parseSchema(RenameTilesetSchema, req.body, res);
        if (!body) return;

        const tileset = await AssetService.renameTileset(
            params.tilesetId,
            req.libraryScope.organizationId,
            body.name
        );
        res.status(200).json({ tileset });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
