import type { RunWithoutLockDeps } from "@/features/maps/__shared__/types/RunWithoutLockDeps";

// Runs something that the server refuses while the map is locked, even for
// whoever holds the lock (the delete). The draft goes first, so leaving is not
// held back by unsaved changes, then the lock is given back and awaited. When
// the action fails the editor must not stay without the lock: it asks for it
// again, and if that does not work the editor is marked as lost so the lock
// recovery takes over. The error goes on to the caller.
export const runWithoutLock = async ({
    hasChanges,
    discard,
    control,
    action,
}: RunWithoutLockDeps): Promise<void> => {
    if (hasChanges) await discard();
    await control.release();
    try {
        await action();
    } catch (error) {
        const ack = await control.reacquire();
        if (!ack?.ok) control.markLost();
        throw error;
    }
};
