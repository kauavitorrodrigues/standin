import { ServerLoadMonitor } from "@standin/media";
import { SpaceInterests } from "@/lib/socket/realtime/SpaceInterests";
import { MEDIA_LOAD_SAMPLE_MS, MEDIA_TICK_MS } from "./consts/media";
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
 * receiver the planner held back goes into the next tick. Next to it, a slower
 * loop reads the CPU time of the worker and, when it stays short of CPU, has
 * the receivers hold back the videos that matter least.
 *
 * @returns stop(), used by the tests and by the shutdown.
 */
export const startMediaTicker = (
    intervalMs: number = MEDIA_TICK_MS
): (() => void) => {
    let running = false;
    const load = new ServerLoadMonitor();
    let sampling = false;

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

    // The level of the load applies to every space, and the receivers of the
    // spaces that changed are planned again at once.
    const sampleLoad = async () => {
        if (sampling) return;
        sampling = true;
        try {
            const usage = await MediaRuntime.usage();
            if (!usage) return;

            const level = load.observe(usage.workerCpuSeconds, Date.now());
            for (const spaceId of MediaRuntime.setVideoShed(level)) {
                const room = MediaRuntime.getRoom(spaceId);
                if (room) mediaDirty.markReceivers(spaceId, room.peerIds());
            }
        } catch (error) {
            console.error(MediaLogMessages.tickFailed, error);
        } finally {
            sampling = false;
        }
    };

    const timer = setInterval(() => void tick(), intervalMs);
    const loadTimer = setInterval(() => void sampleLoad(), MEDIA_LOAD_SAMPLE_MS);
    timer.unref();
    loadTimer.unref();
    return () => {
        clearInterval(timer);
        clearInterval(loadTimer);
    };
};
