import { SpaceEvents } from "@standin/contracts";
import type { UserProfilePictureChange } from "@standin/core";
import { UserCache } from "@/features/auth/services/userCache";
import { PresenceStore } from "../presence/PresenceStore";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";

// Tells every space where the person is connected that the profile picture
// changed, or was removed (null). The other tabs of the person receive it too,
// since they sit in the same rooms.
export const broadcastProfilePictureChange = async (
    change: UserProfilePictureChange
): Promise<void> => {
    UserCache.invalidate(change.userId);
    const spaceIds = PresenceStore.updateUser(change.userId, {
        profilePictureUrl: change.profilePictureUrl,
    });

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
