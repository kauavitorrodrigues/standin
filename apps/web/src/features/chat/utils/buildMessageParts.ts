import {
    splitContentByMentions,
    type MentionPart,
    type MessageMention,
} from "@standin/contracts";

// The content as pieces to draw. A mention shows the name the person has
// now; one with no current name keeps the label that was typed.
export const buildMessageParts = (
    content: string,
    mentions: readonly MessageMention[]
): MentionPart[] => {
    const namesByUserId = new Map(
        mentions.map(({ userId, name }) => [userId, name])
    );
    return splitContentByMentions(content).map((part): MentionPart => {
        if (part.type === "text") return part;
        const name = namesByUserId.get(part.userId);
        if (name === undefined) return part;
        return { ...part, label: `@${name}` };
    });
};
