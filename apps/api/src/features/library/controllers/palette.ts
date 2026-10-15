import type { Response } from "express";
import { AssetService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The global palette, for the area composer, which has no map.
export const getLibraryPalette = async (
    _req: ExtendedRequest,
    res: Response
) => {
    try {
        const library = await AssetService.getGlobalPalette();
        res.status(200).json({ library });
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
