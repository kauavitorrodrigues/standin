import type { Socket } from "socket.io";
import { MediaEvents, MediaSetHiddenVideoSchema } from "@standin/contracts";
import { PresenceStore } from "@/lib/socket/presence/PresenceStore";
import { mediaDirty } from "../MediaRuntime";
import { handleMediaMessage, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";

// The people whose video this one hid. The client names users and the server
// finds the sockets, only inside the same space, as for the pins. Their audio
// is not touched, and the server drops a person from the list by itself when
// they leave the reach of the video.
export function registerMediaSetHiddenVideo(socket: Socket) {
    socket.on(MediaEvents.SET_HIDDEN_VIDEO, (payload) =>
        handleMediaMessage(() => {
            const input = parseOrThrow(MediaSetHiddenVideoSchema, payload);
            const { spaceId, room } = requireExistingMediaContext(socket);

            const hiddenIds = input.userIds.flatMap((userId) =>
                PresenceStore.findSocketIdsOfUser(spaceId, userId)
            );
            room.setHiddenVideo(socket.id, hiddenIds);
            mediaDirty.markReceivers(spaceId, [socket.id]);
        })
    );
}
