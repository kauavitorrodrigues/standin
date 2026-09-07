import type { MessageReactionSummary } from "@standin/contracts";

const decrement = (reaction: MessageReactionSummary) => ({
    ...reaction,
    count: reaction.count - 1,
    reactedByMe: false,
});

const increment = (reaction: MessageReactionSummary) => ({
    ...reaction,
    count: reaction.count + 1,
    reactedByMe: true,
});

// Mirrors what the API would return after an add/remove reaction call, so
// the optimistic update and the eventual server state agree on shape.
export const toggleReactionSummary = (
    reactions: MessageReactionSummary[],
    emoji: string,
    reactedByMe: boolean
): MessageReactionSummary[] => {
    const matches = (reaction: MessageReactionSummary) =>
        reaction.emoji === emoji;

    if (reactedByMe) {
        return reactions
            .map((reaction) =>
                matches(reaction) ? decrement(reaction) : reaction
            )
            .filter((reaction) => reaction.count > 0);
    }

    if (reactions.some(matches)) {
        return reactions.map((reaction) =>
            matches(reaction) ? increment(reaction) : reaction
        );
    }

    return [...reactions, { emoji, count: 1, reactedByMe: true }];
};

// Applies a reaction toggle broadcast by another peer. Unlike
// toggleReactionSummary, `reactedByMe` here always refers to the local
// viewer, not the peer who reacted, so it's never touched by this merge.
export const applyRemoteReactionToggle = (
    reactions: MessageReactionSummary[],
    emoji: string,
    added: boolean
): MessageReactionSummary[] => {
    const matches = (reaction: MessageReactionSummary) =>
        reaction.emoji === emoji;

    if (added) {
        if (reactions.some(matches)) {
            return reactions.map((reaction) =>
                matches(reaction)
                    ? { ...reaction, count: reaction.count + 1 }
                    : reaction
            );
        }
        return [...reactions, { emoji, count: 1, reactedByMe: false }];
    }

    return reactions
        .map((reaction) =>
            matches(reaction)
                ? { ...reaction, count: reaction.count - 1 }
                : reaction
        )
        .filter((reaction) => reaction.count > 0);
};
