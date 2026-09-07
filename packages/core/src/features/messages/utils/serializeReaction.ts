type ReactionRow = {
    emoji: string;
    userId: string;
    createdAt: Date;
};

export const serializeReaction = (reaction: ReactionRow) => ({
    emoji: reaction.emoji,
    userId: reaction.userId,
    createdAt: reaction.createdAt.toISOString(),
});
