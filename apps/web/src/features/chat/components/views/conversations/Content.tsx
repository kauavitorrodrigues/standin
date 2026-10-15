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

type DirectMessagesProps = {
    conversations: ConversationSummary[];
    isLoading: boolean;
    isError: boolean;
    selectedConversationId: string;
    onSelect: (conversation: ConversationSummary) => void;
};

const DirectMessages = ({
    conversations,
    isLoading,
    isError,
    selectedConversationId,
    onSelect,
}: DirectMessagesProps) => {
    if (isLoading) return <DirectMessagesLoadingState />;
    if (isError) return <DirectMessagesErrorState />;
    if (conversations.length === 0) return <DirectMessagesEmptyState />;

    return conversations.map((conversation) => (
        <DirectConversationItem
            key={conversation.id}
            conversation={conversation}
            selected={conversation.id === selectedConversationId}
            onSelect={() => onSelect(conversation)}
        />
    ));
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

            <Section title="Mensagens diretas">
                <DirectMessages
                    conversations={directConversations}
                    isLoading={isLoading}
                    isError={isError}
                    selectedConversationId={selectedConversationId}
                    onSelect={onSelectDirectConversation}
                />
            </Section>
        </div>
    );
};
