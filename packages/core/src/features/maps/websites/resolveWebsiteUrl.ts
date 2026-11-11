import {
    EMBEDDED_WEBSITE_FALLBACK_URL,
    EmbeddedWebsiteParamsSchema,
    MapAssetNotFoundError,
    MapAssetWithoutWebsiteError,
    resolveEmbeddedUrl,
} from "@standin/contracts";
import { getAppOrigins } from "../publish/utils/getAppOrigins";
import { findPlacedWebsiteParams } from "./repository/findPlacedWebsiteParams";

/**
 * The address the website of a placed object points at, worked out from what is
 * stored and never from what a client sends, so nobody can make the server ask
 * for an address of their choice. Null when the stored address is no longer
 * valid, which is the case the card shows without a button.
 */
export const resolveWebsiteUrl = async (
    mapId: string,
    objectId: string
): Promise<string | null> => {
    const row = await findPlacedWebsiteParams(mapId, objectId);
    if (!row) throw new MapAssetNotFoundError();

    const params = EmbeddedWebsiteParamsSchema.safeParse(row.behaviorParams);
    if (!params.success) throw new MapAssetWithoutWebsiteError();

    const url = resolveEmbeddedUrl(objectId, params.data, {
        appOrigins: getAppOrigins(),
    });

    return url === EMBEDDED_WEBSITE_FALLBACK_URL ? null : url;
};
