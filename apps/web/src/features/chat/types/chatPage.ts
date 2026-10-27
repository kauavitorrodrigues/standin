// The other people in a DM thread. The list is empty for the space
// conversation, so the thread header renders no avatar next to the title.
export type ThreadParticipant = {
    id: string;
    name: string;
    profilePictureUrl: string | null;
};

// What the thread header needs to show for the open conversation.
export type SelectedConversation = {
    id: string;
    title: string;
    avatars: ThreadParticipant[];
    // The conversation with yourself, shown as notes.
    isNotes: boolean;
};

export type SelectConversation = (conversationId: string) => void;
