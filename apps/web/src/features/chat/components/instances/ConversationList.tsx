import type { SpaceDetails } from "@standin/contracts";
import { CONVERSATION_TYPES } from "@standin/contracts";
import { ChatQueries } from "@/features/chat/queries";
import { Content } from "@/features/chat/components/views/conversations/Content";
import type { ThreadParticipant } from "@/features/chat/components/layout/SidebarBodyProps";

type Props = {
    space: SpaceDetails;
    onSelect: (
        conversationId: string,
        title: string,
        avatar?: ThreadParticipant | null
    ) => void;
};

export const ConversationList = ({ space, onSelect }: Props) => {
    
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
            spaceUnreadCount={spaceConversation?.unreadCount ?? 0}
            directConversations={directConversations}
            isLoading={isLoading}
            isError={isError}
            onSelectSpaceConversation={() =>
                onSelect(space.conversationId, space.name)
            }
            onSelectDirectConversation={(conversation) => {
                // DIRECT conversations are 1:1 only for now, so there's
                // always exactly one other participant.
                const other = conversation.participants[0];
                onSelect(
                    conversation.id,
                    other?.name ?? "Conversa",
                    other && { id: other.id, avatarUrl: other.avatarUrl }
                );
            }}
        />
    );
};
