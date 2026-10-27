import type { Socket } from "socket.io";
import { MediaEvents, MediaSetPrivacySchema } from "@standin/contracts";
import { mediaDirty, MediaRuntime } from "../MediaRuntime";
import { PresenceStore } from "@/lib/socket/presence/PresenceStore";
import { buildSpaceRoom } from "@/lib/socket/utils/buildSpaceRoom";
import { handleMediaMessage, parseOrThrow } from "./mediaRequest";

// The privacy modes live in the presence of the space, so a person who joins
// later learns them from the snapshot, and the ones inside hear the change.
// Headphones cut every connection of the person, so the neighbours are marked
// dirty for the planner to drop or restore the streams.
export function registerMediaSetPrivacy(socket: Socket) {
    socket.on(MediaEvents.SET_PRIVACY, (payload) =>
        handleMediaMessage(() => {
            const input = parseOrThrow(MediaSetPrivacySchema, payload);
            const spaceId = socket.data.spaceId as string | null;
            if (!spaceId) return;

            // Without a media session only the presence changes.
            const room = MediaRuntime.getRoom(spaceId);
            if (room?.hasPeer(socket.id)) {
                room.setPrivacy(socket.id, input);
                mediaDirty.markMoved(spaceId, socket.id);
            }

            const changed = PresenceStore.setPrivacy(
                spaceId,
                socket.id,
                input
            );
            if (!changed) return;

            socket
                .to(buildSpaceRoom(spaceId))
                .emit(MediaEvents.PRIVACY_CHANGED, {
                    userId: socket.data.userId,
                    headphones: input.headphones,
                    focus: input.focus,
                });
        })
    );
}
