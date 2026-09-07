import { describe, expect, it } from "vitest";
import type { MessageWithDetails } from "@standin/contracts";
import { groupMessagesBySender } from "@/features/chat/utils/groupMessagesBySender";

const buildMessage = (
    overrides: Partial<MessageWithDetails> & { id: string; senderId: string }
): MessageWithDetails => ({
    conversationId: "conversation-1",
    content: "hi",
    createdAt: "2026-01-01T00:00:00.000Z",
    editedAt: null,
    attachments: [],
    reactions: [],
    seenBy: [],
    ...overrides,
});

describe("groupMessagesBySender", () => {
    it("groups consecutive messages from the same sender", () => {
        const messages = [
            buildMessage({ id: "a", senderId: "u1" }),
            buildMessage({ id: "b", senderId: "u1" }),
            buildMessage({ id: "c", senderId: "u2" }),
        ];

        const groups = groupMessagesBySender(messages);

        expect(groups).toHaveLength(2);
        expect(groups[0].messages.map((m) => m.id)).toEqual(["a", "b"]);
        expect(groups[1].messages.map((m) => m.id)).toEqual(["c"]);
    });

    it("keeps the group's key stable when its leading message is deleted", () => {
        const messageA = buildMessage({ id: "a", senderId: "u1" });
        const messageB = buildMessage({ id: "b", senderId: "u1" });
        const previousGroups = groupMessagesBySender([messageA, messageB]);
        const originalKey = previousGroups[0].key;

        // "a" was deleted; "b" is now the leading message of the group.
        const groups = groupMessagesBySender([messageB], previousGroups);

        expect(groups).toHaveLength(1);
        expect(groups[0].key).toBe(originalKey);
    });

    it("keeps the group's key stable across a temp-id -> real-id swap", () => {
        const tempMessage = buildMessage({ id: "peer-temp-1", senderId: "u1" });
        const previousGroups = groupMessagesBySender([tempMessage]);
        const originalKey = previousGroups[0].key;

        const confirmedMessage = {
            ...tempMessage,
            id: "real-id-1",
            tempId: "peer-temp-1",
        } as MessageWithDetails;
        const groups = groupMessagesBySender([confirmedMessage], previousGroups);

        expect(groups[0].key).toBe(originalKey);
    });

    it("keeps the group's key stable across a later refetch that drops the tempId", () => {
        const tempMessage = buildMessage({ id: "peer-temp-1", senderId: "u1" });
        const afterConfirm = groupMessagesBySender(
            [
                {
                    ...tempMessage,
                    id: "real-id-1",
                    tempId: "peer-temp-1",
                } as MessageWithDetails,
            ],
            groupMessagesBySender([tempMessage])
        );
        const keyAfterConfirm = afterConfirm[0].key;

        // A plain refetch never carries the client-only tempId field.
        const refetchedMessage = buildMessage({
            id: "real-id-1",
            senderId: "u1",
        });
        const afterRefetch = groupMessagesBySender(
            [refetchedMessage],
            afterConfirm
        );

        expect(afterRefetch[0].key).toBe(keyAfterConfirm);
    });

    it("never assigns the same key to two groups when one splits in two", () => {
        const messageA = buildMessage({ id: "a", senderId: "u1" });
        const messageB = buildMessage({ id: "b", senderId: "u1" });
        const previousGroups = groupMessagesBySender([messageA, messageB]);

        // A peer message now sorts between "a" and "b", reconciled by a
        // later refetch, splitting what used to be one group into two.
        const messageC = buildMessage({ id: "c", senderId: "u2" });
        const groups = groupMessagesBySender(
            [messageA, messageC, messageB],
            previousGroups
        );

        expect(groups).toHaveLength(3);
        const keys = groups.map((group) => group.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("reuses the previous group object when its messages are unchanged", () => {
        const messageA = buildMessage({ id: "a", senderId: "u1" });
        const messageB = buildMessage({ id: "b", senderId: "u2" });
        const previousGroups = groupMessagesBySender([messageA, messageB]);

        // Only messageB's group actually changes.
        const updatedB = { ...messageB, content: "edited" };
        const groups = groupMessagesBySender(
            [messageA, updatedB],
            previousGroups
        );

        expect(groups[0]).toBe(previousGroups[0]);
        expect(groups[1]).not.toBe(previousGroups[1]);
    });
});
