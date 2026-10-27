import { SpaceService } from "@standin/core";
import { createTtlCache } from "@/lib/cache/createTtlCache";

const cache = createTtlCache<string>({ ttlMs: 60_000, maxEntries: 5_000 });

// The organization a space belongs to, which never changes for a space, so it
// is kept for a minute and the typing of the chat does not look it up again.
export const resolveSpaceOrganizationId = async (
    spaceId: string
): Promise<string> => {
    const cached = cache.get(spaceId);
    if (cached) return cached;

    const { organizationId } = await SpaceService.findRefById(spaceId);
    cache.set(spaceId, organizationId);
    return organizationId;
};
