import type { AvatarSheetChange } from "@standin/core";
import { SpaceEvents } from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";

// Tells every space where the person is connected that the sheet changed.
// The core runs this before it deletes the old file, so whoever still draws
// the old sheet has time to swap. The presence keeps the new sheet, so a join
// that comes next already draws it.
export const broadcastAvatarChange = async (
    change: AvatarSheetChange
): Promise<void> => {
    const spaceIds = PresenceStore.updateUser(change.userId, {
        avatarSheetFileId: change.avatarSheetFileId,
    });

    spaceIds.forEach((spaceId) => {
        SocketManager.emitToRoom(
            buildSpaceRoom(spaceId),
            SpaceEvents.SPACE_AVATAR_CHANGED,
            {
                userId: change.userId,
                avatarSheetFileId: change.avatarSheetFileId,
            }
        );
    });
};
