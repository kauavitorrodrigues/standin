import {
    db,
    messagesTable,
    and,
    eq,
    inArray,
    isNull,
    sql,
} from "@standin/database";
import { MessageNotFoundError, NestedThreadError } from "@standin/contracts";
import { THREAD_REPLY_PREVIEW_LENGTH } from "../consts/thread";

export type ThreadSummary = {
    replyCount: number;
    lastReplyAt: string | null;
    lastReplyPreview: string | null;
};

export const EMPTY_THREAD_SUMMARY: ThreadSummary = {
    replyCount: 0,
    lastReplyAt: null,
    lastReplyPreview: null,
};

export const buildReplyPreview = (content: string | null): string | null => {
    const text = content?.trim();
    if (!text) return null;
    if (text.length <= THREAD_REPLY_PREVIEW_LENGTH) return text;
    return `${text.slice(0, THREAD_REPLY_PREVIEW_LENGTH)}...`;
};

// Reply count and last reply preview of each parent, in two queries however
// many parents there are. Deleted replies do not count. ids are uuidv7, so the
// greatest id is the latest reply.
export const listThreadSummaries = async (
    parentIds: string[]
): Promise<Map<string, ThreadSummary>> => {
    const summaries = new Map<string, ThreadSummary>();
    if (parentIds.length === 0) return summaries;

    const grouped = await db
        .select({
            parentId: messagesTable.threadParentId,
            replyCount: sql<number>`count(*)::int`,
            lastReplyId: sql<string>`max(${messagesTable.id})`,
        })
        .from(messagesTable)
        .where(
            and(
                inArray(messagesTable.threadParentId, parentIds),
                isNull(messagesTable.deletedAt)
            )
        )
        .groupBy(messagesTable.threadParentId);

    if (grouped.length === 0) return summaries;

    const lastReplies = await db
        .select({
            id: messagesTable.id,
            content: messagesTable.content,
            createdAt: messagesTable.createdAt,
        })
        .from(messagesTable)
        .where(
            inArray(
                messagesTable.id,
                grouped.map((row) => row.lastReplyId)
            )
        );
    const lastReplyById = new Map(lastReplies.map((row) => [row.id, row]));

    for (const row of grouped) {
        if (!row.parentId) continue;
        const last = lastReplyById.get(row.lastReplyId);
        summaries.set(row.parentId, {
            replyCount: row.replyCount,
            lastReplyAt: last ? last.createdAt.toISOString() : null,
            lastReplyPreview: last ? buildReplyPreview(last.content) : null,
        });
    }

    return summaries;
};

export const getThreadSummary = async (parentId: string) => {
    const summary =
        (await listThreadSummaries([parentId])).get(parentId) ??
        EMPTY_THREAD_SUMMARY;
    return { parentId, ...summary };
};

export const assertThreadParent = async (
    parentId: string,
    conversationId: string
): Promise<void> => {
    const [parent] = await db
        .select({ threadParentId: messagesTable.threadParentId })
        .from(messagesTable)
        .where(
            and(
                eq(messagesTable.id, parentId),
                eq(messagesTable.conversationId, conversationId),
                isNull(messagesTable.deletedAt)
            )
        );

    if (!parent) throw new MessageNotFoundError();
    if (parent.threadParentId) throw new NestedThreadError();
};
