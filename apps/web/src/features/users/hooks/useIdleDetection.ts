import { useEffect } from "react";
import {
    IDLE_ACTIVITY_EVENTS,
    IDLE_AWAY_AFTER_MS,
    SPEECH_ACTIVITY_PULSE_MS,
} from "../consts/availability";
import { setIdle, setSpeechListener } from "../lib/availabilityStore";
import { createIdleWatcher } from "../utils/idleWatcher";

/**
 * Marks the local person as idle after a while without mouse, keyboard, touch
 * or focus on the tab and no speech into the microphone, and as active again on the first sign of life. Mount it
 * once, where the person is in a space.
 */
export const useIdleDetection = () => {
    useEffect(() => {
        const watcher = createIdleWatcher({
            timeoutMs: IDLE_AWAY_AFTER_MS,
            speechPulseMs: SPEECH_ACTIVITY_PULSE_MS,
            onChange: setIdle,
        });
        const onActivity = () => watcher.activity();
        const onVisibility = () => {
            if (document.visibilityState === "visible") watcher.activity();
        };

        IDLE_ACTIVITY_EVENTS.forEach((name) =>
            window.addEventListener(name, onActivity, { passive: true })
        );
        document.addEventListener("visibilitychange", onVisibility);
        setSpeechListener(watcher.speaking);

        return () => {
            IDLE_ACTIVITY_EVENTS.forEach((name) =>
                window.removeEventListener(name, onActivity)
            );
            document.removeEventListener("visibilitychange", onVisibility);
            setSpeechListener(null);
            watcher.stop();
            setIdle(false);
        };
    }, []);
};
