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
