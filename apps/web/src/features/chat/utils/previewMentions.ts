import {
    replaceMentionsWithNames,
    type MessageMention,
} from "@standin/contracts";

// The content with `@Name` in place of each mention link, for a preview or
// a notification. The names are the current ones sent with the message.
export const previewMentions = (
    content: string | null,
    mentions: readonly MessageMention[]
): string | null => {
    if (content === null) return null;
    return replaceMentionsWithNames(
        content,
        new Map(mentions.map(({ userId, name }) => [userId, name]))
    );
};
