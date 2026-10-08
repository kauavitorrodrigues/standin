// Overlays that take over the game area (the large video view) hold this
// lock while open: movement and interaction stay off even though focus may
// be elsewhere, for instance in the chat input next to it. Kept apart from
// player.ts so it has no dependency on Phaser.
let inputLockCount = 0;
const inputLockListeners = new Set<() => void>();

const notify = () => inputLockListeners.forEach((listener) => listener());

export const acquireGameInputLock = (): (() => void) => {
    let released = false;
    inputLockCount += 1;
    notify();

    return () => {
        if (released) return;
        released = true;
        inputLockCount -= 1;
        notify();
    };
};

export const isGameInputLocked = (): boolean => inputLockCount > 0;

export const subscribeToGameInputLock = (
    listener: () => void
): (() => void) => {
    inputLockListeners.add(listener);
    return () => inputLockListeners.delete(listener);
};
