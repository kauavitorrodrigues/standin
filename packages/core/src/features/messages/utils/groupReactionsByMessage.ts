import type { MessageReactionSummary } from "@standin/contracts";
import type { ReactionRow } from "../reactions/types";

export const groupReactionsByMessage = (
    reactions: ReactionRow[],
    currentUserId: string
): Map<string, MessageReactionSummary[]> => {
    const reactionsByMessage = new Map<string, MessageReactionSummary[]>();

    for (const reaction of reactions) {
        const summaries = reactionsByMessage.get(reaction.messageId) ?? [];
        const existing = summaries.find(
            (summary) => summary.emoji === reaction.emoji
        );

        if (existing) {
            existing.count += 1;
            existing.reactedByMe ||= reaction.userId === currentUserId;
        } else {
            summaries.push({
                emoji: reaction.emoji,
                count: 1,
                reactedByMe: reaction.userId === currentUserId,
            });
        }

        reactionsByMessage.set(reaction.messageId, summaries);
    }

    return reactionsByMessage;
};
