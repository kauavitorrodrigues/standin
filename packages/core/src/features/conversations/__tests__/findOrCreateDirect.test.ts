import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, membershipMock } = vi.hoisted(() => ({
    state: {
        existing: [] as { conversationId: string }[],
        participantInserts: [] as { conversationId: string; userId: string }[][],
        conversationInserts: 0,
    },
    membershipMock: vi.fn(),
}));

const selectChain = () => {
    const builder: any = {};
    for (const step of ["from", "innerJoin", "where", "groupBy"]) {
        builder[step] = () => builder;
    }
    builder.having = () => Promise.resolve(state.existing);
    return builder;
};

const tx = {
    execute: vi.fn(),
    select: selectChain,
    insert: (table: { name: string }) => ({
        values: (values: any) => {
            if (table.name === "participants") {
                state.participantInserts.push(values);
                return Promise.resolve();
            }
            state.conversationInserts += 1;
            return { returning: () => Promise.resolve([{ id: "new-c" }]) };
        },
    }),
};

vi.mock("@standin/database", () => ({
    db: { transaction: (fn: (t: typeof tx) => unknown) => fn(tx) },
    conversationsTable: { name: "conversations" },
    conversationParticipantsTable: { name: "participants" },
    eq: vi.fn(),
    and: vi.fn(),
    isNull: vi.fn(),
    inArray: vi.fn(),
    sql: Object.assign(vi.fn(), {}),
}));
vi.mock("../../organizations", () => ({
    OrganizationService: { hasActiveMembership: membershipMock },
}));

import { findOrCreateDirectConversation } from "../findOrCreateDirect";

describe("findOrCreateDirectConversation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        state.existing = [];
        state.participantInserts = [];
        state.conversationInserts = 0;
        membershipMock.mockResolvedValue(true);
    });

    it("returns the existing conversation for the same member set", async () => {
        state.existing = [{ conversationId: "c1" }];

        const result = await findOrCreateDirectConversation("org", "me", [
            "a",
            "b",
        ]);

        expect(result.id).toBe("c1");
        expect(state.conversationInserts).toBe(0);
    });

    it("creates a conversation with the creator and every recipient", async () => {
        await findOrCreateDirectConversation("org", "me", ["a", "b"]);

        expect(state.participantInserts[0].map((p) => p.userId).sort()).toEqual([
            "a",
            "b",
            "me",
        ]);
    });

    it("creates a single participant conversation for an empty list", async () => {
        const result = await findOrCreateDirectConversation("org", "me", []);

        expect(result.id).toBe("new-c");
        expect(state.participantInserts[0].map((p) => p.userId)).toEqual(["me"]);
    });

    it("treats the creator and repeated ids as the same person", async () => {
        await findOrCreateDirectConversation("org", "me", ["me", "a", "a"]);

        expect(state.participantInserts[0]).toHaveLength(2);
    });

    it("rejects more members than the cap", async () => {
        const recipients = Array.from({ length: 20 }, (_, i) => `u${i}`);

        await expect(
            findOrCreateDirectConversation("org", "me", recipients)
        ).rejects.toThrow("limit");
    });

    it("rejects a recipient who is not an active member", async () => {
        membershipMock.mockResolvedValue(false);

        await expect(
            findOrCreateDirectConversation("org", "me", ["a"])
        ).rejects.toThrow("not an active member");
    });
});
