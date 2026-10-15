import { describe, expect, it } from "vitest";
import { MapLockStateSchema } from "../render-payload.schema";

describe("MapLockStateSchema", () => {
    it("accepts an unlocked map without a mode", () => {
        expect(MapLockStateSchema.safeParse({ locked: false }).success).toBe(
            true
        );
    });

    it("accepts a lock held in each mode", () => {
        const held = {
            locked: true,
            by: { id: "u1", name: "Ana" },
            since: "2026-10-14T12:00:00.000Z",
        };

        expect(
            MapLockStateSchema.safeParse({ ...held, mode: "map" }).success
        ).toBe(true);
        expect(
            MapLockStateSchema.safeParse({ ...held, mode: "objects" }).success
        ).toBe(true);
    });

    it("rejects an unknown mode", () => {
        expect(
            MapLockStateSchema.safeParse({ locked: true, mode: "zones" })
                .success
        ).toBe(false);
    });
});
