import { describe, expect, it } from "vitest";
import type { ConversationSummary } from "@standin/contracts";
import { sortConversationSummaries } from "../sortSummaries";

const summary = (
    id: string,
    unreadCount: number,
    createdAt: string | null
): ConversationSummary =>
    ({
        id,
        unreadCount,
        lastMessage: createdAt ? { id, createdAt } : null,
    }) as ConversationSummary;

describe("sortConversationSummaries", () => {
    it("puts unread conversations above read ones, newest first in each group", () => {
        const sorted = sortConversationSummaries([
            summary("read-new", 0, "2026-01-05T00:00:00.000Z"),
            summary("unread-old", 2, "2026-01-01T00:00:00.000Z"),
            summary("read-old", 0, "2026-01-02T00:00:00.000Z"),
            summary("unread-new", 1, "2026-01-04T00:00:00.000Z"),
        ]);

        expect(sorted.map((item) => item.id)).toEqual([
            "unread-new",
            "unread-old",
            "read-new",
            "read-old",
        ]);
    });

    it("sends conversations without messages to the end of their group", () => {
        const sorted = sortConversationSummaries([
            summary("empty", 0, null),
            summary("read", 0, "2026-01-02T00:00:00.000Z"),
        ]);

        expect(sorted.map((item) => item.id)).toEqual(["read", "empty"]);
    });
});
