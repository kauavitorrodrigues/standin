import type { SpaceDetails } from "@standin/contracts";
import { CONVERSATION_TYPES } from "@standin/contracts";
import { useConversationSearch } from "@/features/chat/hooks/useConversationSearch";
import { ChatQueries } from "@/features/chat/queries";
import { Content } from "@/features/chat/components/views/conversations/Content";
import type { SelectConversation } from "@/features/chat/types/chatPage";

type Props = {
    space: SpaceDetails;
    selectedConversationId: string;
    onSelect: SelectConversation;
};

export const ConversationList = ({
    space,
    selectedConversationId,
    onSelect,
}: Props) => {
    const { conversations, isLoading, isError } =
        ChatQueries.useConversations();

    const { form, isSearching, results } = useConversationSearch();

    // While searching, the server decides what is listed, including the
    // conversations beyond the default list.
    const listed = isSearching ? results.conversations : conversations;

    const directConversations = listed.filter(
        (c) => c.type === CONVERSATION_TYPES.DIRECT
    );
    const showSpaceConversation =
        !isSearching ||
        listed.some((c) => c.id === space.conversationId);

    const spaceConversation = listed.find(
        (conversation) => conversation.id === space.conversationId
    );

    return (
        <Content
            searchForm={form}
            isSearching={isSearching}
            showSpaceConversation={showSpaceConversation}
            spaceName={space.name}
            selectedConversationId={selectedConversationId}
            spaceConversationId={space.conversationId}
            spaceUnreadCount={spaceConversation?.unreadCount ?? 0}
            directConversations={directConversations}
            isLoading={isSearching ? results.isLoading : isLoading}
            isError={isSearching ? results.isError : isError}
            onSelectSpaceConversation={() => onSelect(space.conversationId)}
            onSelectDirectConversation={(conversation) =>
                onSelect(conversation.id)
            }
        />
    );
};
