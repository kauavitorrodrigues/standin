import {
    buildMentionLink,
    formatMentionLink,
    splitContentByMentions,
    type MessageMention,
} from "@standin/contracts";

// The links of a stored message hold the name from when it was written.
// Editing starts from the name each person has now.
export const refreshMentionLabels = (
    content: string,
    mentions: readonly MessageMention[]
): string => {
    const namesByUserId = new Map(
        mentions.map(({ userId, name }) => [userId, name])
    );
    return splitContentByMentions(content)
        .map((part) => {
            if (part.type === "text") return part.text;
            const name = namesByUserId.get(part.userId);
            if (name === undefined)
                return formatMentionLink(part.label, part.userId);
            return buildMentionLink(part.userId, name);
        })
        .join("");
};
