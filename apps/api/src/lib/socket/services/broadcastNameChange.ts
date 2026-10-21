import { SpaceEvents } from "@standin/contracts";
import type { UserNameChange } from "@standin/core";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { findSpaceIdsOfUser } from "./findSpaceIdsOfUser";

// Tells every space where the person is connected that the name changed. The
// other tabs of the person receive it too, since they sit in the same rooms.
export const broadcastNameChange = async (
    change: UserNameChange
): Promise<void> => {
    const spaceIds = await findSpaceIdsOfUser(change.userId);

    spaceIds.forEach((spaceId) => {
        SocketManager.emitToRoom(
            buildSpaceRoom(spaceId),
            SpaceEvents.SPACE_NAME_CHANGED,
            { userId: change.userId, name: change.name }
        );
    });
};
