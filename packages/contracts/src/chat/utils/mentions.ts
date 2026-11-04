import type { MentionPart } from "../types/mention-part";

// A mention is stored in the content as a markdown link:
// `[@Name](mention:<userId>)`. The ids are read from the content on the
// server and never taken from the client.
const MENTION_PATTERN = /\[(@[^\]]*)\]\(mention:([^)\s]+)\)/g;

export const parseMentionUserIds = (content: string | null): string[] => {
    if (!content) return [];
    const ids = Array.from(
        content.matchAll(MENTION_PATTERN),
        (match) => match[2]
    );
    return [...new Set(ids)];
};

// For previews: `@Name` instead of the link. A person with no current name
// keeps the label that was typed, so the raw link is never shown.
export const replaceMentionsWithNames = (
    content: string,
    namesByUserId: ReadonlyMap<string, string>
): string =>
    content.replace(MENTION_PATTERN, (_link, label: string, userId: string) => {
        const name = namesByUserId.get(userId);
        if (name === undefined) return label;
        return `@${name}`;
    });

// The label of a mention. Brackets would end it early, so they are dropped
// from the name.
export const buildMentionLabel = (name: string): string =>
    `@${name.replace(/[[\]\r\n]/g, "")}`;

// The link a mention is stored as.
export const formatMentionLink = (label: string, userId: string): string =>
    `[${label}](mention:${userId})`;

export const buildMentionLink = (userId: string, name: string): string =>
    formatMentionLink(buildMentionLabel(name), userId);

// The content as text and mentions in order, for the field and the message.
export const splitContentByMentions = (content: string): MentionPart[] => {
    const parts: MentionPart[] = [];
    let cursor = 0;
    for (const match of content.matchAll(MENTION_PATTERN)) {
        const start = match.index ?? 0;
        if (start > cursor) {
            parts.push({ type: "text", text: content.slice(cursor, start) });
        }
        parts.push({ type: "mention", label: match[1], userId: match[2] });
        cursor = start + match[0].length;
    }
    if (cursor < content.length) {
        parts.push({ type: "text", text: content.slice(cursor) });
    }
    return parts;
};
