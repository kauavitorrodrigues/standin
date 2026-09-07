import { ConversationThread } from "@/features/chat/components/instances/ConversationThread";
import type { SidebarBodyProps } from "@/features/chat/components/layout/SidebarBodyProps";

// A conversation is only ever selected once the thread view becomes
// reachable, but the type still allows null, so this guards itself instead
// of the parent asserting it away.
export const ThreadBody = ({ space, conversationId }: SidebarBodyProps) => {
    if (!conversationId) return null;
    return (
        <ConversationThread
            conversationId={conversationId}
            // Whether there's only ever one other person who could possibly
            // read this message. Approximated today via "not the space
            // conversation", since DIRECT is currently always exactly 1:1
            // (see ConversationList). If a future conversation type (e.g.
            // a group DM) breaks that assumption, this should switch to an
            // actual participant count instead of the conversation type.
            hasSingleViewer={conversationId !== space.conversationId}
        />
    );
};
