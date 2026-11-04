import { createContext, useContext } from "react";

export type ChatPageContextType = {
    // Everyone currently in the space.
    onlineUserIds: readonly string[];
    // The conversation of the space itself, the only one that takes mentions.
    spaceConversationId: string;
    // A link that opens the space straight on this conversation.
    getConversationLink: (conversationId: string) => string;
};

export const ChatPageContext = createContext<ChatPageContextType | null>(null);

const NOOP_CONTEXT: ChatPageContextType = {
    onlineUserIds: [],
    spaceConversationId: "",
    getConversationLink: () => window.location.href,
};

export const useChatPage = () => useContext(ChatPageContext) ?? NOOP_CONTEXT;
