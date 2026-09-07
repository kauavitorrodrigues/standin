import type { SpaceDetails } from "@standin/contracts";

// Only ever set for a DM thread (the other participant), never for the
// space conversation, so the thread header can decide whether to render an
// avatar next to the title.
export type ThreadParticipant = { id: string; avatarUrl: string | null };

export type SidebarBodyProps = {
    space: SpaceDetails;
    conversationId: string | null;
    // title/avatar are the thread header's display name and (DM-only)
    // avatar for this conversation, passed by the caller so they're
    // available immediately, without waiting on a conversations-list
    // refetch (e.g. right after creating a new DM).
    onSelectConversation: (
        conversationId: string,
        title: string,
        avatar?: ThreadParticipant | null
    ) => void;
};
