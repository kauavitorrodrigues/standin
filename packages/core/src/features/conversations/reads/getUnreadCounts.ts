import { findAccessibleConversations } from "../findAccessible";
import { computeUnreadCounts } from "./computeUnreadCounts";

export type UnreadCounts = {
    counts: Record<string, number>;
    total: number;
};

export const getUnreadCounts = async (
    userId: string,
    organizationId: string
): Promise<UnreadCounts> => {
    const conversations = await findAccessibleConversations(
        userId,
        organizationId
    );
    return computeUnreadCounts(
        userId,
        conversations.map((conversation) => conversation.id)
    );
};
