import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    findActive: vi.fn(),
    findActiveAmong: vi.fn(),
    listParticipants: vi.fn(),
}));

vi.mock("../../organizations", () => ({
    OrganizationMemberService: {
        findActive: mocks.findActive,
        findActiveAmong: mocks.findActiveAmong,
    },
}));
vi.mock("../participants/listByConversation", () => ({
    listConversationParticipants: mocks.listParticipants,
}));

import { getConversationRecipientUserIds } from "../getRecipientUserIds";
import type { ConversationRow } from "../utils/assertAccessible";

const conversation = (type: "SPACE" | "DIRECT") =>
    ({ id: "c1", type, organizationId: "org-1" }) as unknown as ConversationRow;

describe("getConversationRecipientUserIds", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.listParticipants.mockResolvedValue([{ id: "a" }, { id: "b" }]);
    });

    it("reaches the other participant of a direct conversation", async () => {
        mocks.findActiveAmong.mockResolvedValue(["a", "b"]);

        expect(
            await getConversationRecipientUserIds(conversation("DIRECT"), "a")
        ).toEqual(["b"]);
        expect(mocks.findActiveAmong).toHaveBeenCalledWith("org-1", ["a", "b"]);
        expect(mocks.findActive).not.toHaveBeenCalled();
    });

    it("skips a participant who is no longer a member of the organization", async () => {
        mocks.findActiveAmong.mockResolvedValue(["a"]);

        expect(
            await getConversationRecipientUserIds(conversation("DIRECT"), "a")
        ).toEqual([]);
    });

    it("reaches every active member of a space conversation", async () => {
        mocks.findActive.mockResolvedValue([{ userId: "a" }, { userId: "c" }]);

        expect(
            await getConversationRecipientUserIds(conversation("SPACE"), "a")
        ).toEqual(["c"]);
    });
});
