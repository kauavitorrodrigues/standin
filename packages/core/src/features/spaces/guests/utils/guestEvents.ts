import type { SpaceGuestEvent, SpaceGuestListener } from "../types";

const listeners = new Set<SpaceGuestListener>();

/**
 * Registers a function that runs on every step of the approval (a request, an
 * answer, a guest losing the access), so the sockets can tell the hosts and
 * the guest as it happens. Returns a function that removes the listener.
 */
export const onSpaceGuestEvent = (
    listener: SpaceGuestListener
): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/** A listener that throws is logged and does not stop the others. */
export const publishSpaceGuestEvent = async (
    event: SpaceGuestEvent
): Promise<void> => {
    for (const listener of listeners) {
        try {
            await listener(event);
        } catch (error) {
            console.error(error);
        }
    }
};

/** Tells the hosts of a space that its list of requests changed. */
export const publishGuestListChanged = (spaceId: string): Promise<void> =>
    publishSpaceGuestEvent({ type: "updated", spaceId });
