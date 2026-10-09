import { useCallback, useRef, useState } from "react";
import {
    addTypingUser,
    removeTypingUser,
    type TypingByConversation,
} from "@/features/chat/utils/typingByConversation";
import { TYPING_EXPIRY_MS } from "@/features/chat/consts/typing";

// Who is typing in each conversation, as told by the peers.
export const useTypingByConversation = () => {
    const [typingByConversation, setTypingByConversation] =
        useState<TypingByConversation>({});

    // Keyed by `${conversationId}:${userId}`. Tracks the fallback timer that
    // clears a typing indicator if the matching typing:false is ever lost.
    const typingTimeoutsRef = useRef<
        Record<string, ReturnType<typeof setTimeout>>
    >({});

    const setUserTyping = useCallback(
        (
            conversationId: string,
            userId: string,
            userName: string,
            isTyping: boolean
        ) => {
            const key = `${conversationId}:${userId}`;
            clearTimeout(typingTimeoutsRef.current[key]);
            delete typingTimeoutsRef.current[key];

            if (isTyping) {
                typingTimeoutsRef.current[key] = setTimeout(() => {
                    setTypingByConversation((state) =>
                        removeTypingUser(state, conversationId, userId)
                    );
                }, TYPING_EXPIRY_MS);
            }

            setTypingByConversation((state) =>
                isTyping
                    ? addTypingUser(state, conversationId, userId, userName)
                    : removeTypingUser(state, conversationId, userId)
            );
        },
        []
    );

    return { typingByConversation, setUserTyping };
};
