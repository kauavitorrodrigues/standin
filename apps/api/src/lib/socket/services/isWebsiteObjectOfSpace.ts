import { MapService } from "@standin/core";
import { createTtlCache } from "@/lib/cache/createTtlCache";

// Only the yes is kept. The map of a space rarely changes and opening an
// object is not worth a read of the database every time, but an object that
// was refused must be looked at again once someone adds it.
const confirmed = createTtlCache<true>({ ttlMs: 60_000, maxEntries: 5_000 });

// Whether the object is a website placed on the map of the space.
export const isWebsiteObjectOfSpace = async (
    spaceId: string,
    objectId: string
): Promise<boolean> => {
    const key = `${spaceId}:${objectId}`;
    if (confirmed.get(key)) return true;

    const found = await MapService.hasEmbeddedWebsite(spaceId, objectId);
    if (found) confirmed.set(key, true);
    return found;
};
