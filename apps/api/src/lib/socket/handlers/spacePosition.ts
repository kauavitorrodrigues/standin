import type { Socket } from "socket.io";
import { SpaceEvents, SpacePositionSchema } from "@standin/contracts";
import { mediaDirty } from "@/lib/media/MediaRuntime";
import { SpaceInterests } from "../realtime/SpaceInterests";
import { AnnouncerSync } from "../realtime/AnnouncerSync";
import { buildAnnouncersSender } from "../utils/buildAnnouncersSender";
import { DanceCap } from "../realtime/DanceCap";
import { resolveDancing } from "../utils/resolveDancing";
import { RaisedHandSync } from "../realtime/RaisedHandSync";
import { buildRaisedHandsSender } from "../utils/buildRaisedHandsSender";

// A dance ends by itself: the cap stops it even when the client goes quiet.
const trackDanceCap = (
    spaceId: string,
    socketId: string,
    isDancing: boolean
): void => {
    if (!isDancing) {
        DanceCap.disarm(socketId);
        return;
    }

    DanceCap.arm(socketId, () => {
        const current = SpaceInterests.get(spaceId, socketId);
        if (!current?.isDancing) return;

        SpaceInterests.update(spaceId, socketId, {
            ...current,
            isDancing: false,
        });
    });
};

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
        const wantsToDance = parsed.data.isDancing;
        // Letting go ends the cap; asking again while capped changes nothing.
        if (!wantsToDance) DanceCap.release(socket.id);
        const isDancing =
            !DanceCap.isCapped(socket.id) &&
            resolveDancing(previous, {
                ...next,
                isSitting,
                isDancing: wantsToDance,
            });
        SpaceInterests.update(spaceId, socket.id, {
            ...next,
            direction,
            isSitting,
            isDancing,
        });
        trackDanceCap(spaceId, socket.id, isDancing);
        // The people around the one who moved may now hear or see them, or
        // stop to, so the media planner looks at them on its next tick. A
        // repeated position changes nothing and is not marked.
        if (previous?.x !== next.x || previous?.y !== next.y) {
            mediaDirty.markMoved(spaceId, socket.id);
            // Moving can bring an announcer into earshot or take one out.
            AnnouncerSync.refreshOnMove(
                spaceId,
                socket.id,
                buildAnnouncersSender(socket.nsp)
            );
            RaisedHandSync.refreshOnMove(
                spaceId,
                socket.id,
                buildRaisedHandsSender(socket.nsp)
            );
        }
    });
}
