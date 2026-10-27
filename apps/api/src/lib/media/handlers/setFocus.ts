import type { Socket } from "socket.io";
import { MediaEvents, MediaSetFocusSchema } from "@standin/contracts";
import type { SimulcastLayer } from "@standin/media";
import { PresenceStore } from "@/lib/socket/presence/PresenceStore";
import { mediaDirty } from "../MediaRuntime";
import { handleMediaMessage, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";

// The layer this one asks for per person it sees in a tile. The client names
// users and the server finds the sockets, only inside the same space.
export function registerMediaSetFocus(socket: Socket) {
    socket.on(MediaEvents.SET_FOCUS, (payload) =>
        handleMediaMessage(() => {
            const input = parseOrThrow(MediaSetFocusSchema, payload);
            const { spaceId, room } = requireExistingMediaContext(socket);

            const views = new Map<string, SimulcastLayer>();
            input.views.forEach(({ userId, layer }) => {
                const [socketId] = PresenceStore.findSocketIdsOfUser(
                    spaceId,
                    userId
                );
                if (socketId) views.set(socketId, layer);
            });
            room.setFocus(socket.id, views);
            mediaDirty.markReceivers(spaceId, [socket.id]);
        })
    );
}
