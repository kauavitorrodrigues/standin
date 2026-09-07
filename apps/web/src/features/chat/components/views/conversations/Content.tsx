import { BuildingIcon } from "lucide-react";
import type { ConversationSummary } from "@standin/contracts";
import { ConversationItem } from "@/features/chat/components/views/conversations/ConversationItem";
import { DirectConversationItem } from "@/features/chat/components/views/conversations/DirectConversationItem";
import {
    DirectMessagesEmptyState,
    DirectMessagesErrorState,
    DirectMessagesLoadingState,
} from "@/features/chat/components/views/conversations/ContentStates";

type Props = {
    spaceName: string;
    spaceUnreadCount: number;
    directConversations: ConversationSummary[];
    isLoading: boolean;
    isError: boolean;
    onSelectSpaceConversation: () => void;
    onSelectDirectConversation: (conversation: ConversationSummary) => void;
};

export const Content = ({
    spaceName,
    spaceUnreadCount,
    directConversations,
    isLoading,
    isError,
    onSelectSpaceConversation,
    onSelectDirectConversation,
}: Props) => {
    const directMessagesContent: React.ReactNode[] = [];

    if (isLoading) directMessagesContent.push(<DirectMessagesLoadingState />);

    if (!isLoading && isError) {
        directMessagesContent.push(<DirectMessagesErrorState />);
    }

    if (!isLoading && !isError && directConversations.length === 0) {
        directMessagesContent.push(<DirectMessagesEmptyState />);
    }

    if (!isLoading && !isError && directConversations.length > 0) {
        directConversations.forEach((conversation) => {
            directMessagesContent.push(
                <DirectConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    onSelect={() => onSelectDirectConversation(conversation)}
                />
            );
        });
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            <ConversationItem
                icon={BuildingIcon}
                name={spaceName}
                unreadCount={spaceUnreadCount}
                onSelect={onSelectSpaceConversation}
            />

            <div className="flex flex-col gap-1">
                <span className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Mensagens diretas
                </span>

                {directMessagesContent}
            </div>
        </div>
    );
};
