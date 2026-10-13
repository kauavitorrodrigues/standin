import type { Response } from "express";
import { LibraryTilesetQuerySchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listLibraryTilesets = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const query = parseSchema(LibraryTilesetQuerySchema, req.query, res);
        if (!query) return;

        const library = await AssetService.listTilesets(
            req.libraryScope.organizationId,
            query
        );
        res.status(200).json(library);
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
