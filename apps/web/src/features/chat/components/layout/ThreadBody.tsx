import { ConversationThread } from "@/features/chat/components/instances/ConversationThread";
import type { SidebarBodyProps } from "@/features/chat/components/layout/SidebarBodyProps";

// A conversation is only ever selected once the thread view becomes
// reachable, but the type still allows null, so this guards itself instead
// of the parent asserting it away.
export const ThreadBody = ({ conversationId }: SidebarBodyProps) => {
    if (!conversationId) return null;
    return <ConversationThread conversationId={conversationId} />;
};
