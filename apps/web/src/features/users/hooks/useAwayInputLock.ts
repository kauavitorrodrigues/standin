import { useEffect } from "react";
import { acquireGameInputLock } from "@/features/game/utils/inputLock";

/** Keeps the keyboard away from the game while the person is away. */
export const useAwayInputLock = (isAway: boolean): void => {
    useEffect(() => {
        if (!isAway) return;
        return acquireGameInputLock();
    }, [isAway]);
};
