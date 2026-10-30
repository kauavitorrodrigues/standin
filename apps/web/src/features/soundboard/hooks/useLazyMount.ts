import { useState } from "react";

/**
 * True once `active` has been true, and from then on. Content that fetches
 * waits for the first opening, and after that it stays, so what the person
 * typed is kept when the section is closed and opened again.
 */
export const useLazyMount = (active: boolean): boolean => {
    const [mounted, setMounted] = useState(active);
    if (active && !mounted) setMounted(true);
    return mounted;
};
