import { AMBIENT_RANGES } from "@standin/contracts";
import type { SpaceMedia } from "@standin/media";
import { mediaDirty } from "./MediaRuntime";

// The speakers each space had on the last tick.
const lastSpeakers = new Map<string, ReadonlySet<string>>();

/**
 * The ambient ring gives its slots to the people who are speaking, so when
 * somebody starts or stops speaking the people around them are planned again.
 * Marks as moved each person whose speaking changed since the last tick, which
 * reaches the receivers inside the dirty radius of the space.
 */
export const syncSpeakerChanges = (spaceId: string, room: SpaceMedia): void => {
    // With the ring off speakers change nothing, so no extra replans.
    if (room.getAmbientRange() === AMBIENT_RANGES.OFF) {
        lastSpeakers.delete(spaceId);
        return;
    }

    const previous = lastSpeakers.get(spaceId) ?? new Set<string>();
    const next = new Set(room.speakers());
    next.forEach((peerId) => {
        if (!previous.has(peerId)) mediaDirty.markMoved(spaceId, peerId);
    });
    previous.forEach((peerId) => {
        if (!next.has(peerId)) mediaDirty.markMoved(spaceId, peerId);
    });

    if (next.size === 0) lastSpeakers.delete(spaceId);
    else lastSpeakers.set(spaceId, next);
};

/** The space has no media room any more: forget who was speaking in it. */
export const forgetSpeakerChanges = (spaceId: string): void => {
    lastSpeakers.delete(spaceId);
};
