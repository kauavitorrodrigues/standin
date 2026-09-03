import type { MessageSender } from "@standin/contracts";

// The list endpoint only ships sender details for the *other* participants
// (`users`, deduped by page). The current user already knows their own
// name, so we resolve that side locally instead of round-tripping it.
export const resolveSender = (
    senderId: string,
    users: Record<string, MessageSender>,
    currentUser: { id: string; name: string }
): MessageSender => {
    if (senderId === currentUser.id) {
        return { id: currentUser.id, name: currentUser.name, avatarUrl: null };
    }

    return (
        users[senderId] ?? {
            id: senderId,
            name: "Usuário removido",
            avatarUrl: null,
        }
    );
};
