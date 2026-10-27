import { beforeEach, describe, expect, it, vi } from "vitest";

const { rows } = vi.hoisted(() => ({
    rows: { queue: [] as unknown[][] },
}));

// Every query builder step returns the same thenable, which resolves to the
// next queued result.
const chain = () => {
    const builder: any = {};
    for (const step of ["from", "where", "groupBy"]) {
        builder[step] = () => builder;
    }
    builder.then = (resolve: (value: unknown[]) => unknown) =>
        resolve(rows.queue.shift() ?? []);
    return builder;
};

vi.mock("@standin/database", () => ({
    messagesTable: {},
    and: vi.fn(),
    eq: vi.fn(),
    inArray: vi.fn(),
    isNull: vi.fn(),
    sql: () => ({}),
    db: { select: () => chain() },
}));

import { MessageNotFoundError, NestedThreadError } from "@standin/contracts";
import {
    assertThreadParent,
    buildReplyPreview,
    listThreadSummaries,
} from "../threads";

beforeEach(() => {
    rows.queue = [];
});

describe("assertThreadParent", () => {
    it("accepts a top-level parent", async () => {
        rows.queue = [[{ threadParentId: null }]];
        await expect(assertThreadParent("p", "c")).resolves.toBeUndefined();
    });

    it("rejects a parent that is itself a reply", async () => {
        rows.queue = [[{ threadParentId: "root" }]];
        await expect(assertThreadParent("p", "c")).rejects.toBeInstanceOf(
            NestedThreadError
        );
    });

    it("rejects a parent that is missing from the conversation", async () => {
        rows.queue = [[]];
        await expect(assertThreadParent("p", "c")).rejects.toBeInstanceOf(
            MessageNotFoundError
        );
    });
});

describe("listThreadSummaries", () => {
    it("returns the count and last reply preview per parent", async () => {
        rows.queue = [
            [{ parentId: "p1", replyCount: 2, lastReplyId: "r2" }],
            [
                {
                    id: "r2",
                    content: "  latest  ",
                    createdAt: new Date("2026-01-02T00:00:00.000Z"),
                },
            ],
        ];

        const summaries = await listThreadSummaries(["p1", "p2"]);

        expect(summaries.get("p1")).toEqual({
            replyCount: 2,
            lastReplyAt: "2026-01-02T00:00:00.000Z",
            lastReplyPreview: "latest",
        });
        expect(summaries.has("p2")).toBe(false);
    });

    it("skips the query when there are no parents", async () => {
        expect((await listThreadSummaries([])).size).toBe(0);
    });
});

describe("buildReplyPreview", () => {
    it("is null for an attachment-only reply", () => {
        expect(buildReplyPreview(null)).toBeNull();
    });

    it("truncates long content", () => {
        expect(buildReplyPreview("a".repeat(150))).toBe(`${"a".repeat(100)}...`);
    });
});
