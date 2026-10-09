import type { SpaceDetails } from "@standin/contracts";
import { CONVERSATION_TYPES } from "@standin/contracts";
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

    const directConversations = conversations.filter(
        (c) => c.type === CONVERSATION_TYPES.DIRECT
    );

    const spaceConversation = conversations.find(
        (conversation) => conversation.id === space.conversationId
    );

    return (
        <Content
            spaceName={space.name}
            selectedConversationId={selectedConversationId}
            spaceConversationId={space.conversationId}
            spaceUnreadCount={spaceConversation?.unreadCount ?? 0}
            directConversations={directConversations}
            isLoading={isLoading}
            isError={isError}
            onSelectSpaceConversation={() => onSelect(space.conversationId)}
            onSelectDirectConversation={(conversation) =>
                onSelect(conversation.id)
            }
        />
    );
};
