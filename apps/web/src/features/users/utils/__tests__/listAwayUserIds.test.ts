import { describe, expect, it } from "vitest";
import type { RemoteStatus } from "../../types/availability";
import { listAwayUserIds } from "../listAwayUserIds";

const status = (availability: RemoteStatus["availability"]): RemoteStatus => ({
    availability,
    customStatus: null,
});

describe("listAwayUserIds", () => {
    it("lists only the people who are away", () => {
        const statuses = new Map([
            ["a", status("away")],
            ["b", status("active")],
            ["c", status("busy")],
            ["d", status("away")],
        ]);

        expect([...listAwayUserIds(statuses)]).toEqual(["a", "d"]);
    });

    it("is empty when nobody says anything", () => {
        expect(listAwayUserIds(new Map()).size).toBe(0);
    });

    it("keeps the custom status out of it", () => {
        const statuses = new Map<string, RemoteStatus>([
            [
                "a",
                {
                    availability: "active",
                    customStatus: { text: "Away", emoji: "", expiresAt: null },
                },
            ],
        ]);

        expect(listAwayUserIds(statuses).size).toBe(0);
    });
});
