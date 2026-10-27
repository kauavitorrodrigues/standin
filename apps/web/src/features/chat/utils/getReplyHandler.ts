import type { MessageWithDetails } from "@standin/contracts";

// Only a top-level message that already exists on the server opens a thread:
// a reply cannot have replies (the API refuses a nested thread) and a pending
// message has no real id yet.
export const getReplyHandler = (
    message: Pick<MessageWithDetails, "id" | "threadParentId">,
    isPending: boolean,
    onOpenThread: ((messageId: string) => void) | undefined
): (() => void) | undefined => {
    if (!onOpenThread || isPending || message.threadParentId !== null) {
        return undefined;
    }
    return () => onOpenThread(message.id);
};
