import {
    db,
    conversationParticipantsTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import type { UserSummary } from "@standin/contracts";
import { UserService } from "../../users";

export const listConversationParticipants = async (
    conversationId: string
): Promise<UserSummary[]> => {
    const rows = await db
        .select({ userId: conversationParticipantsTable.userId })
        .from(conversationParticipantsTable)
        .where(
            and(
                eq(
                    conversationParticipantsTable.conversationId,
                    conversationId
                ),
                isNull(conversationParticipantsTable.deletedAt)
            )
        );

    return UserService.findManyByIds(rows.map((row) => row.userId));
};
