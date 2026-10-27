import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type {
    ChatMessageCreatedPayload,
    MessageWithDetails,
} from "@standin/contracts";
import {
    messagesQueryKey,
    threadMessagesQueryKey,
} from "@/features/chat/queries/queryKey";
import { applyCreatedMessageToMessages } from "../applyCreatedMessageToMessages";
import type { MessagesData } from "../messagesCache";

const build = (overrides: Partial<MessageWithDetails>): MessageWithDetails => ({
    id: "m",
    conversationId: "c1",
    senderId: "ana",
    content: "oi",
    threadParentId: null,
    showThreadReplyInChannel: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    editedAt: null,
    attachments: [],
    reactions: [],
    seenBy: [],
    replyCount: 0,
    lastReplyAt: null,
    lastReplyPreview: null,
    ...overrides,
});

const pageOf = (messages: MessageWithDetails[]): MessagesData => ({
    pageParams: [undefined],
    pages: [{ messages, users: {}, nextCursor: null }],
});

const payload = (
    message: Partial<MessageWithDetails>,
    withSummary: boolean
): ChatMessageCreatedPayload => {
    const { seenBy: _seenBy, ...created } = build(message);
    return {
        conversationId: "c1",
        message: created,
        sender: { id: "ana", name: "Ana", profilePictureUrl: null },
        unreadCount: 1,
        threadSummary: withSummary
            ? {
                parentId: "p1",
                replyCount: 3,
                lastReplyAt: "2026-01-01T00:00:00.000Z",
                lastReplyPreview: "oi",
            }
            : null,
    };
};

const setup = () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
        messagesQueryKey("c1"),
        pageOf([build({ id: "p1", replyCount: 2 })])
    );
    queryClient.setQueryData(
        threadMessagesQueryKey("c1", "p1"),
        pageOf([build({ id: "r0", threadParentId: "p1" })])
    );
    return queryClient;
};

const idsOf = (queryClient: QueryClient, key: readonly unknown[]) =>
    queryClient
        .getQueryData<MessagesData>(key)
        ?.pages.flatMap((page) => page.messages.map(({ id }) => id));

describe("applyCreatedMessageToMessages", () => {
    it("puts a top-level message in the main list only", () => {
        const queryClient = setup();

        applyCreatedMessageToMessages(queryClient, payload({ id: "m2" }, false));

        expect(idsOf(queryClient, messagesQueryKey("c1"))).toEqual(["m2", "p1"]);
        expect(idsOf(queryClient, threadMessagesQueryKey("c1", "p1"))).toEqual([
            "r0",
        ]);
    });

    it("puts a reply in its thread and moves the parent count, not the main list", () => {
        const queryClient = setup();

        applyCreatedMessageToMessages(
            queryClient,
            payload({ id: "r1", threadParentId: "p1" }, true)
        );

        expect(idsOf(queryClient, threadMessagesQueryKey("c1", "p1"))).toEqual([
            "r1",
            "r0",
        ]);
        const main = queryClient.getQueryData<MessagesData>(
            messagesQueryKey("c1")
        );
        expect(main?.pages[0].messages).toHaveLength(1);
        expect(main?.pages[0].messages[0]).toMatchObject({
            replyCount: 3,
            lastReplyPreview: "oi",
        });
    });

    it("also puts a reply in the main list when it asked to show in the channel", () => {
        const queryClient = setup();

        applyCreatedMessageToMessages(
            queryClient,
            payload(
                { id: "r1", threadParentId: "p1", showThreadReplyInChannel: true },
                true
            )
        );

        expect(idsOf(queryClient, messagesQueryKey("c1"))).toEqual(["r1", "p1"]);
    });

    it("leaves a thread that was never opened without a cache", () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(
            messagesQueryKey("c1"),
            pageOf([build({ id: "p1" })])
        );

        applyCreatedMessageToMessages(
            queryClient,
            payload({ id: "r1", threadParentId: "p1" }, true)
        );

        expect(
            queryClient.getQueryData(threadMessagesQueryKey("c1", "p1"))
        ).toBeUndefined();
    });
});
