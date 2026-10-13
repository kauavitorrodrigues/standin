import type { Response } from "express";
import { AssetService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getLibraryOverview = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;

        const overview = await AssetService.getOverview(
            req.libraryScope.organizationId
        );
        res.status(200).json(overview);
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
