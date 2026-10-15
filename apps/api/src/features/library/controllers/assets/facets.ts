import type { Response } from "express";
import { AssetService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listLibraryFamilyFacets = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const facets = await AssetService.listFamilyFacets(
            req.libraryScope.organizationId
        );
        res.status(200).json(facets);
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
