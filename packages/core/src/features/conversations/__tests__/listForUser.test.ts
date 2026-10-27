import { beforeEach, describe, expect, it, vi } from "vitest";

const { accessibleMock, unreadMock, usersMock, rows } = vi.hoisted(() => ({
    accessibleMock: vi.fn(),
    unreadMock: vi.fn(),
    usersMock: vi.fn(),
    rows: {
        messages: [] as unknown[],
        participants: [] as unknown[],
        spaces: [] as unknown[],
    },
}));

// Every query builder step returns the same thenable, which resolves to the
// rows of the table the query started from.
const chain = (result: () => unknown[]) => {
    const builder: any = {};
    for (const step of ["from", "where", "orderBy"]) {
        builder[step] = () => builder;
    }
    builder.then = (resolve: (value: unknown[]) => unknown) =>
        resolve(result());
    return builder;
};

vi.mock("@standin/database", () => ({
    messagesTable: {},
    conversationParticipantsTable: {},
    spacesTable: {},
    inArray: vi.fn(),
    and: vi.fn(),
    isNull: vi.fn(),
    ne: vi.fn(),
    or: vi.fn(),
    eq: vi.fn(),
    desc: vi.fn(),
    db: {
        selectDistinctOn: () => chain(() => rows.messages),
        select: (fields: Record<string, unknown>) =>
            chain(() => ("name" in fields ? rows.spaces : rows.participants)),
    },
}));
vi.mock("../findAccessible", () => ({
    findAccessibleConversations: accessibleMock,
}));
vi.mock("../reads/computeUnreadCounts", () => ({
    computeUnreadCounts: unreadMock,
}));
vi.mock("../../users", () => ({
    UserService: { findManyByIds: usersMock },
}));

import {
    CONVERSATIONS_LIST_LIMIT,
    CONVERSATIONS_SEARCH_LIMIT,
    listConversationsForUser,
} from "../listForUser";

const SPACE_CONVERSATION = {
    id: "space-c",
    type: "SPACE",
    spaceId: "s1",
};

// `count` direct conversations, each with one participant named after it.
const givenDirects = (count: number, nameOf = (i: number) => `Pessoa ${i}`) => {
    const directs = Array.from({ length: count }, (_, i) => ({
        id: `d${i}`,
        type: "DIRECT",
        spaceId: null,
    }));
    accessibleMock.mockResolvedValue([SPACE_CONVERSATION, ...directs]);
    rows.participants = directs.map((direct, i) => ({
        conversationId: direct.id,
        userId: `u${i}`,
    }));
    usersMock.mockResolvedValue(
        directs.map((_, i) => ({
            id: `u${i}`,
            name: nameOf(i),
            profilePictureUrl: null,
        }))
    );
};

describe("listConversationsForUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        rows.messages = [];
        rows.participants = [];
        rows.spaces = [{ id: "s1", name: "Escritório Central" }];
        unreadMock.mockResolvedValue({ counts: {}, total: 0 });
    });

    it("caps the default list at 10 and flags that there is more", async () => {
        givenDirects(25);

        const result = await listConversationsForUser("me", "org");

        expect(result.conversations).toHaveLength(CONVERSATIONS_LIST_LIMIT);
        expect(result.hasMore).toBe(true);
    });

    it("lists matches beyond the first 10 when searching", async () => {
        givenDirects(25, (i) => `Joao ${i}`);

        const result = await listConversationsForUser("me", "org", {
            search: "joao",
        });

        expect(result.conversations).toHaveLength(25);
        expect(result.hasMore).toBe(false);
    });

    it("caps a search at the search limit and flags that there is more", async () => {
        givenDirects(CONVERSATIONS_SEARCH_LIMIT + 5, (i) => `Joao ${i}`);

        const result = await listConversationsForUser("me", "org", {
            search: "JOÃO",
        });

        expect(result.conversations).toHaveLength(CONVERSATIONS_SEARCH_LIMIT);
        expect(result.hasMore).toBe(true);
    });

    it("matches the space conversation by the name of its space", async () => {
        givenDirects(3);

        const result = await listConversationsForUser("me", "org", {
            search: "escritorio",
        });

        expect(result.conversations.map(({ id }) => id)).toEqual(["space-c"]);
    });

    it("returns nothing when no title matches", async () => {
        givenDirects(3);

        const result = await listConversationsForUser("me", "org", {
            search: "zzz",
        });

        expect(result).toEqual({ conversations: [], hasMore: false });
    });

    it("treats a blank search as the default list", async () => {
        givenDirects(25);

        const result = await listConversationsForUser("me", "org", {
            search: "   ",
        });

        expect(result.conversations).toHaveLength(CONVERSATIONS_LIST_LIMIT);
    });

    it("returns an empty list when the user can reach no conversation", async () => {
        accessibleMock.mockResolvedValue([]);

        expect(
            await listConversationsForUser("me", "org", { search: "a" })
        ).toEqual({ conversations: [], hasMore: false });
    });
});
