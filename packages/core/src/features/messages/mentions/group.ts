import type { MessageMention } from "@standin/contracts";
import type { MentionRow } from "./types";

export const groupMentionsByMessage = (
    rows: MentionRow[]
): Map<string, MessageMention[]> => {
    const byMessage = new Map<string, MessageMention[]>();

    for (const row of rows) {
        const list = byMessage.get(row.messageId) ?? [];
        list.push({ userId: row.userId, name: row.name });
        byMessage.set(row.messageId, list);
    }

    return byMessage;
};

// For previews: the current name of each mentioned person, by id.
export const namesByUserId = (
    mentions: MessageMention[]
): Map<string, string> =>
    new Map(mentions.map((mention) => [mention.userId, mention.name]));
