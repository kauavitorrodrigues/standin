import { SpaceEvents } from "@standin/contracts";
import type { UserNameChange } from "@standin/core";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { buildUserRoom } from "../utils/buildUserRoom";

// Tells every space where the person is connected that the name changed. The
// other tabs of the person receive it too, since they sit in the same rooms.
export const broadcastNameChange = async (
    change: UserNameChange
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
            SpaceEvents.SPACE_NAME_CHANGED,
            { userId: change.userId, name: change.name }
        );
    });
};
