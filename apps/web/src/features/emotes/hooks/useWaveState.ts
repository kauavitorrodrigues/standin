import { useEffect, useState, useSyncExternalStore } from "react";
import type { WaveActivity } from "@/features/emotes/lib/WaveActivity";
import type { WaveState } from "@/features/emotes/types/wave";
import { resolveWaveState } from "@/features/emotes/utils/resolveWaveState";

// The wave state of one person, on the clock of the page. It changes when a
// wave is sent or received, and again by itself when the cooldown or the
// "waved at you" window ends.
export const useWaveState = (
    activity: WaveActivity,
    userId: string
): WaveState => {
    const record = useSyncExternalStore(activity.subscribe, () =>
        activity.get(userId)
    );
    const [now, setNow] = useState(() => performance.now());
    const state = resolveWaveState(record, now);

    // A new record was made at a later time than the clock read at the last
    // render, so the clock is read again before anything is timed from it.
    useEffect(() => {
        const timer = setTimeout(() => setNow(performance.now()), 0);
        return () => clearTimeout(timer);
    }, [record]);

    useEffect(() => {
        if (state.nextChangeMs === null) return;

        const timer = setTimeout(
            () => setNow(performance.now()),
            state.nextChangeMs
        );
        return () => clearTimeout(timer);
    }, [state.nextChangeMs]);

    return state;
};
