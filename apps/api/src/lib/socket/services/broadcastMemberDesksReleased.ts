import { MapEvents } from "@standin/contracts";
import { DeskService, type OrganizationMemberRemoval } from "@standin/core";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";

// A person who is no longer a member of an organization gives up the desks
// they held in its spaces, and whoever is in those spaces sees them free.
export const broadcastMemberDesksReleased = async ({
    userId,
    organizationId,
}: OrganizationMemberRemoval): Promise<void> => {
    const freed = await DeskService.releaseForMember(userId, organizationId);

    for (const { spaceId, mapAssetId } of freed) {
        SocketManager.emitToRoom(
            buildSpaceRoom(spaceId),
            MapEvents.DESK_RELEASED,
            { mapAssetId, userId }
        );
    }
};
