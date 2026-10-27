import { createContext, useContext } from "react";
import { useRealtimeTypingBroadcast } from "@/features/chat/hooks/useRealtimeTypingBroadcast";

// What the chat tells the space through the socket. Only typing is left: a
// message, an edit, a deletion or a reaction is sent by the server once it is
// saved. Typing lives in a separate context (PeerTypingContext) for what it
// shows, since it changes on every keystroke.
export type PeerChatContextType = {
    broadcastTyping: (conversationId: string, isTyping: boolean) => void;
};

export const PeerChatContext = createContext<PeerChatContextType | null>(null);

// Outside a Space there is no connection of a space to type through, so the
// connection of the app carries it.
export const usePeerChat = (): PeerChatContextType => {
    const context = useContext(PeerChatContext);
    const broadcastTyping = useRealtimeTypingBroadcast();
    return context ?? { broadcastTyping };
};
