import { EmbeddedWebsiteParamsSchema } from "@standin/contracts";
import { SpaceService } from "../../spaces";
import { findPlacedWebsiteParams } from "./repository/findPlacedWebsiteParams";

/**
 * Whether the object is placed on the map of the space and embeds a website.
 * A space that is gone has no such object, so it answers false instead of
 * failing: the caller is a socket that only needs a yes or a no.
 */
export const hasEmbeddedWebsite = async (
    spaceId: string,
    objectId: string
): Promise<boolean> => {
    const space = await SpaceService.findRefById(spaceId).catch(() => null);
    if (!space) return false;

    const row = await findPlacedWebsiteParams(space.mapId, objectId);
    if (!row) return false;

    return EmbeddedWebsiteParamsSchema.safeParse(row.behaviorParams).success;
};
