import { SpaceInterests } from "@/lib/socket/realtime/SpaceInterests";
import { MEDIA_TICK_MS } from "./consts/media";
import { MediaLogMessages } from "./consts/messages";
import { emitSpeakers } from "./emitSpeakers";
import { MediaRuntime, mediaDirty } from "./MediaRuntime";
import { syncRoomKeys } from "./syncRoomKeys";
import { dirtyRadiusForPreset } from "./utils/dirtyRadiusForPreset";

/**
 * Starts the loop that keeps every receiver's streams up to date. On each tick,
 * for each space with media, it copies the private rooms into the media room,
 * takes the people whose surroundings changed, asks the planner for their new
 * plan and applies it, then sends each person the speakers they can hear. A
 * receiver the planner held back goes into the next tick.
 *
 * @returns stop(), used by the tests and by the shutdown.
 */
export const startMediaTicker = (
    intervalMs: number = MEDIA_TICK_MS
): (() => void) => {
    let running = false;

    const tickSpace = async (spaceId: string): Promise<void> => {
        const room = MediaRuntime.getRoom(spaceId);
        if (!room) return;

        syncRoomKeys(spaceId, room);
        const index = SpaceInterests.indexOf(spaceId);
        const dirty = mediaDirty.take(
            spaceId,
            index,
            room.currentConsumers(),
            dirtyRadiusForPreset(room.getProximityPreset())
        );
        if (dirty.size > 0) {
            const deferred = await room.tick(Date.now(), index, dirty);
            mediaDirty.markReceivers(spaceId, deferred);
        }
        room.syncDemand(Date.now());
        emitSpeakers(spaceId, room);
    };

    const tick = async () => {
        // A tick that is still applying must finish before the next starts.
        if (running) return;
        running = true;
        try {
            for (const spaceId of MediaRuntime.activeSpaceIds()) {
                try {
                    await tickSpace(spaceId);
                } catch (error) {
                    console.error(MediaLogMessages.tickFailed, error);
                }
            }
        } finally {
            running = false;
        }
    };

    const timer = setInterval(() => void tick(), intervalMs);
    timer.unref();
    return () => clearInterval(timer);
};
