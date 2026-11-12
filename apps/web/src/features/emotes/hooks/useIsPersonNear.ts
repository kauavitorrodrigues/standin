import { useEffect, useState } from "react";
import { WAVE_BUTTON } from "@/features/emotes/consts/waveButton";

// Whether a person is within the reach of a wave, read from the scene a few
// times a second since the avatars move without telling React. The caller keys
// it by the person, so the first value is already theirs.
export const useIsPersonNear = (
    isNear: (userId: string) => boolean,
    userId: string
): boolean => {
    const [near, setNear] = useState(() => isNear(userId));

    useEffect(() => {
        const timer = setInterval(
            () => setNear(isNear(userId)),
            WAVE_BUTTON.POLL_MS
        );
        return () => clearInterval(timer);
    }, [isNear, userId]);

    return near;
};
