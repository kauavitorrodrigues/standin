// The four frames of a walk are stride, stand, stride, stand. This is which
// stride (0 or 1, one for each foot) a frame of the walk shows, or null for
// the standing frames in between.
export const resolveStride = (step: number): 0 | 1 | null => {
    switch (step) {
        case 0:
            return 0;
        case 2:
            return 1;
        default:
            return null;
    }
};
