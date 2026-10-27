import { useEffect, useRef } from "react";
import {
    TYPING_STOP_DELAY_MS,
    TYPING_THROTTLE_LEADING_MS,
    TYPING_THROTTLE_SUBSEQUENT_MS,
} from "@/features/chat/consts/typing";
import { hasTypedContent } from "@/features/chat/utils/sendMessageForm";

type Options = {
    conversationId: string;
    content: string | undefined;
    broadcastTyping: (conversationId: string, isTyping: boolean) => void;
};

// Broadcasts typing:true with an asymmetric throttle: the first event 1 s
// after typing starts, then at most one every 2 s while it continues.
// typing:false goes
// out once the user has been idle for TYPING_STOP_DELAY_MS, or right away
// when the content is cleared (after a send, for instance).
export const useTypingBroadcast = ({
    conversationId,
    content,
    broadcastTyping,
}: Options) => {
    const broadcastRef = useRef(broadcastTyping);
    useEffect(() => {
        broadcastRef.current = broadcastTyping;
    }, [broadcastTyping]);

    const lastSentAtRef = useRef<number | null>(null);
    const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clears timers and forgets the typing session. Returns whether a
    // typing:true had been sent in it.
    const endSession = () => {
        if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        throttleTimerRef.current = null;
        stopTimerRef.current = null;
        const wasSent = lastSentAtRef.current !== null;
        lastSentAtRef.current = null;
        return wasSent;
    };

    // Leaving a conversation while typing in it tells the other side to stop
    // showing the indicator, which would otherwise wait for its own expiry.
    useEffect(() => {
        return () => {
            if (endSession()) broadcastRef.current(conversationId, false);
        };
    }, [conversationId]);

    useEffect(() => {
        if (!hasTypedContent(content)) {
            if (endSession()) broadcastRef.current(conversationId, false);
            return;
        }

        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        stopTimerRef.current = setTimeout(() => {
            endSession();
            broadcastRef.current(conversationId, false);
        }, TYPING_STOP_DELAY_MS);

        if (throttleTimerRef.current) return;

        const lastSentAt = lastSentAtRef.current;
        const delay =
            lastSentAt === null
                ? TYPING_THROTTLE_LEADING_MS
                : Math.max(
                    0,
                    TYPING_THROTTLE_SUBSEQUENT_MS - (Date.now() - lastSentAt)
                );

        throttleTimerRef.current = setTimeout(() => {
            throttleTimerRef.current = null;
            lastSentAtRef.current = Date.now();
            broadcastRef.current(conversationId, true);
        }, delay);
    }, [content, conversationId]);
};
