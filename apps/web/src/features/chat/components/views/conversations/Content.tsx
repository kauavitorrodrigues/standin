import type { UseFormReturn } from "react-hook-form";
import type { ConversationSummary } from "@standin/contracts";
import type { ConversationSearchFormValues } from "@/features/chat/types/searchForm";
import { ConversationItem } from "@/features/chat/components/views/conversations/ConversationItem";
import { Section } from "@/features/chat/components/views/conversations/Section";
import { SearchField } from "@/features/chat/components/views/conversations/SearchField";
import { DirectConversationItem } from "@/features/chat/components/views/conversations/DirectConversationItem";
import {
    DirectMessagesEmptyState,
    DirectMessagesErrorState,
    DirectMessagesLoadingState,
    DirectMessagesNoResultsState,
} from "@/features/chat/components/views/conversations/ContentStates";

type Props = {
    searchForm: UseFormReturn<ConversationSearchFormValues>;
    isSearching: boolean;
    showSpaceConversation: boolean;
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
    isSearching: boolean;
    selectedConversationId: string;
    onSelect: (conversation: ConversationSummary) => void;
};

const DirectMessages = ({
    conversations,
    isLoading,
    isError,
    isSearching,
    selectedConversationId,
    onSelect,
}: DirectMessagesProps) => {
    if (isLoading) return <DirectMessagesLoadingState />;
    if (isError) return <DirectMessagesErrorState />;
    if (conversations.length === 0 && isSearching) {
        return <DirectMessagesNoResultsState />;
    }
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

type SpaceChannelProps = {
    visible: boolean;
    name: string;
    unreadCount: number;
    selected: boolean;
    onSelect: () => void;
};

const SpaceChannel = ({
    visible,
    name,
    unreadCount,
    selected,
    onSelect,
}: SpaceChannelProps) => {
    if (!visible) return null;

    return (
        <Section title="Canais">
            <ConversationItem
                name={name}
                unreadCount={unreadCount}
                selected={selected}
                onSelect={onSelect}
            />
        </Section>
    );
};

export const Content = ({
    searchForm,
    isSearching,
    showSpaceConversation,
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
            <SearchField form={searchForm} />

            <SpaceChannel
                visible={showSpaceConversation}
                name={spaceName}
                unreadCount={spaceUnreadCount}
                selected={selectedConversationId === spaceConversationId}
                onSelect={onSelectSpaceConversation}
            />

            <Section title="Mensagens diretas">
                <DirectMessages
                    conversations={directConversations}
                    isLoading={isLoading}
                    isError={isError}
                    isSearching={isSearching}
                    selectedConversationId={selectedConversationId}
                    onSelect={onSelectDirectConversation}
                />
            </Section>
        </div>
    );
};
