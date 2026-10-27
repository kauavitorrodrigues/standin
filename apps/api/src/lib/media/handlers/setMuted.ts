import type { Socket } from "socket.io";
import { MediaEvents, MediaSetMutedSchema } from "@standin/contracts";
import { mediaDirty, MediaRuntime } from "../MediaRuntime";
import { PresenceStore } from "@/lib/socket/presence/PresenceStore";
import { buildSpaceRoom } from "@/lib/socket/utils/buildSpaceRoom";
import { handleMediaMessage, parseOrThrow } from "./mediaRequest";

// The microphone state lives in the presence of the space, so a person who
// joins later learns it from the snapshot, and the ones inside hear the change.
export function registerMediaSetMuted(socket: Socket) {
    socket.on(MediaEvents.SET_MUTED, (payload) =>
        handleMediaMessage(() => {
            const input = parseOrThrow(MediaSetMutedSchema, payload);
            const spaceId = socket.data.spaceId as string | null;
            if (!spaceId) return;

            // Without a media session only the presence changes.
            const room = MediaRuntime.getRoom(spaceId);
            if (room?.hasPeer(socket.id)) {
                room.setMuted(socket.id, input.muted);
                mediaDirty.markMoved(spaceId, socket.id);
            }

            const changed = PresenceStore.setMuted(
                spaceId,
                socket.id,
                input.muted
            );
            if (!changed) return;

            socket.to(buildSpaceRoom(spaceId)).emit(MediaEvents.STATE_CHANGED, {
                userId: socket.data.userId,
                muted: input.muted,
            });
        })
    );
}
