import type { AvatarSheetChange, AvatarSheetListener } from "../types";

const listeners = new Set<AvatarSheetListener>();

/**
 * Registers a function that runs every time the assembled sheet of a person
 * is replaced or cleared, whatever the cause (the person saved, or a part was
 * swapped and the sheet was assembled again). The old `files` row of the
 * sheet is deleted only after every listener returned, so the clients still
 * drawing it have time to swap. Returns a function that removes the listener.
 */
export const onAvatarSheetChanged = (
    listener: AvatarSheetListener
): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/** A listener that throws is logged and does not stop the others. */
export const publishAvatarSheetChanged = async (
    change: AvatarSheetChange
): Promise<void> => {
    for (const listener of listeners) {
        try {
            await listener(change);
        } catch (error) {
            console.error(error);
        }
    }
};
