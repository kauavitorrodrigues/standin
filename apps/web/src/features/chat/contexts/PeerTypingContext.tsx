import { createContext, useContext } from "react";

export type PeerTypingContextType = {
    getTypingUsers: (
        conversationId: string
    ) => { userId: string; userName: string }[];
};

export const PeerTypingContext = createContext<PeerTypingContextType | null>(
    null
);

// Split out of PeerChatContext on purpose: this value changes on every
// typing broadcast, and only TypingIndicator needs it. Other
// PeerChatContext consumers would otherwise re-render on every keystroke a
// peer makes.
const NOOP_CONTEXT: PeerTypingContextType = {
    getTypingUsers: () => [],
};

export const usePeerTyping = () => useContext(PeerTypingContext) ?? NOOP_CONTEXT;
