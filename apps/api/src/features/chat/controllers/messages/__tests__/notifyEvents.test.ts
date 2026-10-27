import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitToNotifyMock, notifyConversationMock } = vi.hoisted(() => ({
    emitToNotifyMock: vi.fn(),
    notifyConversationMock: vi.fn(),
}));

vi.mock("@/lib/socket/socketManager", () => ({
    SocketManager: { emitToNotify: emitToNotifyMock },
}));

vi.mock("../../../utils/notifyConversation", () => ({
    notifyConversation: notifyConversationMock,
}));

import { notifyMessageDeleted } from "../notifyMessageDeleted";
import { notifyMessageUpdated } from "../notifyMessageUpdated";
import { notifyReactionToggled } from "../reactions/notifyReactionToggled";

// notifyConversation decides who hears, here it hears one person.
const hearOnePerson = () =>
    notifyConversationMock.mockImplementation(
        async (_c: string, _o: string, _a: string, send: (id: string) => void) =>
            send("u2")
    );

describe("chat notifications", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hearOnePerson();
    });

    it("tells a deletion through the notify room", async () => {
        await notifyMessageDeleted("c1", "o1", "m1", "u1");

        expect(emitToNotifyMock).toHaveBeenCalledWith("u2", "chat:message-deleted", {
            conversationId: "c1",
            messageId: "m1",
            userId: "u1",
        });
    });

    it("tells an edit through the notify room", async () => {
        await notifyMessageUpdated(
            "o1",
            {
                id: "m1",
                conversationId: "c1",
                content: "oi",
                editedAt: "2026-01-01T00:00:00.000Z",
                createdAt: "2025-01-01T00:00:00.000Z",
            } as never,
            "u1"
        );

        expect(emitToNotifyMock).toHaveBeenCalledWith(
            "u2",
            "chat:message-updated",
            expect.objectContaining({ messageId: "m1", content: "oi" })
        );
    });

    it("tells a reaction through the notify room", async () => {
        await notifyReactionToggled({
            conversationId: "c1",
            organizationId: "o1",
            messageId: "m1",
            emoji: "👍",
            actorId: "u1",
            added: true,
        });

        expect(emitToNotifyMock).toHaveBeenCalledWith(
            "u2",
            "chat:reaction-toggled",
            expect.objectContaining({ emoji: "👍", added: true })
        );
    });
});
