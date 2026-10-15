import { useEffect, useState } from "react";

// Whether `key` has stayed the same for `delayMs`. It starts false and drops
// back to false the moment the key changes, so a new key waits its own time.
export const useDwell = (key: string, delayMs: number): boolean => {
    const [dwelledKey, setDwelledKey] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDwelledKey(key), delayMs);
        return () => {
            clearTimeout(timer);
            setDwelledKey(null);
        };
    }, [key, delayMs]);

    return dwelledKey === key;
};
