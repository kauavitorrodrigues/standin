import type { UserNameChange, UserNameListener } from "../types";

const listeners = new Set<UserNameListener>();

/**
 * Registers a function that runs every time a person is renamed, so the layers
 * that show the name live (the sockets) can tell whoever is looking at it.
 * Returns a function that removes the listener.
 */
export const onUserNameChanged = (listener: UserNameListener): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/** A listener that throws is logged and does not stop the others. */
export const publishUserNameChanged = async (
    change: UserNameChange
): Promise<void> => {
    for (const listener of listeners) {
        try {
            await listener(change);
        } catch (error) {
            console.error(error);
        }
    }
};
