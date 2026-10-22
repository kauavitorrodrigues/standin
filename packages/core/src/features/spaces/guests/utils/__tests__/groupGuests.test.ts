import { describe, expect, it } from "vitest";
import { MAX_CLOSED_GUESTS, type SpaceGuest } from "@standin/contracts";
import { groupGuests } from "../groupGuests";

const guest = (
    id: string,
    status: SpaceGuest["status"],
    requestedAt = "2026-10-22T12:00:00.000Z"
): SpaceGuest => ({
    id,
    spaceId: "s1",
    userId: `u-${id}`,
    name: id,
    profilePictureUrl: null,
    status,
    statusReason: "AWAITING_RESPONSE",
    respondedBy: null,
    respondedAt: null,
    expiresAt: "2026-10-23T12:00:00.000Z",
    requestedAt,
});

describe("groupGuests", () => {
    it("groups the guests by what a host can do with them", () => {
        const { pending, admitted, closed } = groupGuests([
            guest("a", "PENDING"),
            guest("b", "ADMITTED"),
            guest("c", "DENIED"),
            guest("d", "PENDING"),
        ]);

        expect(pending.map(({ id }) => id)).toEqual(["a", "d"]);
        expect(admitted.map(({ id }) => id)).toEqual(["b"]);
        expect(closed.map(({ id }) => id)).toEqual(["c"]);
    });

    it("answers the first to ask first", () => {
        const { pending } = groupGuests([
            guest("late", "PENDING", "2026-10-22T12:05:00.000Z"),
            guest("early", "PENDING", "2026-10-22T12:01:00.000Z"),
        ]);

        expect(pending.map(({ id }) => id)).toEqual(["early", "late"]);
    });

    it("shows the other groups newest first", () => {
        const { closed } = groupGuests([
            guest("old", "DENIED", "2026-10-22T10:00:00.000Z"),
            guest("new", "DENIED", "2026-10-22T11:00:00.000Z"),
        ]);

        expect(closed.map(({ id }) => id)).toEqual(["new", "old"]);
    });

    it("keeps only the most recent closed ones", () => {
        const many = Array.from({ length: MAX_CLOSED_GUESTS + 10 }, (_, i) =>
            guest(
                `g${i}`,
                "DENIED",
                new Date(Date.UTC(2026, 9, 1, 0, i)).toISOString()
            )
        );

        const { closed } = groupGuests(many);

        expect(closed).toHaveLength(MAX_CLOSED_GUESTS);
        expect(closed[0].id).toBe(`g${MAX_CLOSED_GUESTS + 9}`);
    });

    it("gives empty groups for no guests", () => {
        expect(groupGuests([])).toEqual({
            pending: [],
            admitted: [],
            closed: [],
        });
    });
});
