import { PresenceStore } from "../../presence/PresenceStore";
import { resolveSpaceOrganizationId } from "../../services/resolveSpaceOrganizationId";
import { ListeningSync } from "./ListeningSync";

/**
 * Takes what a person plays off the spaces of an organization at once, when
 * their connection ends, instead of waiting for the next poll.
 */
export const clearListeningOfUser = async (
    organizationId: string,
    userId: string
): Promise<void> => {
    const spaceIds = PresenceStore.findSpaceIdsOfUser(userId);

    await Promise.all(
        spaceIds.map(async (spaceId) => {
            const owner = await resolveSpaceOrganizationId(spaceId).catch(
                () => null
            );
            if (owner !== organizationId) return;

            ListeningSync.clearUser(spaceId, userId);
        })
    );
};
