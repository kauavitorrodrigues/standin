import { resolveConversationRecipients } from "./resolveConversationRecipients";

// Runs `emit` for each person who should hear about what the actor did in a
// conversation. Best effort: never awaited by the request, and a failure is
// logged and swallowed. A person who misses it sees the change on the next
// fetch, so this can never be allowed to fail the action itself.
export const notifyConversation = async (
    conversationId: string,
    organizationId: string,
    actorId: string,
    emit: (recipientId: string) => void
): Promise<void> => {
    try {
        const recipients = await resolveConversationRecipients(
            conversationId,
            organizationId,
            actorId
        );
        recipients?.forEach(emit);
    } catch (error) {
        console.error(error);
    }
};
