import { SocketManager } from "../socketManager";
import { buildUserRoom } from "../utils/buildUserRoom";

// The spaces where the person is connected right now, once each even with
// several tabs in the same one.
export const findSpaceIdsOfUser = async (
    userId: string
): Promise<Set<string>> => {
    const connections = await SocketManager.get()
        .in(buildUserRoom(userId))
        .fetchSockets();

    const spaceIds = new Set<string>();
    connections.forEach((connection) => {
        const spaceId = (connection.data as { spaceId?: string | null })
            .spaceId;
        if (spaceId) spaceIds.add(spaceId);
    });
    return spaceIds;
};
