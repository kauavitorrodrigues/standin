export type IdleWatcher = {
    // Call it on every sign of life. Cheap enough for a mouse move.
    activity: () => void;
    // Call it when the person starts or stops speaking into their microphone.
    // Speech is activity for as long as it lasts, so a long talk with no
    // mouse or keyboard keeps the person active.
    speaking: (isSpeaking: boolean) => void;
    stop: () => void;
};

type Options = {
    timeoutMs: number;
    // How often speech that goes on is counted as activity again. Shorter
    // than the timeout.
    speechPulseMs: number;
    // Called with true when the time without activity is up and with false on
    // the first activity after that.
    onChange: (isIdle: boolean) => void;
};

/**
 * Tells when there has been no activity for a while. Activity only stores the
 * time, and one timer checks it, so a stream of mouse moves costs no timers.
 */
export const createIdleWatcher = ({
    timeoutMs,
    speechPulseMs,
    onChange,
}: Options): IdleWatcher => {
    let lastActivityAt = Date.now();
    let isIdle = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let speechPulse: ReturnType<typeof setInterval> | undefined;

    const arm = (delay: number) => {
        timer = setTimeout(check, delay);
    };

    function check() {
        const remaining = timeoutMs - (Date.now() - lastActivityAt);
        if (remaining > 0) {
            arm(remaining);
            return;
        }
        isIdle = true;
        onChange(true);
    }

    const activity = () => {
        lastActivityAt = Date.now();
        if (!isIdle) return;

        isIdle = false;
        onChange(false);
        arm(timeoutMs);
    };

    const stopPulse = () => {
        clearInterval(speechPulse);
        speechPulse = undefined;
    };

    const speaking = (isSpeaking: boolean) => {
        if (!isSpeaking) {
            if (speechPulse === undefined) return;

            // The end of a speech is the last sign of life.
            stopPulse();
            activity();
            return;
        }
        activity();
        speechPulse ??= setInterval(activity, speechPulseMs);
    };

    const stop = () => {
        clearTimeout(timer);
        stopPulse();
    };

    arm(timeoutMs);
    return { activity, speaking, stop };
};
