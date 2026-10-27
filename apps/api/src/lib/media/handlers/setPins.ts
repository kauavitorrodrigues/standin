import type { Socket } from "socket.io";
import { MediaEvents, MediaSetPinsSchema } from "@standin/contracts";
import { PresenceStore } from "@/lib/socket/presence/PresenceStore";
import { mediaDirty } from "../MediaRuntime";
import { handleMediaMessage, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";

// The people this one pinned on the stage keep a video slot while they are
// close enough. The client names users and the server finds the sockets, only
// inside the same space. The planner still applies the radius and the rooms.
export function registerMediaSetPins(socket: Socket) {
    socket.on(MediaEvents.SET_PINS, (payload) =>
        handleMediaMessage(() => {
            const input = parseOrThrow(MediaSetPinsSchema, payload);
            const { spaceId, room } = requireExistingMediaContext(socket);

            const pinnedIds = input.userIds.flatMap((userId) =>
                PresenceStore.findSocketIdsOfUser(spaceId, userId).slice(0, 1)
            );
            room.setPins(socket.id, pinnedIds);
            mediaDirty.markReceivers(spaceId, [socket.id]);
        })
    );
}
