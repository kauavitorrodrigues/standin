// Only ever set for a DM thread (the other participant), never for the
// space conversation, so the thread header can decide whether to render an
// avatar next to the title.
export type ThreadParticipant = { id: string; avatarUrl: string | null };

// What the thread header needs to show for the open conversation.
export type SelectedConversation = {
    id: string;
    title: string;
    avatar: ThreadParticipant | null;
};

export type SelectConversation = (conversationId: string) => void;
