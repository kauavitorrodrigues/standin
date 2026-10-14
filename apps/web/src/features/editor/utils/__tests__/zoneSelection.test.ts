import { describe, expect, it } from "vitest";
import { getZoneHandlePoints } from "@/features/editor/utils/getZoneHandlePoints";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { getSelectedZoneId } from "@/features/editor/utils/getSelectedZoneId";
import { hitTestZoneHandle } from "@/features/editor/utils/hitTestZoneHandle";
import { hitTestZones } from "@/features/editor/utils/hitTestZones";
import { moveZoneRect } from "@/features/editor/utils/moveZoneRect";
import { parseZoneSelectionId } from "@/features/editor/utils/parseZoneSelectionId";
import { pickSelectionTarget } from "@/features/editor/utils/pickSelectionTarget";
import { resizeZoneRect } from "@/features/editor/utils/resizeZoneRect";
import { toZoneSelectionId } from "@/features/editor/utils/toZoneSelectionId";
import { buildZoneModel } from "@/features/editor/lib/__tests__/fixtures/buildZoneModel";
import type { ZoneHandle } from "@/features/editor/types/zone-handle";

const zonesOf = (...args: Parameters<typeof buildZoneModel>) =>
    getLayoutZones(buildZoneModel(...args).layout);

describe("zone selection ids", () => {
    it("round-trips and never reads an object id as a zone", () => {
        expect(parseZoneSelectionId(toZoneSelectionId(7))).toBe(7);
        expect(parseZoneSelectionId("7")).toBeNull();
        expect(parseZoneSelectionId("tmp_abc")).toBeNull();
        expect(getSelectedZoneId([toZoneSelectionId(3)])).toBe(3);
        expect(getSelectedZoneId([toZoneSelectionId(3), "x"])).toBeNull();
    });
});

describe("hitTestZones", () => {
    const zones = zonesOf([
        { id: 1, kind: "area", x: 0, y: 0, w: 8, h: 8, label: "Big" },
        { id: 2, kind: "area", x: 2, y: 2, w: 3, h: 3, label: "Small" },
        { id: 3, kind: "spawn", x: 3, y: 3, w: 1, h: 1 },
    ]);

    it("picks the smallest zone among overlapping ones", () => {
        const spawn = hitTestZones({
            zones,
            worldX: 3 * 32 + 4,
            worldY: 3 * 32 + 4,
        });
        const small = hitTestZones({
            zones,
            worldX: 2 * 32 + 4,
            worldY: 2 * 32 + 4,
        });
        const big = hitTestZones({ zones, worldX: 6 * 32, worldY: 6 * 32 });

        expect(spawn?.id).toBe(toZoneSelectionId(3));
        expect(small?.id).toBe(toZoneSelectionId(2));
        expect(big?.id).toBe(toZoneSelectionId(1));
    });

    it("answers nothing outside every zone", () => {
        expect(
            hitTestZones({ zones, worldX: 9 * 32, worldY: 9 * 32 })
        ).toBeNull();
    });

    it("beats an object under it and loses to nothing deeper than 9", () => {
        const zone = hitTestZones({ zones, worldX: 6 * 32, worldY: 6 * 32 });
        const object = {
            kind: "object",
            id: "o",
            depth: 8.999,
            area: 1,
        } as const;

        expect(pickSelectionTarget([object, zone])?.kind).toBe("zone");
    });
});

describe("resizeZoneRect", () => {
    const rect = { x: 3, y: 3, w: 4, h: 4 };
    const resize = (handle: ZoneHandle, cell: [number, number]) =>
        resizeZoneRect({ rect, handle, cell, columns: 10, rows: 10 });

    it("drags each of the 8 handles", () => {
        expect(resize("nw", [1, 2])).toEqual({ x: 1, y: 2, w: 6, h: 5 });
        expect(resize("n", [9, 1])).toEqual({ x: 3, y: 1, w: 4, h: 6 });
        expect(resize("ne", [8, 1])).toEqual({ x: 3, y: 1, w: 6, h: 6 });
        expect(resize("e", [8, 0])).toEqual({ x: 3, y: 3, w: 6, h: 4 });
        expect(resize("se", [8, 8])).toEqual({ x: 3, y: 3, w: 6, h: 6 });
        expect(resize("s", [0, 8])).toEqual({ x: 3, y: 3, w: 4, h: 6 });
        expect(resize("sw", [1, 8])).toEqual({ x: 1, y: 3, w: 6, h: 6 });
        expect(resize("w", [1, 9])).toEqual({ x: 1, y: 3, w: 6, h: 4 });
    });

    it("stops at the minimum size on the side being dragged", () => {
        expect(resize("e", [0, 0])).toEqual({ x: 3, y: 3, w: 2, h: 4 });
        expect(resize("w", [9, 0])).toEqual({ x: 5, y: 3, w: 2, h: 4 });
        expect(resize("s", [0, 0])).toEqual({ x: 3, y: 3, w: 4, h: 2 });
        expect(resize("n", [0, 9])).toEqual({ x: 3, y: 5, w: 4, h: 2 });
    });

    it("stops at the map edge", () => {
        expect(resize("se", [99, 99])).toEqual({ x: 3, y: 3, w: 7, h: 7 });
        expect(resize("nw", [-5, -5])).toEqual({ x: 0, y: 0, w: 7, h: 7 });
    });
});

describe("moveZoneRect", () => {
    it("shifts the rectangle and keeps it inside the map", () => {
        const rect = { x: 3, y: 3, w: 4, h: 4 };
        const move = (delta: [number, number]) =>
            moveZoneRect({ rect, delta, columns: 10, rows: 10 });

        expect(move([1, -1])).toEqual({ x: 4, y: 2, w: 4, h: 4 });
        expect(move([50, 50])).toEqual({ x: 6, y: 6, w: 4, h: 4 });
        expect(move([-50, -50])).toEqual({ x: 0, y: 0, w: 4, h: 4 });
    });
});

describe("hitTestZoneHandle", () => {
    const rect = { x: 3, y: 3, w: 4, h: 4 };

    it("finds a handle by its point and nothing in the middle", () => {
        const points = getZoneHandlePoints(rect);

        expect(
            hitTestZoneHandle({
                rect,
                worldX: points.se.x + 2,
                worldY: points.se.y - 2,
            })
        ).toBe("se");
        expect(
            hitTestZoneHandle({ rect, worldX: points.n.x, worldY: points.n.y })
        ).toBe("n");
        expect(
            hitTestZoneHandle({ rect, worldX: 5 * 32, worldY: 5 * 32 })
        ).toBeNull();
    });
});
