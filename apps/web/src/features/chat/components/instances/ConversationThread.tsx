import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { MessageList } from "@/features/chat/components/instances/MessageList";
import { SendMessageForm } from "@/features/chat/components/forms/SendMessageForm";
import { TypingIndicator } from "@/features/chat/components/layout/TypingIndicator";
import { ChatMutations } from "@/features/chat/mutations";
import { ChatQueries } from "@/features/chat/queries";

type Props = { conversationId: string; hasSingleViewer: boolean };

// No gap on this flex column on purpose: a fixed gap around the typing
// indicator would produce a visible snap when its height-collapse animation
// finishes and it unmounts. The composer's own top margin supplies that
// spacing instead, so it grows and shrinks together with the indicator.
export const ConversationThread = ({ conversationId, hasSingleViewer }: Props) => {
    const { mutate: markAsRead } = ChatMutations.markAsRead();
    // Same queryKey as MessageList's own useMessages call, so this shares
    // the already-fetched cache instead of issuing a second request.
    const { messages } = ChatQueries.useMessages(conversationId);
    const lastMessageId = messages[messages.length - 1]?.id;

    // The sidebar is CSS-hidden when collapsed, not unmounted, so this
    // component can stay mounted while off-screen. Without checking `open`,
    // a message arriving while the sidebar is closed would get marked read
    // before the user ever saw it.
    const { open: isSidebarOpen } = useSidebar();

    useEffect(() => {
        if (!isSidebarOpen) return;
        markAsRead(conversationId);
    }, [conversationId, lastMessageId, isSidebarOpen, markAsRead]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <MessageList conversationId={conversationId} hasSingleViewer={hasSingleViewer} />
            <TypingIndicator conversationId={conversationId} />
            <SendMessageForm conversationId={conversationId} />
        </div>
    );
};
