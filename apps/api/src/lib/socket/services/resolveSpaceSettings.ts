import { SpaceService } from "@standin/core";
import { SpaceSettingsSchema, type SpaceSettings } from "@standin/contracts";
import { createTtlCache } from "@/lib/cache/createTtlCache";
import { resolveSpaceOrganizationId } from "./resolveSpaceOrganizationId";

const cache = createTtlCache<SpaceSettings>({
    ttlMs: 60_000,
    maxEntries: 5_000,
});

// The settings of a space, kept for a minute so each nearby message and each
// typing signal does not read the database. A save empties the entry. Joining
// must never fail because of a setting: an error gives the defaults, which are
// not kept, so the next read tries again.
export const resolveSpaceSettings = async (
    spaceId: string
): Promise<SpaceSettings> => {
    const cached = cache.get(spaceId);
    if (cached) return cached;

    try {
        const organizationId = await resolveSpaceOrganizationId(spaceId);
        const settings = await SpaceService.getSettings(
            organizationId,
            spaceId
        );
        cache.set(spaceId, settings);
        return settings;
    } catch (error) {
        console.error(error);
        return SpaceSettingsSchema.parse({});
    }
};

export const invalidateSpaceSettings = (spaceId: string): void => {
    cache.delete(spaceId);
};
