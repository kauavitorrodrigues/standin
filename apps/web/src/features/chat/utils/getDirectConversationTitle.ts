// A direct conversation is titled by the other people in it. With nobody
// else it is the conversation with yourself, shown as notes.
export const getDirectConversationTitle = (
    participants: { name: string }[]
): string => {
    if (participants.length === 0) return "Anotações";

    return participants.map((participant) => participant.name).join(", ");
};
