import type { MapAccess } from "@standin/core";
import type { MapServerEvents } from "@standin/contracts";
import { SocketManager } from "@/lib/socket/socketManager";
import { buildMapRoom } from "./buildMapRoom";
import { buildSpaceRoom } from "./buildSpaceRoom";

/**
 * Best-effort, called after the transaction commits. A client that misses an
 * event sees the change on its next render payload fetch, so a socket failure
 * must never fail the request.
 */
export const emitMapEvent = <K extends keyof MapServerEvents>(
    access: Pick<MapAccess, "owner" | "mapId">,
    event: K,
    ...args: Parameters<MapServerEvents[K]>
): void => {
    try {
        const room =
            access.owner.kind === "space"
                ? buildSpaceRoom(access.owner.spaceId)
                : buildMapRoom(access.mapId);
        SocketManager.emitToRoom(room, event, ...args);
    } catch (error) {
        console.error(error);
    }
};
