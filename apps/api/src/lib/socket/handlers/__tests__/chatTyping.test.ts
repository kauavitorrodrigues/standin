import { beforeEach, describe, expect, it, vi } from "vitest";

const { recipientsMock, emitToNotifyMock, spaceOrgMock, profileMock } =
    vi.hoisted(() => ({
        recipientsMock: vi.fn(),
        emitToNotifyMock: vi.fn(),
        spaceOrgMock: vi.fn(),
        profileMock: vi.fn(),
    }));

vi.mock("@/features/chat/utils/resolveConversationRecipients", () => ({
    resolveCachedConversationRecipients: recipientsMock,
}));
vi.mock("../../socketManager", () => ({
    SocketManager: { emitToNotify: emitToNotifyMock },
}));
vi.mock("../../services/resolveSpaceOrganizationId", () => ({
    resolveSpaceOrganizationId: spaceOrgMock,
}));
vi.mock("../../services/resolveUserProfile", () => ({
    resolveUserProfile: profileMock,
}));

import { registerChatTyping } from "../chatTyping";

const setup = (spaceId: string | null) => {
    let handler: (payload: unknown) => Promise<void> = async () => undefined;
    const socket = {
        data: { userId: "u1", spaceId },
        on: (_event: string, fn: typeof handler) => {
            handler = fn;
        },
    };
    registerChatTyping(socket as never);
    return (payload: unknown) => handler(payload);
};

describe("registerChatTyping", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        recipientsMock.mockResolvedValue(["u2"]);
        spaceOrgMock.mockResolvedValue("org-of-space");
        profileMock.mockResolvedValue({ name: "Ana" });
    });

    it("uses the organization of the space when inside one", async () => {
        const send = setup("space-1");

        await send({
            conversationId: "c1",
            isTyping: true,
            organizationId: "org-from-client",
        });

        expect(recipientsMock).toHaveBeenCalledWith("c1", "org-of-space", "u1");
        expect(emitToNotifyMock).toHaveBeenCalledWith(
            "u2",
            "chat:typing",
            expect.objectContaining({ userName: "Ana", userId: "u1" })
        );
    });

    it("uses the organization of the payload outside a space", async () => {
        const send = setup(null);

        await send({
            conversationId: "c1",
            isTyping: true,
            organizationId: "org-1",
        });

        expect(recipientsMock).toHaveBeenCalledWith("c1", "org-1", "u1");
        expect(emitToNotifyMock).toHaveBeenCalledTimes(1);
    });

    it("drops it outside a space with no organization", async () => {
        const send = setup(null);

        await send({ conversationId: "c1", isTyping: true });

        expect(emitToNotifyMock).not.toHaveBeenCalled();
    });

    it("tells nobody when the person is not in the conversation", async () => {
        recipientsMock.mockResolvedValue(null);
        const send = setup("space-1");

        await send({ conversationId: "c1", isTyping: true });

        expect(emitToNotifyMock).not.toHaveBeenCalled();
    });
});
