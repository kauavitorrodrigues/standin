import { SpaceNotFoundError } from "@standin/contracts";
import type { OrganizationMemberRemoval } from "@standin/core";
import { UserCache } from "@/features/auth/services/userCache";
import { JoinAccessCache } from "./joinAccessCache";
import { resolveSpaceOrganizationId } from "./resolveSpaceOrganizationId";
import { SocketManager } from "../socketManager";
import { buildUserRoom } from "../utils/buildUserRoom";

// A space that no longer exists went away with its organization, so whoever
// is still in it has to leave as well.
const isSpaceOfOrganization = async (
    spaceId: string,
    organizationId: string
): Promise<boolean> => {
    try {
        return (await resolveSpaceOrganizationId(spaceId)) === organizationId;
    } catch (error) {
        if (error instanceof SpaceNotFoundError) return true;
        throw error;
    }
};

// A person who is no longer a member of an organization loses what the caches
// remembered and is put out of the spaces of that organization they are in.
// The disconnect handler tells the room the peer left.
export const broadcastMemberRemoved = async ({
    userId,
    organizationId,
}: OrganizationMemberRemoval): Promise<void> => {
    UserCache.invalidate(userId);
    JoinAccessCache.invalidateUser(userId);

    const sockets = await SocketManager.get()
        .in(buildUserRoom(userId))
        .fetchSockets();
    for (const socket of sockets) {
        const { spaceId } = socket.data;
        if (!spaceId) continue;
        if (await isSpaceOfOrganization(spaceId, organizationId)) {
            socket.disconnect(true);
        }
    }
};
