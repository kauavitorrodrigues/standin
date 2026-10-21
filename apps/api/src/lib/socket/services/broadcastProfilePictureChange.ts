import { SpaceEvents } from "@standin/contracts";
import type { UserProfilePictureChange } from "@standin/core";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { findSpaceIdsOfUser } from "./findSpaceIdsOfUser";

// Tells every space where the person is connected that the profile picture
// changed, or was removed (null). The other tabs of the person receive it too,
// since they sit in the same rooms.
export const broadcastProfilePictureChange = async (
    change: UserProfilePictureChange
): Promise<void> => {
    const spaceIds = await findSpaceIdsOfUser(change.userId);

    spaceIds.forEach((spaceId) => {
        SocketManager.emitToRoom(
            buildSpaceRoom(spaceId),
            SpaceEvents.SPACE_PROFILE_PICTURE_CHANGED,
            {
                userId: change.userId,
                profilePictureUrl: change.profilePictureUrl,
            }
        );
    });
};
