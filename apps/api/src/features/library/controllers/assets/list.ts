import type { Response } from "express";
import { LibraryFamilyQuerySchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listLibraryFamilies = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const query = parseSchema(LibraryFamilyQuerySchema, req.query, res);
        if (!query) return;

        const library = await AssetService.listFamilies(
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
