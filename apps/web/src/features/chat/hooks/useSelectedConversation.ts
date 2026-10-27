import type { SpaceDetails } from "@standin/contracts";
import { getDirectConversationTitle } from "@/features/chat/utils/getDirectConversationTitle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChatQueries } from "@/features/chat/queries";
import type { SelectedConversation } from "@/features/chat/types/chatPage";

const FALLBACK_TITLE = "Conversa";

// The URL only carries the conversation id, so the header's title and
// (DM-only) avatars are resolved from the space or the conversation participants.
export const useSelectedConversation = (
    space: SpaceDetails,
    conversationId: string | undefined
): SelectedConversation => {
    const { user } = useAuth();
    const id = conversationId ?? space.conversationId;
    const isSpaceConversation = id === space.conversationId;

    // The conversations list is capped, so an older or empty conversation can
    // be missing from it. The participants of the conversation itself are
    // always reachable, so the header reads them instead.
    const { participants: members, isSuccess } = ChatQueries.useParticipants(
        isSpaceConversation ? "" : id
    );

    if (isSpaceConversation) {
        return { id, title: space.name, avatars: [], isNotes: false };
    }

    // Until the participants land the title falls back.
    if (!isSuccess) {
        return { id, title: FALLBACK_TITLE, avatars: [], isNotes: false };
    }

    const participants = members.filter((member) => member.id !== user?.id);

    return {
        id,
        title: getDirectConversationTitle(participants),
        avatars: participants.map(({ id, name, profilePictureUrl }) => ({
            id,
            name,
            profilePictureUrl,
        })),
        isNotes: participants.length === 0,
    };
};
