import type { Response } from "express";
import { AssetService } from "@standin/core";
import { matchesEtag } from "@/utils/matchesEtag";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// The palette of the editor: what the map owner may place, scoped by the map
// (a template only sees the global library). The ETag lets the editor ask
// again for free, since the version moves with any change of the library.
export const getMapLibrary = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess) return;

        const version = await AssetService.getMapPaletteVersion(req.mapAccess);
        res.set("ETag", version);
        res.set("Cache-Control", "private, no-cache");
        if (matchesEtag(req, version)) return res.status(304).end();

        const library = await AssetService.getMapPalette(req.mapAccess);
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
