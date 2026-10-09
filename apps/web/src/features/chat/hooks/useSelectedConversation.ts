import type { SpaceDetails } from "@standin/contracts";
import { ChatQueries } from "@/features/chat/queries";
import type { SelectedConversation } from "@/features/chat/types/chatPage";

const FALLBACK_TITLE = "Conversa";

// The URL only carries the conversation id, so the header's title and
// (DM-only) avatar are resolved from the space or the conversations list.
// For a DM that was just created the list may not have it yet, so the title
// falls back until the refetch lands.
export const useSelectedConversation = (
    space: SpaceDetails,
    conversationId: string | undefined
): SelectedConversation => {
    const { conversations } = ChatQueries.useConversations();
    const id = conversationId ?? space.conversationId;

    if (id === space.conversationId) {
        return { id, title: space.name, avatar: null };
    }

    // DIRECT conversations are 1:1 only for now, so there is always exactly
    // one other participant.
    const other = conversations.find((c) => c.id === id)?.participants[0];

    return {
        id,
        title: other?.name ?? FALLBACK_TITLE,
        avatar: other ? { id: other.id, avatarUrl: other.avatarUrl } : null,
    };
};
