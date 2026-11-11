/**
 * Whether the motion effects stay off: the system asks for less motion, or the
 * person turned it off in the app (or the app degraded to save the machine).
 */
export const isMotionReduced = (
    isSystemReduced: boolean,
    isAppReduced: boolean
): boolean => isSystemReduced || isAppReduced;
