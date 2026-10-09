import type { ConversationSummary } from "@standin/contracts";
import { ConversationItem } from "@/features/chat/components/views/conversations/ConversationItem";
import { Section } from "@/features/chat/components/views/conversations/Section";
import { SearchField } from "@/features/chat/components/views/conversations/SearchField";
import { DirectConversationItem } from "@/features/chat/components/views/conversations/DirectConversationItem";
import {
    DirectMessagesEmptyState,
    DirectMessagesErrorState,
    DirectMessagesLoadingState,
} from "@/features/chat/components/views/conversations/ContentStates";

type Props = {
    spaceName: string;
    spaceUnreadCount: number;
    selectedConversationId: string;
    spaceConversationId: string;
    directConversations: ConversationSummary[];
    isLoading: boolean;
    isError: boolean;
    onSelectSpaceConversation: () => void;
    onSelectDirectConversation: (conversation: ConversationSummary) => void;
};

export const Content = ({
    spaceName,
    spaceUnreadCount,
    selectedConversationId,
    spaceConversationId,
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
                    selected={conversation.id === selectedConversationId}
                    onSelect={() => onSelectDirectConversation(conversation)}
                />
            );
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <SearchField />

            <Section title="Canais">
                <ConversationItem
                    name={spaceName}
                    unreadCount={spaceUnreadCount}
                    selected={selectedConversationId === spaceConversationId}
                    onSelect={onSelectSpaceConversation}
                />
            </Section>

            <Section title="Mensagens diretas">{directMessagesContent}</Section>
        </div>
    );
};
