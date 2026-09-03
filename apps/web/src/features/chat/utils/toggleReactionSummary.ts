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
