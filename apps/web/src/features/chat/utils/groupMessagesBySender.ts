import type { MessageWithDetails } from "@standin/contracts";

export type MessageGroup = {
    key: string;
    senderId: string;
    messages: MessageWithDetails[];
};

// Consecutive messages from the same sender are rendered as one visual
// group (single avatar/name, stacked bubbles) instead of repeating the
// header for every message, mirroring how Slack/Discord-style chats read.
export const groupMessagesBySender = (
    messages: MessageWithDetails[]
): MessageGroup[] => {
    const groups: MessageGroup[] = [];

    for (const message of messages) {
        const lastGroup = groups.at(-1);
        if (lastGroup && lastGroup.senderId === message.senderId) {
            lastGroup.messages.push(message);
        } else {
            groups.push({
                key: message.id,
                senderId: message.senderId,
                messages: [message],
            });
        }
    }

    return groups;
};
