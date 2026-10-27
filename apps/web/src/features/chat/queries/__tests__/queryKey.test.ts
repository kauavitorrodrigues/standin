import { describe, expect, it } from "vitest";
import {
    conversationsQueryKey,
    conversationsSearchQueryKey,
    messagesListQueryKey,
    messagesQueryKey,
    threadMessagesQueryKey,
} from "../queryKey";

describe("conversationsSearchQueryKey", () => {
    it("sits under the list key so invalidating the list reaches searches", () => {
        const key = conversationsSearchQueryKey("org", "ana");

        expect(key.slice(0, 2)).toEqual(conversationsQueryKey("org"));
    });

    it("differs per search text and per organization", () => {
        expect(conversationsSearchQueryKey("org", "ana")).not.toEqual(
            conversationsSearchQueryKey("org", "bia")
        );
        expect(conversationsSearchQueryKey("org", "ana")).not.toEqual(
            conversationsSearchQueryKey("other", "ana")
        );
    });
});

describe("messagesListQueryKey", () => {
    it("is the conversation key without a thread parent", () => {
        expect(messagesListQueryKey("c1")).toEqual(messagesQueryKey("c1"));
    });

    it("keys a thread under its conversation, apart from other threads", () => {
        const key = messagesListQueryKey("c1", "p1");

        expect(key).toEqual(threadMessagesQueryKey("c1", "p1"));
        expect(key.slice(0, 2)).toEqual(messagesQueryKey("c1"));
        expect(key).not.toEqual(threadMessagesQueryKey("c1", "p2"));
    });
});
