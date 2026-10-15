import { describe, expect, it } from "vitest";
import type { Zone } from "@standin/contracts";
import { buildRooms } from "@/features/game/utils/buildRooms";

const zone = (over: Partial<Zone>): Zone => ({
    kind: "private",
    x: 32,
    y: 64,
    width: 96,
    height: 64,
    ...over,
});

describe("buildRooms", () => {
    it("builds a room from a private zone with a key", () => {
        expect(
            buildRooms([zone({ key: "media", label: "Media room" })])
        ).toEqual([
            {
                key: "media",
                label: "Media room",
                x: 32,
                y: 64,
                width: 96,
                height: 64,
            },
        ]);
    });

    it("skips other kinds and zones with no key", () => {
        expect(
            buildRooms([
                zone({ kind: "area", key: "a" }),
                zone({ kind: "spawn", key: "b" }),
                zone({ key: undefined }),
            ])
        ).toEqual([]);
    });

    it("falls back to the key as label and keeps the polygon", () => {
        const polygon = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 0, y: 10 },
        ];
        const [room] = buildRooms([zone({ key: "k", polygon })]);
        expect(room?.label).toBe("k");
        expect(room?.polygon).toEqual(polygon);
    });
});
