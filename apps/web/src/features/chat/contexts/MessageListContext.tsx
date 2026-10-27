import { createContext, useContext } from "react";

export type MessageListContextType = {
    // Set when the list is the replies of one thread, so edits and deletes
    // reach the cache of that list instead of the main one.
    threadParentId: string | undefined;
    // Opens the thread of a top-level message. Absent when no thread panel
    // can open from this list, which hides the reply action.
    onOpenThread: ((messageId: string) => void) | undefined;
};

const NOOP_CONTEXT: MessageListContextType = {
    threadParentId: undefined,
    onOpenThread: undefined,
};

export const MessageListContext =
    createContext<MessageListContextType>(NOOP_CONTEXT);

export const useMessageList = () => useContext(MessageListContext);
