import { useEffect, useState } from "react";
import { PROFILE_CLOCK_TICK_MS } from "../consts/profile";

export const useMinuteClock = (): Date => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(
            () => setNow(new Date()),
            PROFILE_CLOCK_TICK_MS
        );
        return () => clearInterval(timer);
    }, []);

    return now;
};
