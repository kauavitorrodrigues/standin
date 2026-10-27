import type { Socket } from "socket.io";
import { SpaceEvents, SpacePositionSchema } from "@standin/contracts";
import { mediaDirty } from "@/lib/media/MediaRuntime";
import { SpaceInterests } from "../realtime/SpaceInterests";

// The position of the avatar of this socket. The person is the one the socket
// authenticated and the space is the one it joined, so nothing about who or
// where comes from the payload. It is rounded to whole px: nobody can see a
// smaller step, and it keeps the batches small.
export function registerSpacePosition(socket: Socket) {
    socket.on(SpaceEvents.SPACE_POSITION, (payload) => {
        const { spaceId } = socket.data;
        if (!spaceId) return;

        const parsed = SpacePositionSchema.safeParse(payload);
        if (!parsed.success) return;

        const { x, y, direction, isSitting } = parsed.data;
        const next = { x: Math.round(x), y: Math.round(y) };
        const previous = SpaceInterests.get(spaceId, socket.id);
        SpaceInterests.update(spaceId, socket.id, {
            ...next,
            direction,
            isSitting,
        });
        // The people around the one who moved may now hear or see them, or
        // stop to, so the media planner looks at them on its next tick. A
        // repeated position changes nothing and is not marked.
        if (previous?.x !== next.x || previous?.y !== next.y) {
            mediaDirty.markMoved(spaceId, socket.id);
        }
    });
}
