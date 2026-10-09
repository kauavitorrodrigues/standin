// While the camera is being tested in the settings, the device belongs to
// the preview alone: the camera that is sent to the others lets go of it
// and takes it back when the test ends.
let held = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const cameraPreviewLock = {
    isHeld: () => held,
    acquire: () => {
        held = true;
        emit();
    },
    release: () => {
        held = false;
        emit();
    },
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
