import type { Response } from "express";
import { ReplaceTileMetaSchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const replaceLibraryTileMeta = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("tilesetId"), req.params, res);
        if (!params) return;
        const body = parseSchema(ReplaceTileMetaSchema, req.body, res);
        if (!body) return;

        const tileset = await AssetService.replaceTileMeta(
            params.tilesetId,
            req.libraryScope.organizationId,
            body.tileMeta
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
