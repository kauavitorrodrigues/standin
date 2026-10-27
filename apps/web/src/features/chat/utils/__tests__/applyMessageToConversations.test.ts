import { describe, expect, it } from "vitest";
import type {
    ChatMessageCreatedPayload,
    ConversationsListResponse,
} from "@standin/contracts";
import { applyMessageToConversations } from "../applyMessageToConversations";

const payload = {
    conversationId: "a",
    message: {
        id: "m2",
        content: "oi",
        senderId: "other",
        createdAt: "2026-01-01T00:00:00.000Z",
    },
    sender: { id: "other" },
    unreadCount: 3,
} as unknown as ChatMessageCreatedPayload;

const data = {
    hasMore: false,
    conversations: [
        { id: "a", lastMessage: null, unreadCount: 2 },
        { id: "b", lastMessage: null, unreadCount: 1 },
    ],
} as unknown as ConversationsListResponse;

describe("applyMessageToConversations", () => {
    it("sets the last message and the unread count of that conversation only", () => {
        const [a, b] = applyMessageToConversations(data, payload)!.conversations;
        expect(a.unreadCount).toBe(3);
        expect(a.lastMessage).toEqual({
            id: "m2",
            content: "oi",
            senderId: "other",
            createdAt: "2026-01-01T00:00:00.000Z",
        });
        expect(b).toEqual(data.conversations[1]);
    });

    it("leaves an empty cache alone", () => {
        expect(applyMessageToConversations(undefined, payload)).toBeUndefined();
    });

    it("keeps the last message for a reply that stays in its thread", () => {
        const reply = {
            ...payload,
            message: {
                ...payload.message,
                threadParentId: "p1",
                showThreadReplyInChannel: false,
            },
        } as unknown as ChatMessageCreatedPayload;

        const [a] = applyMessageToConversations(data, reply)!.conversations;

        expect(a.lastMessage).toBeNull();
        expect(a.unreadCount).toBe(3);
    });
});
