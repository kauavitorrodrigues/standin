import type { Response } from "express";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { getWebsitePreview } from "../preview/services/getWebsitePreview";

// The title and icon of the website an object embeds, for whoever can see the
// map. The server keeps what it read, so the browser is not allowed to: an
// object whose address was just changed must not get the old answer.
export const previewWebsite = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess) return;
        const params = parseSchema(paramsSchema("assetId"), req.params, res);
        if (!params) return;

        const preview = await getWebsitePreview(
            req.mapAccess.mapId,
            params.assetId
        );
        res.set("Cache-Control", "private, no-cache");
        res.status(200).json({ preview });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "read",
            reportError: error,
        });
    }
};
