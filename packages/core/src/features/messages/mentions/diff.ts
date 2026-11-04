export type MentionDiff = {
    added: string[];
    removed: string[];
};

// What an edit changes: the people it adds get notified, the people it keeps
// stay as they are, and the people it takes out lose the mention.
export const diffMentions = (
    before: string[],
    after: string[]
): MentionDiff => {
    const previous = new Set(before);
    const next = new Set(after);

    return {
        added: after.filter((userId) => !previous.has(userId)),
        removed: before.filter((userId) => !next.has(userId)),
    };
};
