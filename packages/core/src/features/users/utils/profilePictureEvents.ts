import type {
    UserProfilePictureChange,
    UserProfilePictureListener,
} from "../types";

const listeners = new Set<UserProfilePictureListener>();

/**
 * Registers a function that runs every time a person sets or removes their
 * profile picture, so the layers that show it live (the sockets) can tell
 * whoever is looking. Returns a function that removes the listener.
 */
export const onUserProfilePictureChanged = (
    listener: UserProfilePictureListener
): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/** A listener that throws is logged and does not stop the others. */
export const publishUserProfilePictureChanged = async (
    change: UserProfilePictureChange
): Promise<void> => {
    for (const listener of listeners) {
        try {
            await listener(change);
        } catch (error) {
            console.error(error);
        }
    }
};
