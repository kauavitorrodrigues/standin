import { createContext, useContext } from "react";
import type { MessageWithDetails } from "@standin/contracts";

// Typing state lives in a separate context (PeerTypingContext) even though
// it's broadcast the same way as everything else here: it changes on every
// keystroke, and this context's value is consumed far beyond the typing
// indicator, so keeping it out avoids re-rendering the whole message list
// on every keystroke.
export type PeerChatContextType = {
    broadcastChatMessage: (
        conversationId: string,
        message: MessageWithDetails
    ) => void;
    broadcastTyping: (conversationId: string, isTyping: boolean) => void;
    broadcastReaction: (
        conversationId: string,
        messageId: string,
        emoji: string,
        added: boolean
    ) => void;
    broadcastEdit: (
        conversationId: string,
        messageId: string,
        content: string,
        editedAt: string
    ) => void;
    broadcastDelete: (conversationId: string, messageId: string) => void;
    broadcastConfirm: (
        conversationId: string,
        tempId: string,
        message: MessageWithDetails
    ) => void;
};

export const PeerChatContext = createContext<PeerChatContextType | null>(null);

// Anything rendered outside a Space (e.g. a chat preview in isolation) gets
// safe no-ops instead of a thrown error, since P2P delivery is an
// enhancement on top of the persisted API flow, not a requirement for chat
// to render.
const NOOP_CONTEXT: PeerChatContextType = {
    broadcastChatMessage: () => {},
    broadcastTyping: () => {},
    broadcastReaction: () => {},
    broadcastEdit: () => {},
    broadcastDelete: () => {},
    broadcastConfirm: () => {},
};

export const usePeerChat = () => useContext(PeerChatContext) ?? NOOP_CONTEXT;