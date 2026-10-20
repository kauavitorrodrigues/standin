import type { AvatarSheetChange } from "@standin/core";
import { SpaceEvents } from "@standin/contracts";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { buildUserRoom } from "../utils/buildUserRoom";

// Tells every space where the person is connected that the sheet changed.
// The core runs this before it deletes the old file, so whoever still draws
// the old sheet has time to swap.
export const broadcastAvatarChange = async (
    change: AvatarSheetChange
): Promise<void> => {
    const io = SocketManager.get();
    const connections = await io
        .in(buildUserRoom(change.userId))
        .fetchSockets();

    const spaceIds = new Set<string>();
    connections.forEach((connection) => {
        const spaceId = (connection.data as { spaceId?: string | null })
            .spaceId;
        if (spaceId) spaceIds.add(spaceId);
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
