import { beforeEach, describe, expect, it, vi } from "vitest";

const { findByIdMock, canAccessMock, getRecipientsMock } = vi.hoisted(() => ({
    findByIdMock: vi.fn(),
    canAccessMock: vi.fn(),
    getRecipientsMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    ConversationService: {
        findById: findByIdMock,
        canAccess: canAccessMock,
        getRecipientUserIds: getRecipientsMock,
    },
}));

import { resolveCachedConversationRecipients } from "../resolveConversationRecipients";

describe("resolveCachedConversationRecipients", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findByIdMock.mockResolvedValue({ id: "c1" });
        canAccessMock.mockResolvedValue(true);
        getRecipientsMock.mockReturnValue(["u2", "u3"]);
    });

    it("answers with the others of the conversation and reads once for repeated asks", async () => {
        const first = await resolveCachedConversationRecipients("c-a", "o1", "u1");
        const second = await resolveCachedConversationRecipients("c-a", "o1", "u1");

        expect(first).toEqual(["u2", "u3"]);
        expect(second).toEqual(["u2", "u3"]);
        expect(findByIdMock).toHaveBeenCalledTimes(1);
    });

    it("answers null for someone with no access, and asks again next time", async () => {
        canAccessMock.mockResolvedValue(false);

        const first = await resolveCachedConversationRecipients("c-b", "o1", "u9");
        const second = await resolveCachedConversationRecipients("c-b", "o1", "u9");

        expect(first).toBeNull();
        expect(second).toBeNull();
        expect(findByIdMock).toHaveBeenCalledTimes(2);
    });
});
