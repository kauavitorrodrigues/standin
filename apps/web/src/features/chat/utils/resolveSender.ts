import type { MessageSender } from "@standin/contracts";

// The list endpoint only ships sender details for the *other* participants
// (`users`, deduped by page); the current user already knows their own
// name, so that side is resolved locally.
//
// Takes the already-built `MessageSender` for the current user rather than
// building one here, so the caller can memoize it: a fresh object every
// call would break React.memo(MessageGroup) for every group the current
// user sent.
export const resolveSender = (
    senderId: string,
    users: Record<string, MessageSender>,
    currentUserSender: MessageSender
): MessageSender => {
    if (senderId === currentUserSender.id)  return currentUserSender;
    return (
        users[senderId] ?? {
            id: senderId,
            name: "Usuário removido",
            avatarUrl: null,
        }
    );
};
