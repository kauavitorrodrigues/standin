import type { ReactNode } from "react";
import type { SpaceDetails } from "@standin/contracts";
import { ConversationList } from "@/features/chat/components/instances/ConversationList";
import { Header } from "@/features/chat/components/pages/chat-page/sidebar/Header";
import type { SelectConversation } from "@/features/chat/types/chatPage";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
    space: SpaceDetails;
    selectedConversationId: string;
    onSelectConversation: SelectConversation;
    onRefresh: () => void;
    onNewConversation: () => void;
    // Pinned to the bottom of the card, under the conversation list.
    footer: ReactNode;
};

export const ConversationsSidebar = ({
    space,
    selectedConversationId,
    onSelectConversation,
    onRefresh,
    onNewConversation,
    footer,
}: Props) => (
    <aside className="flex min-h-0 w-72 shrink-0 flex-col gap-4 rounded-2xl bg-card p-2 ring-1 ring-foreground/10">
        <Header onRefresh={onRefresh} onNewConversation={onNewConversation} />
        <ScrollArea className="min-h-0 flex-1">
            <ConversationList
                space={space}
                selectedConversationId={selectedConversationId}
                onSelect={onSelectConversation}
            />
        </ScrollArea>
        <div className="flex shrink-0 flex-col gap-2">{footer}</div>
    </aside>
);
