import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MessageSender, MessageWithDetails } from "@standin/contracts";

const { emitToNotifyMock, countMock, findByIdMock, recipientsMock } = vi.hoisted(
    () => ({
        emitToNotifyMock: vi.fn(),
        countMock: vi.fn(),
        findByIdMock: vi.fn(),
        recipientsMock: vi.fn(),
    })
);

vi.mock("@/lib/socket/socketManager", () => ({
    SocketManager: { emitToNotify: emitToNotifyMock },
}));
vi.mock("@standin/core", () => ({
    ConversationReadService: { countUnreadForUsers: countMock },
    ConversationService: {
        findById: findByIdMock,
        getRecipientUserIds: recipientsMock,
    },
}));

import { notifyNewMessage } from "../notifyNewMessage";

const sender = { id: "ana", name: "Ana", profilePictureUrl: null } as MessageSender;
const message = { id: "m1", senderId: "ana", seenBy: [] } as unknown as MessageWithDetails;

describe("notifyNewMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findByIdMock.mockResolvedValue({ id: "c1" });
    });

    it("sends each recipient their own unread count with one count query for the batch", async () => {
        recipientsMock.mockResolvedValue(["bia", "caio", "dani"]);
        countMock.mockResolvedValue({ bia: 3, caio: 1 });

        await notifyNewMessage("c1", "org", sender, message);

        expect(countMock).toHaveBeenCalledTimes(1);
        expect(countMock).toHaveBeenCalledWith("c1", ["bia", "caio", "dani"]);
        expect(emitToNotifyMock).toHaveBeenCalledTimes(3);
        expect(emitToNotifyMock).toHaveBeenCalledWith(
            "bia",
            "chat:message-created",
            expect.objectContaining({ conversationId: "c1", unreadCount: 3 })
        );
        expect(emitToNotifyMock).toHaveBeenCalledWith(
            "dani",
            "chat:message-created",
            expect.objectContaining({ unreadCount: 0 })
        );
    });

    it("leaves seenBy out of what recipients receive", async () => {
        recipientsMock.mockResolvedValueOnce(["bia"]);
        countMock.mockResolvedValueOnce({ bia: 1 });
        await notifyNewMessage("c1", "org", sender, message);
        expect(emitToNotifyMock.mock.calls[0][2].message).not.toHaveProperty("seenBy");
    });

    it("sends the thread summary of a reply with the event", async () => {
        const threadSummary = {
            parentId: "p1",
            replyCount: 2,
            lastReplyAt: null,
            lastReplyPreview: "oi",
        };
        recipientsMock.mockResolvedValueOnce(["bia"]);
        countMock.mockResolvedValueOnce({ bia: 1 });
        await notifyNewMessage("c1", "org", sender, message, threadSummary);
        expect(emitToNotifyMock.mock.calls[0][2].threadSummary).toEqual(
            threadSummary
        );
    });

    it("swallows a failure instead of rejecting", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        findByIdMock.mockRejectedValue(new Error("db"));
        await expect(
            notifyNewMessage("c1", "org", sender, message)
        ).resolves.toBeUndefined();
    });
});
