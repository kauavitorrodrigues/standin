import { MapEvents } from "@standin/contracts";
import { DeskService, type OrganizationMemberRemoval } from "@standin/core";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";

// A person who is no longer a member of an organization has given up the desks
// they held in its spaces, and whoever is in those spaces sees them free.
export const broadcastMemberDesksReleased = async ({
    userId,
    organizationId,
    freedDesks,
}: OrganizationMemberRemoval): Promise<void> => {
    // A removal frees them in its own transaction. Only the deletion of an
    // organization leaves it to this listener.
    const freed =
        freedDesks ??
        (await DeskService.releaseForMember(userId, organizationId));

    for (const { spaceId, mapAssetId } of freed) {
        SocketManager.emitToRoom(
            buildSpaceRoom(spaceId),
            MapEvents.DESK_RELEASED,
            { mapAssetId, userId }
        );
    }
};
