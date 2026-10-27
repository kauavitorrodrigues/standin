import {
    db,
    messagesTable,
    conversationParticipantsTable,
    inArray,
    and,
    isNull,
    ne,
    or,
    eq,
    desc,
    spacesTable,
} from "@standin/database";
import { CONVERSATION_TYPES } from "@standin/contracts";
import type {
    ConversationsListQuery,
    ConversationsListResponse,
    ConversationSummary,
} from "@standin/contracts";
import { findAccessibleConversations } from "./findAccessible";
import { computeUnreadCounts } from "./reads/computeUnreadCounts";
import { UserService } from "../users";
import { sortConversationSummaries } from "./utils/sortSummaries";
import { filterSummariesBySearch } from "./utils/filterSummariesBySearch";

export const CONVERSATIONS_LIST_LIMIT = 10;

// A search lists every match, since it is how the conversations beyond the
// default limit are reached. The cap only keeps the response bounded.
export const CONVERSATIONS_SEARCH_LIMIT = 50;

type LastMessageRow = {
    conversationId: string;
    id: string;
    content: string | null;
    senderId: string;
    createdAt: Date;
};

const findLastMessageByConversation = async (
    conversationIds: string[]
): Promise<Map<string, LastMessageRow>> => {
    const rows = await db
        .selectDistinctOn([messagesTable.conversationId], {
            conversationId: messagesTable.conversationId,
            id: messagesTable.id,
            content: messagesTable.content,
            senderId: messagesTable.senderId,
            createdAt: messagesTable.createdAt,
        })
        .from(messagesTable)
        .where(
            and(
                inArray(messagesTable.conversationId, conversationIds),
                isNull(messagesTable.deletedAt),
                // A reply hidden from the channel is not its last message.
                or(
                    isNull(messagesTable.threadParentId),
                    eq(messagesTable.showThreadReplyInChannel, true)
                )
            )
        )
        // ids are uuidv7 (time-ordered), so ordering by id matches ordering
        // by createdAt while staying tie-free.
        .orderBy(messagesTable.conversationId, desc(messagesTable.id));

    return new Map(rows.map((row) => [row.conversationId, row]));
};

// Only DIRECT conversations need this: SPACE conversations resolve their
// display name/avatar from the space itself, and "participant" there is
// implicit org membership, not a meaningful list to show.
const findDirectParticipantsByConversation = async (
    userId: string,
    directConversationIds: string[]
): Promise<Map<string, string[]>> => {
    const byConversation = new Map<string, string[]>();
    if (directConversationIds.length === 0) return byConversation;

    const rows = await db
        .select({
            conversationId: conversationParticipantsTable.conversationId,
            userId: conversationParticipantsTable.userId,
        })
        .from(conversationParticipantsTable)
        .where(
            and(
                inArray(
                    conversationParticipantsTable.conversationId,
                    directConversationIds
                ),
                isNull(conversationParticipantsTable.deletedAt),
                ne(conversationParticipantsTable.userId, userId)
            )
        );

    for (const row of rows) {
        const list = byConversation.get(row.conversationId) ?? [];
        list.push(row.userId);
        byConversation.set(row.conversationId, list);
    }

    return byConversation;
};

const findSpaceNamesById = async (
    spaceIds: string[]
): Promise<Map<string, string>> => {
    if (spaceIds.length === 0) return new Map();

    const rows = await db
        .select({ id: spacesTable.id, name: spacesTable.name })
        .from(spacesTable)
        .where(inArray(spacesTable.id, spaceIds));

    return new Map(rows.map((row) => [row.id, row.name]));
};

export const listConversationsForUser = async (
    userId: string,
    organizationId: string,
    { search }: Partial<ConversationsListQuery> = {}
): Promise<ConversationsListResponse> => {
    const conversations = await findAccessibleConversations(
        userId,
        organizationId
    );
    if (conversations.length === 0) return { conversations: [], hasMore: false };

    const conversationIds = conversations.map((conversation) => conversation.id);
    const directConversationIds = conversations
        .filter((conversation) => conversation.type === CONVERSATION_TYPES.DIRECT)
        .map((conversation) => conversation.id);

    const [unreadCounts, lastMessageByConversation, participantIdsByConversation] =
        await Promise.all([
            computeUnreadCounts(userId, conversationIds),
            findLastMessageByConversation(conversationIds),
            findDirectParticipantsByConversation(userId, directConversationIds),
        ]);

    const participantUsers = await UserService.findManyByIds([
        ...new Set(
            Array.from(participantIdsByConversation.values()).flat()
        ),
    ]);
    const participantUsersById = new Map(
        participantUsers.map((user) => [user.id, user])
    );

    const summaries: ConversationSummary[] = conversations.map((conversation) => {
        const lastMessage = lastMessageByConversation.get(conversation.id);
        const participantIds = participantIdsByConversation.get(conversation.id) ?? [];

        return {
            id: conversation.id,
            type: conversation.type,
            spaceId: conversation.spaceId,
            participants: participantIds
                .map((id) => participantUsersById.get(id))
                .filter((user) => user !== undefined),
            lastMessage: lastMessage
                ? {
                      id: lastMessage.id,
                      content: lastMessage.content,
                      senderId: lastMessage.senderId,
                      createdAt: lastMessage.createdAt.toISOString(),
                  }
                : null,
            unreadCount: unreadCounts.counts[conversation.id] ?? 0,
        };
    });

    // Unread first, then most recent activity, so the sidebar surfaces
    // what needs attention without the client sorting. The rest of the
    // conversations is reachable by search.
    const sorted = sortConversationSummaries(summaries);

    const term = search?.trim() ?? "";
    if (term !== "") {
        const spaceIds = conversations.flatMap((conversation) =>
            conversation.spaceId ? [conversation.spaceId] : []
        );
        const matches = filterSummariesBySearch(
            sorted,
            await findSpaceNamesById(spaceIds),
            term
        );

        return {
            conversations: matches.slice(0, CONVERSATIONS_SEARCH_LIMIT),
            hasMore: matches.length > CONVERSATIONS_SEARCH_LIMIT,
        };
    }

    return {
        conversations: sorted.slice(0, CONVERSATIONS_LIST_LIMIT),
        hasMore: sorted.length > CONVERSATIONS_LIST_LIMIT,
    };
};
