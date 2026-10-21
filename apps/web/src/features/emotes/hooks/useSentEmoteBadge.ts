import { useCallback, useEffect, useRef, useState } from "react";
import { SENT_BADGE_DURATION_MS } from "@/features/emotes/consts/history";

// The emoji just sent, for a moment. The badge shows it over the button so a
// reaction sent with the bar closed (a key press) still has feedback.
export const useSentEmoteBadge = () => {
    const [emoji, setEmoji] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current !== null) clearTimeout(timer.current);
        },
        []
    );

    const show = useCallback((sent: string) => {
        if (timer.current !== null) clearTimeout(timer.current);

        setEmoji(sent);
        timer.current = setTimeout(
            () => setEmoji(null),
            SENT_BADGE_DURATION_MS
        );
    }, []);

    return { emoji, show };
};
